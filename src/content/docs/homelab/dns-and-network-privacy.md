---
title: "🛡️ DNS & Network Privacy"
description: >-
  Build a resilient, privacy-focused home network with local DNS filtering, redundant resolvers, encrypted upstream DNS, device segmentation, Tailscale, and minimal public exposure.
---
**DNS (Domain Name System)** is the lookup service that turns names such as `example.com` into the IP addresses computers actually use. Without DNS, you would have to remember numeric addresses for websites and services instead of names.

That lookup step also gives you a useful control point. A DNS filtering server such as **AdGuard Home** or **Pi-hole** can refuse to resolve known advertising, tracking, telemetry, phishing, or malware domains before a device connects to them. Because the filtering happens on your network, it can protect TVs, phones, tablets, game consoles, appliances, and other devices that cannot run a browser extension.

:::tip[ELI5]
DNS is the internet's contact list. A DNS blocker is a contact list that can also say, “do not give this device the address for that tracker.” The basic setup is: run a DNS blocker, make your router hand its address to clients, then verify your devices are actually using it.
:::

## 🪜 Quick Start: Get Network-Wide DNS Filtering Working

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

You can improve the design later. First, get a simple setup working end to end.

1. **Choose a DNS blocker.** AdGuard Home and Pi-hole are both good choices. Start with one if this is your first setup.
2. **Give it a stable address.** Use a static IP or DHCP reservation so its address does not change.
3. **Choose an upstream DNS resolver.** This is the DNS service your blocker asks when a domain is not blocked.
4. **Test the blocker directly.** From another computer, query the blocker before changing your whole network.
5. **Configure DHCP/router DNS.** Tell your router to advertise the blocker's address to clients.
6. **Renew a client's network lease or reconnect it.** Then verify that the client is actually using the local resolver.
7. **Check the query log.** Confirm requests from the client appear and blocked domains are being refused.
8. **Add a second resolver only after the first works.** Redundancy is useful, but both advertised resolvers should normally apply the same filtering policy.
9. **Add blocklists slowly.** Start with well-maintained lists and add exceptions only when you understand what broke.
10. **Back up the configuration and test failure.** Shut down the primary resolver and confirm you know what happens.

A first-time user can stop there with a functional network-wide blocker. The rest of this page explains how to make that setup more resilient, private, and easier to troubleshoot.

## 🧩 DNS Terms You Should Know

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

- **DNS resolver** — the server your device asks to look up a domain name.
- **Upstream resolver** — the next DNS service your local blocker asks when it needs an answer.
- **DHCP** — the service that automatically gives devices their IP address, gateway, and usually DNS settings.
- **DNS filter / sinkhole** — a resolver that blocks selected domains instead of returning their normal address.
- **Primary/secondary DNS** — two resolvers a client may use; “secondary” does not necessarily mean “only if primary fails.”
- **DNS-over-HTTPS (DoH) / DNS-over-TLS (DoT)** — encrypted ways of sending DNS queries.
- **DNSSEC** — validation that helps detect forged DNS answers for signed domains.
- **Local DNS** — private names you define for devices or services inside your own network.

---

## 🛠️ Recommended Setup: AdGuard Home Primary + Pi-hole Secondary

:::tip[ELI5]
Run two DNS blockers on two different machines. Your router gives both addresses to every device. If one server is rebooting or unavailable, DNS still works—and both servers continue blocking ads, trackers, and malicious domains.
:::

This is the setup I recommend for a homelab:

```text
Clients
  │
  ├── Primary DNS: AdGuard Home
  │       └── Upstream: Quad9
  │
  └── Secondary DNS: Pi-hole
          └── Upstream: Quad9
```

Use **two different hosts** if possible. Two containers on the same physical server do not protect you from that server failing.

### Step 1 — Pick stable addresses

Give both DNS hosts a static address or DHCP reservation. Example only:

```text
AdGuard Home   192.168.1.10
Pi-hole        192.168.1.11
```

Do not copy those addresses blindly. Use addresses that fit your own LAN.

### Step 2 — Deploy AdGuard Home

If you already run Docker, this is the cleanest path:

```yaml
name: adguardhome

services:
  adguardhome:
    image: adguard/adguardhome:latest
    container_name: adguardhome
    restart: unless-stopped
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "80:80/tcp"
      - "3000:3000/tcp"
    volumes:
      - ./work:/opt/adguardhome/work
      - ./conf:/opt/adguardhome/conf
```

Before starting it, confirm nothing else is already listening on DNS port 53:

```bash
sudo ss -lntup | grep ':53 '
```

If another local resolver already owns port 53, resolve that conflict first rather than changing AdGuard to a random DNS port; normal clients expect DNS on port 53.

Start it:

```bash
mkdir -p ~/docker/adguardhome
cd ~/docker/adguardhome
nano compose.yaml

docker compose up -d
docker compose ps
```

Open the setup wizard in a browser:

```text
http://<ADGUARD-IP>:3000
```

During setup:

1. Keep DNS listening on port `53`.
2. Create a strong administrator password.
3. Under **Settings → DNS settings**, configure your upstream resolver.
4. For my preferred security-first setup, use Quad9:

```text
9.9.9.9
149.112.112.112
```

5. Leave the default AdGuard filter lists enabled initially. Do not add twenty community lists on day one.

Verify directly from another machine:

```bash
nslookup example.com <ADGUARD-IP>
```

or on Linux:

```bash
dig @<ADGUARD-IP> example.com
```

Then open **Query Log** in AdGuard Home and confirm the request appears.

### Step 3 — Deploy Pi-hole on a second host

A simple Docker Compose deployment:

```yaml
name: pihole

services:
  pihole:
    image: pihole/pihole:latest
    container_name: pihole
    restart: unless-stopped
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "80:80/tcp"
    environment:
      TZ: America/New_York
      FTLCONF_webserver_api_password: "CHANGE-ME"
      FTLCONF_dns_listeningMode: "ALL"
    volumes:
      - ./etc-pihole:/etc/pihole
```

Start it:

```bash
mkdir -p ~/docker/pihole
cd ~/docker/pihole
nano compose.yaml

docker compose up -d
docker compose ps
```

Open:

```text
http://<PIHOLE-IP>/admin
```

Then configure **Settings → DNS** and select/customize the same upstream policy you use on AdGuard Home. For consistency, I recommend Quad9 on both.

Test it directly:

```bash
dig @<PIHOLE-IP> example.com
```

### Step 4 — Tell your router to use both

In your router's **LAN / DHCP / DNS** settings, advertise:

```text
Primary DNS:   <ADGUARD-IP>
Secondary DNS: <PIHOLE-IP>
```

The exact menu name varies by router. You are looking for the DNS addresses distributed to LAN clients by DHCP—not merely the router's own WAN DNS setting.

After changing it, reconnect a test device or renew its DHCP lease.

On Debian/Linux:

```bash
resolvectl status
```

On Windows:

```powershell
ipconfig /all
```

Confirm both local DNS addresses are present.

> **Important:** clients do not universally treat "secondary" DNS as cold standby. Some operating systems may query either server. That is why **both resolvers must block** and should use approximately the same policy.

### Step 5 — Test blocking

First make sure ordinary DNS works:

```bash
nslookup example.com
```

Then browse normally and check the query logs in **both** AdGuard Home and Pi-hole. You should see client requests arriving over time.

If a site breaks, check the blocker log before randomly disabling lists. Find the blocked hostname, temporarily allow it, retest, and only keep the exception if it is actually required.

### Step 6 — Test failure

Stop AdGuard Home for a few minutes:

```bash
docker stop adguardhome
```

From a client, confirm new DNS lookups still work through Pi-hole. Then restart AdGuard Home:

```bash
docker start adguardhome
```

Repeat the test in reverse at some point. Redundancy that has never been tested is only theoretical.

### Step 7 — Back up both configurations

Back up the persistent AdGuard and Pi-hole directories with the rest of your application data. Also export application settings periodically if you make substantial filter or local-DNS changes.

**References:** [AdGuard Home](https://github.com/AdguardTeam/AdGuardHome), [Pi-hole Docker](https://docs.pi-hole.net/docker/)

---

## 🌎 If You Do Not Want DNS Blocking: Pick a Good Public Resolver

:::tip[ELI5]
You do not have to run AdGuard Home or Pi-hole. At minimum, stop automatically using whatever DNS resolver your ISP handed you and choose a reputable public resolver yourself.
:::

My recommendations are simple:

| Provider | Addresses | Best for | My take |
| :--- | :--- | :--- | :--- |
| **Quad9 Secure** | `9.9.9.9`, `149.112.112.112` | Security and privacy | **My default recommendation.** Blocks domains associated with known malicious activity and validates DNSSEC |
| **Cloudflare 1.1.1.1** | `1.1.1.1`, `1.0.0.1` | Speed and privacy | Excellent choice when latency/performance is the priority |

### Why I prefer Quad9

Quad9's secure resolver adds threat blocking at the resolver itself. If a device asks for a domain Quad9 identifies as malicious, it can refuse the lookup before a connection is made.

For a security-oriented homelab, that is useful even **behind** AdGuard Home or Pi-hole: your local blocker handles advertising/tracking policy and Quad9 provides an additional malicious-domain layer upstream.

### Why Cloudflare is an excellent alternative

Cloudflare's `1.1.1.1` is extremely fast in many locations and has explicit public-resolver privacy commitments. If you care more about raw resolver latency than upstream malware filtering, it is an excellent choice.

### Why I avoid ISP DNS

The ISP resolver is the default because it is convenient for the ISP, not because it is necessarily the best option for you. It also gives the ISP direct visibility into your DNS queries unless you use an encrypted DNS path.

### Why I do not recommend Google Public DNS as my default

Google Public DNS is technically capable and highly available, but I do not see a compelling reason to send another category of household telemetry to Google when excellent alternatives such as Quad9 and Cloudflare exist.

### Configure the resolver on your router

If you are **not** running a local blocker, set your router's LAN/DHCP DNS to one pair:

**Security-first:**

```text
9.9.9.9
149.112.112.112
```

**Speed-first:**

```text
1.1.1.1
1.0.0.1
```

Do not mix one Quad9 address with one Cloudflare address unless you intentionally want inconsistent resolver behavior.

Reconnect a client and verify the new settings with `resolvectl status`, `ipconfig /all`, or your operating system's network settings.

**References:** [Quad9 services](https://docs.quad9.net/services/), [Cloudflare 1.1.1.1](https://developers.cloudflare.com/1.1.1.1/setup/)

---

## 🧠 Advanced DNS Concepts — Optional Reading

:::tip[ELI5]
If the setup above is working, you can stop. The next sections explain additional DNS architecture, encryption, recursion, segmentation, and enforcement. They are useful when you have a reason to add them; they are not prerequisites for a good home DNS setup.
:::

## 🌐 How DNS Works

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

When you type a domain name, your device asks a DNS resolver for the address associated with that name. The resolver may already know the answer from cache or may ask other DNS servers until it can return an IP address. Your device then uses that address to connect to the destination.

For a home network, the important part is not memorizing every step in the global DNS hierarchy. It is understanding **which resolver your devices ask first**. That is where AdGuard Home or Pi-hole can apply local filtering before passing allowed requests upstream.

---

## 🧭 The Design Goal for Home DNS

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

The objective is not to create the most complicated home network possible.

It is to make the answers to these questions obvious:

1. **Which DNS resolver does each device actually use?**
2. **Which devices are allowed to communicate with trusted systems?**
3. **Which services can be reached from outside the home?**
4. **Where does DNS traffic go after it leaves the network?**
5. **What happens if the primary DNS server fails?**

A good design is understandable enough that you can still troubleshoot it six months later.

> Privacy improves when trust boundaries are explicit. Complexity without visibility usually does the opposite.

---

## 🧱 A Practical Layered Architecture

:::tip[ELI5]
A strong home-network privacy model can be represented simply: This is deliberately different from simply exposing management interfaces to the public internet.
:::

A strong home-network privacy model can be represented simply:

```text
Devices
  │
  ├── Trusted LAN
  ├── IoT network
  └── Guest network
        │
        ▼
Local DNS filtering
  │
  ├── Primary resolver
  └── Secondary resolver
        │
        ▼
Encrypted or otherwise trusted upstream DNS
        │
        ▼
Internet
```

Remote access is handled separately:

```text
Remote device
     │
     ▼
Private mesh VPN
     │
     ▼
Selected internal services
```

This is deliberately different from simply exposing management interfaces to the public internet.

---

## 🛡️ What DNS Filtering Actually Does

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

A DNS filtering server such as **AdGuard Home** or **Pi-hole** sits between your devices and upstream DNS.

When an application asks:

```text
Where is tracker.example.com?
```

the resolver can answer normally or refuse to resolve it based on your filtering rules.

This makes network-level filtering useful for:

- Advertising domains
- Analytics and tracking endpoints
- Smart-device telemetry
- Known malware infrastructure
- Phishing domains
- Unwanted application services
- Devices where browser extensions are impossible

The major advantage is **coverage**. TVs, appliances, tablets, phones, game consoles, streaming devices, and embedded systems can all benefit without installing anything locally.

---

## 🚧 What DNS Filtering Cannot Do

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

DNS filtering should never be treated as a complete privacy or security boundary.

It cannot reliably block:

- Tracking hosted on the same domain as required content
- First-party analytics
- Hard-coded IP connections
- Applications using their own encrypted DNS
- Traffic to already-resolved addresses
- Shared CDN infrastructure without collateral damage
- Browser fingerprinting
- Account-based tracking
- Identifiers embedded inside application traffic

For example, if a service hosts both legitimate API calls and telemetry at the same hostname, DNS cannot distinguish between the two.

> DNS answers **where** a client should connect. It does not inspect or understand the application data exchanged afterward.

This is why DNS filtering works best alongside browser protections, application permissions, network segmentation, and sensible account practices.

---

## 🥇 Primary and Secondary DNS

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

Running two independent local DNS resolvers provides useful redundancy.

A practical arrangement is:

- **Primary:** AdGuard Home
- **Secondary:** Pi-hole

The specific products are less important than having **two independently functioning resolvers**.

If the primary host is rebooting, being upgraded, or has failed, clients still need to resolve names.

### Important: Secondary Does Not Mean Standby

Many operating systems do **not** treat the second DNS server as a strict cold standby.

Clients may query either resolver depending on:

- response time
- operating-system behavior
- previous failures
- network conditions

Therefore both resolvers should enforce approximately the same policy.

If one blocks telemetry and the other allows everything, filtering behavior becomes inconsistent.

---

## 🔁 Keep Redundant Resolvers Consistent

:::tip[ELI5]
At minimum, keep these aligned between your DNS servers: They do not have to be byte-for-byte clones.
:::

At minimum, keep these aligned between your DNS servers:

- Core blocklists
- Important allowlists
- Local DNS records
- Custom rewrites
- Upstream resolver policy
- Internal-domain behavior

They do not have to be byte-for-byte clones.

For example, one server can be AdGuard Home and the other Pi-hole. The goal is **policy equivalence**, not identical software.

Document intentional differences so they do not later look like configuration drift.

---

## 🧪 Test DNS Failover Before You Need It

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

Do not assume that supplying two DNS addresses means redundancy works.

Test it.

A simple process:

1. Confirm a client is receiving both resolvers.
2. Resolve several normal domains.
3. Confirm known blocked domains fail.
4. Stop the primary resolver.
5. Repeat the tests.
6. Restore the primary.
7. Confirm normal operation resumes.

From Linux:

```bash
resolvectl status
```

or, depending on the system:

```bash
cat /etc/resolv.conf
```

Then query a particular resolver directly:

```bash
dig @DNS_SERVER example.com
```

or:

```bash
nslookup example.com DNS_SERVER
```

Testing each resolver independently is much more useful than merely confirming that "the internet works."

---

## 🌐 DHCP Should Advertise Your Local DNS

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

For most home networks, the cleanest configuration is for DHCP to automatically give clients the addresses of your local DNS resolvers.

That provides:

- Consistent filtering
- Minimal per-device configuration
- Easy DNS changes later
- Coverage for devices with limited settings

You should not have to manually configure every phone, laptop, television, and appliance.

After changing DHCP/DNS settings, remember that existing clients may retain their old lease until they renew it.

Reconnect the device or renew DHCP before concluding that the new DNS policy is broken.

---

## 🔍 Verify the Resolver a Client Is Really Using

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

Never assume that a client is using your network DNS simply because you configured it at the router.

On Linux:

```bash
resolvectl query example.com
```

```bash
resolvectl status
```

Or use:

```bash
dig example.com
```

On systems without those tools:

```bash
nslookup example.com
```

Also check the DNS dashboard itself. A query arriving from the device is strong evidence that the expected path is actually being used.

---

## 🌎 Choosing an Upstream Resolver

:::tip[ELI5]
Your local DNS server still needs somewhere to ask for allowed domains; this section explains that next hop.
:::

Your local DNS server ultimately needs somewhere to send queries that are not already cached or answered locally.

Common choices include:

- Privacy-focused public DNS providers
- Security-filtering DNS providers
- Your ISP resolver
- Your VPN provider's DNS
- A locally operated recursive resolver

There is no trust-free public resolver.

Changing upstream DNS primarily changes **who receives your recursive queries**.

Ask:

- Who operates the resolver?
- What do they log?
- How long is data retained?
- Is filtering performed?
- Is DNSSEC validation supported?
- Is encrypted transport available?
- Does the provider have a sustainable business model?

Avoid choosing purely from benchmark latency screenshots.

Privacy policy and reliability matter more than shaving a few milliseconds from an occasional uncached lookup.

---

## 🔐 Encrypted Upstream DNS

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

Traditional DNS normally travels unencrypted between the resolver and upstream DNS server.

Two common encrypted alternatives are:

- **DNS over TLS (DoT)**
- **DNS over HTTPS (DoH)**

These can prevent passive observers on the local or ISP network from trivially reading DNS queries between your resolver and upstream provider.

However, encrypted DNS does **not** make queries invisible to the upstream provider.

The provider still has to answer them.

### What Encryption Protects

It protects the transport path:

```text
Local DNS server
      │
      │ encrypted
      ▼
Upstream provider
```

It does not eliminate trust in the endpoint.

> Encryption protects data **in transit**. Privacy policy determines what happens **after arrival**.

---

## 🧩 Recursive DNS as an Alternative

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

Instead of sending all requests to one public resolver, you can run your own recursive resolver using software such as Unbound.

Conceptually:

```text
Client
  ↓
AdGuard Home / Pi-hole
  ↓
Local recursive resolver
  ↓
DNS root → TLD → authoritative server
```

Advantages include:

- Less dependency on a single public recursive provider
- Greater control over DNS behavior
- Useful learning experience

Tradeoffs include:

- More components to operate
- More troubleshooting complexity
- Cold-cache queries may be slower
- Your public IP still makes authoritative DNS requests directly

Self-hosting recursion is useful, but it is not automatically "more private" in every threat model.

Use it because its operational tradeoffs fit your goals, not because recursion is automatically more private or secure.

---

## ✅ DNSSEC

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

DNSSEC allows a validating resolver to verify cryptographic signatures attached to DNS data for domains that support it.

It helps protect against certain forms of forged DNS responses.

DNSSEC does **not** encrypt queries and does not hide which domains you request.

Think of it as an authenticity mechanism rather than a confidentiality mechanism.

When your chosen resolver supports DNSSEC validation reliably, enabling it is generally sensible.

---

## 🕵️ Browser Secure DNS Can Bypass Network Policy

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

Modern browsers may enable their own DoH implementation.

This can result in a path like:

```text
Browser
   │
   └──────────────► External DoH provider

Local AdGuard/Pi-hole never sees the query.
```

That may be desirable if browser-level encrypted DNS is your intentional privacy strategy.

It is undesirable if your goal is consistent network-wide policy.

Pick a model deliberately:

### Network DNS is authoritative

Disable or configure browser secure DNS so normal queries continue through the local resolver.

### Browser DNS is authoritative

Allow the browser to use a selected DoH provider and accept that local filtering will not necessarily apply.

### Mixed model

Use network DNS normally but allow specific applications to use their own provider where there is a clear reason.

The worst option is not knowing which model you are running.

---

## 📱 Mobile Devices May Have Similar Overrides

:::tip[ELI5]
When troubleshooting, inspect the endpoint rather than assuming the router controls everything.
:::

Phones and tablets can also bypass expected DNS through:

- Private DNS settings
- VPN applications
- DNS-filtering applications
- Security products
- Browser-specific DoH

When troubleshooting, inspect the endpoint rather than assuming the router controls everything.

---

## 📺 IoT Deserves Less Trust

:::tip[ELI5]
Smart televisions, speakers, appliances, cameras, streaming devices, and other IoT products often combine: Where your network equipment permits it, put lower-trust devices on a separate network or VLAN.
:::

Smart televisions, speakers, appliances, cameras, streaming devices, and other IoT products often combine:

- Long support lifetimes
- Infrequent security updates
- Cloud dependencies
- Telemetry
- Closed-source firmware
- Limited local administrative controls

They should not automatically receive the same network trust as:

- Personal computers
- Servers
- NAS systems
- Administrative workstations

Where your network equipment permits it, put lower-trust devices on a separate network or VLAN.

---

## 🧱 IoT Segmentation

:::tip[ELI5]
This is much stronger than merely filtering DNS.
:::

A useful policy is:

```text
IoT device
   │
   ├── Internet              ✓ when needed
   ├── Local DNS             ✓
   ├── Required controller   ✓ selectively
   ├── Trusted computers     ✗ by default
   ├── Server management     ✗
   └── NAS administration    ✗
```

This is much stronger than merely filtering DNS.

If a compromised device cannot initiate connections to sensitive systems, the damage it can cause is constrained.

### Avoid Over-Segmentation

Segmentation becomes counterproductive when every normal task requires debugging firewall rules.

Start with meaningful trust boundaries:

- Trusted devices
- IoT devices
- Guests

Add more segments only when the security benefit justifies the operational complexity.

---

## 👥 Guest Networks

:::tip[ELI5]
This section covers a network dependency or boundary you should understand before adding more complexity.
:::

Guest devices should usually have:

- Internet access
- DNS resolution
- No administrative access to infrastructure
- No access to trusted client devices
- No access to private storage

A guest network is useful even when you trust the person using it.

Their phone, tablet, or laptop may not have the same security posture as your own systems.

---

## 🧠 Local DNS Names

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

Local DNS is useful for providing stable, readable names for internal services.

Instead of remembering:

```text
https://10.x.x.x:12345
```

use a name such as:

```text
https://service.home.example.com
```

This works especially well with a reverse proxy and wildcard TLS certificate.

See [Nginx Proxy Manager](/homelab/nginx-proxy-manager/).

### Keep Internal Naming Private

Avoid publishing unnecessary internal hostnames in:

- Public Git repositories
- Screenshots
- Documentation
- Public DNS records
- Certificate names when a wildcard can be used instead

The network architecture can be documented without publishing its addressing plan.

---

## 🔒 Tailscale for Private Remote Access

:::tip[ELI5]
This section explains private remote access through your tailnet rather than exposing the service directly to the internet.
:::

A private mesh VPN dramatically reduces the need to expose infrastructure directly to the internet.

Tailscale is particularly useful for:

- Server administration
- NAS access
- Internal web applications
- SSH
- Remote diagnostics
- Access to management interfaces

The preferred model is:

```text
Internet
   │
   ✗ no direct management exposure

Authorized remote device
   │
   ▼
Tailscale
   │
   ▼
Private services
```

See the full [Tailscale guide](/homelab/tailscale/).

---

## 🧭 Tailscale DNS and MagicDNS

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

Tailscale can also distribute DNS settings to devices on your tailnet.

This can make the same private service names work both:

- at home
- while traveling

Useful features include:

- MagicDNS
- Tailnet DNS servers
- Split DNS
- Search domains

Keep the design as simple as possible.

DNS becomes difficult to troubleshoot when:

- the LAN distributes one resolver
- Tailscale distributes another
- the browser uses DoH
- the operating system has a manually configured resolver

Document which layer is expected to win.

---

## 🔀 Reverse Proxy vs VPN

:::tip[ELI5]
This section explains how one front-end service can route friendly web names to the correct internal application.
:::

A reverse proxy and a private VPN solve different problems.

### Reverse Proxy

Provides:

- Friendly hostnames
- TLS termination
- Central routing
- One ingress layer for web applications

### Private VPN

Provides:

- Device-level private connectivity
- Remote administration
- Access without public exposure

They work extremely well together.

For example:

```text
Remote laptop
    │
    ▼
Tailscale
    │
    ▼
Reverse proxy
    │
    ▼
Internal application
```

You get clean HTTPS URLs without opening those applications to the public internet.

---

## 🚪 Minimize Public Exposure

:::tip[ELI5]
Do not expose services merely because they have a login screen.
:::

Do not expose services merely because they have a login screen.

Administrative interfaces should generally remain private, especially:

- Hypervisors
- NAS administration
- Container-management interfaces
- DNS administration
- Router management
- Monitoring systems
- SSH
- Database interfaces

A login page is not the same thing as a network boundary.

Prefer, in order:

1. LAN-only access
2. Private VPN access
3. Authenticated reverse proxy when remote browser access is necessary
4. Direct public exposure only when the application genuinely requires it

---

## 🌍 When Public Exposure Is Necessary

:::tip[ELI5]
Some services are intentionally public.
:::

Some services are intentionally public.

If an application must be internet-accessible, add defensive layers rather than pretending the risk does not exist.

Consider:

- TLS everywhere
- Strong unique credentials
- MFA where supported
- Identity-aware authentication
- Reverse proxying
- Timely updates
- Rate limiting
- Narrow firewall rules
- Logging and alerting
- Regular vulnerability review

Do not expose an administrative backend simply because the user-facing application must be public.

Separate those access paths where possible.

---

## 🚫 Hard-Coded DNS

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

Some devices ignore DHCP-provided DNS and attempt to contact public resolvers directly.

Typical traffic includes:

```text
UDP/53
TCP/53
```

More advanced networks may block or redirect outbound plaintext DNS so that only approved resolvers can make those connections.

Conceptually:

```text
Client DNS request
      │
      ├── approved local resolver → allowed
      │
      └── public DNS directly     → blocked/redirected
```

### Be Careful with Forced DNS

DNS interception can break:

- devices with unusual firmware
- corporate VPNs
- DNSSEC behavior
- captive portals
- troubleshooting assumptions

Test gradually.

The goal is predictable policy, not maximum cleverness.

---

## 🔐 DoH Makes Enforcement Harder

:::tip[ELI5]
Blocking direct TCP/UDP port 53 does not prevent a device from using DNS-over-HTTPS because DoH normally looks like ordinary HTTPS traffic on port 443.
:::

Blocking direct TCP/UDP port 53 does not prevent a device from using DNS-over-HTTPS because DoH normally looks like ordinary HTTPS traffic on port 443.

Blocking all possible DoH endpoints is difficult and can become a permanent maintenance project.

For untrusted IoT devices, segmentation often provides more meaningful security than trying to guarantee that every DNS lookup passes through your filter.

This is an important distinction:

> If a device can bypass DNS filtering but still cannot reach sensitive internal systems, your strongest boundary is intact.

---

## 🧯 Blocking More Is Not Always Better

:::tip[ELI5]
It is easy to become fixated on the number of blocked queries shown in a DNS dashboard.
:::

It is easy to become fixated on the number of blocked queries shown in a DNS dashboard.

That number is not a security score.

Aggressive blocklists can cause:

- broken authentication
- failed application updates
- missing embedded content
- smart-home malfunctions
- difficult-to-diagnose intermittent failures

Prefer high-quality, maintained lists over enormous collections assembled for impressive statistics.

When something breaks, determine **why** before adding a permanent allowlist entry.

---

## 📝 Allowlisting Discipline

:::tip[ELI5]
when only one specific subdomain is required.
:::

When you must allow a blocked domain:

1. Identify the exact domain being blocked.
2. Understand which application requested it.
3. Determine what functionality depends on it.
4. Allow the narrowest possible domain.
5. Add a comment explaining why.
6. Revisit old exceptions periodically.

Avoid broad rules such as:

```text
@@||example.com^
```

when only one specific subdomain is required.

Today's troubleshooting exception becomes tomorrow's forgotten hole unless it is documented.

---

## 📋 Blocklist Strategy

:::tip[ELI5]
Use a small number of reputable lists with clear purposes.
:::

Use a small number of reputable lists with clear purposes.

Possible categories include:

- General advertising/tracking
- Malware and phishing
- Smart-device telemetry
- Known malicious infrastructure

Avoid loading dozens of highly overlapping lists simply because the DNS server can handle them.

More lists often produce diminishing returns and more false positives.

### Review Before Adding

Ask:

- Is the list maintained?
- When was it last updated?
- What is its stated scope?
- Does it overlap heavily with an existing list?
- Does it have a documented false-positive process?

A curated policy is easier to trust than a giant pile of URLs.

---

## 📊 DNS Logs Are Sensitive Too

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

DNS logs reveal a surprising amount about household behavior.

They can show:

- Which services are used
- Which devices are active
- Approximate usage times
- Software update activity
- Smart-device communication patterns

Treat DNS logs as private operational data.

Consider:

- Reasonable retention periods
- Restricted dashboard access
- No public administration interface
- Backing up configuration rather than unnecessary long-term query history

Collect enough data to troubleshoot and understand the network, not simply because storage is cheap.

---

## 🧹 Client Naming and Privacy

:::tip[ELI5]
This section explains a privacy control, what it helps with, and where its limits are.
:::

Readable client names make DNS dashboards more useful, but there is no reason to expose those names publicly.

Use descriptive internal names where helpful while keeping screenshots and public documentation generalized.

For example, public documentation can say:

```text
Primary server
AI workstation
Media device
IoT television
```

rather than publishing the actual internal hostname scheme.

---

## 🌐 External VPN Services Are a Separate Layer

:::tip[ELI5]
It does **not** replace: It also shifts trust from the ISP toward the VPN provider.
:::

A commercial VPN service changes the path of internet traffic:

```text
Device
  │ encrypted tunnel
  ▼
VPN provider
  │
  ▼
Internet
```

This can:

- Hide destination traffic from the ISP
- Change the public egress IP
- Provide privacy on untrusted networks

It does **not** replace:

- DNS filtering
- Browser privacy protections
- Account hygiene
- Endpoint security
- Network segmentation

It also shifts trust from the ISP toward the VPN provider.

Choose accordingly.

---

## 🛰️ Tailscale Is Not the Same as a Commercial VPN

:::tip[ELI5]
This section explains private remote access through your tailnet rather than exposing the service directly to the internet.
:::

Tailscale is primarily a **private networking tool**, not an anonymity service.

A standard Tailscale connection between your laptop and home server protects that private connection but does not automatically route all general internet traffic through another egress point.

An exit node can do that, but it serves a different purpose than Tailscale's basic mesh connectivity.

Distinguish:

- **Remote access VPN:** reach your private systems
- **Commercial privacy VPN:** change internet egress and ISP visibility
- **Exit node:** intentionally route traffic through another node you control

Using the same word "VPN" for all three causes unnecessary confusion.

---

## 📡 Wi-Fi Privacy Still Matters

:::tip[ELI5]
This section explains a privacy control, what it helps with, and where its limits are.
:::

DNS filtering does nothing to fix poor wireless security.

Use modern Wi-Fi security where supported:

- WPA3 when practical
- Strong WPA2/WPA3 credentials
- Separate guest access
- Disable obsolete protocols
- Keep access-point firmware current

Avoid handing visitors the credential used by trusted infrastructure simply because creating a guest network takes an extra minute.

---

## 🧰 Troubleshooting DNS Problems

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

When an application breaks, troubleshoot methodically.

### 1. Confirm basic network connectivity

```bash
ping 1.1.1.1
```

A successful IP ping with failed name resolution strongly suggests a DNS issue.

### 2. Query your resolver

```bash
dig example.com
```

### 3. Query a particular DNS server

```bash
dig @DNS_SERVER example.com
```

### 4. Inspect the filter log

Look for blocked requests from the affected client.

### 5. Temporarily disable filtering

If the application immediately works, filtering is likely involved.

### 6. Find the narrowest required exception

Do not immediately disable an entire list or allow a parent domain.

---

## 🧪 A Practical Privacy Validation Routine

:::tip[ELI5]
This section explains a privacy control, what it helps with, and where its limits are.
:::

Periodically test representative devices from each trust category.

### Trusted computer

Verify:

- Expected DNS resolver
- DNS blocking works
- Remote access works
- Internal names resolve

### IoT device

Verify:

- Internet access works as intended
- Local DNS is reachable
- Sensitive internal systems are not reachable
- Required controller access still works

### Guest device

Verify:

- Internet access works
- Trusted LAN resources are isolated
- Administration interfaces are inaccessible

### Remote Tailscale device

Verify:

- Tailnet connectivity
- Intended internal names resolve
- Selected services work
- Unnecessary network access is not granted

Network diagrams describe intent. Testing confirms reality.

---

## 📈 What to Monitor

:::tip[ELI5]
This section focuses on a signal that helps you notice a real problem before or while it affects a service.
:::

DNS infrastructure usually needs only a few meaningful health signals:

- Resolver availability
- Query failures
- Excessive upstream latency
- Blocklist update failures
- Disk exhaustion
- Abnormal query spikes
- Loss of the secondary resolver

Do not turn normal telemetry-heavy devices into a constant stream of meaningless alerts.

Monitoring should identify conditions that require action.

See [Monitoring & Management](/homelab/monitoring-and-management/).

---

## 💾 Back Up DNS Configuration

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

DNS infrastructure may be small, but rebuilding all of its policy from memory is annoying.

Back up or export:

- Filtering configuration
- Local DNS entries
- Rewrites
- Allowlists
- Custom block rules
- Upstream configuration

You generally do not need years of query logs to recover the service.

Configuration is the valuable state.

See [Backup & Recovery](/homelab/backup-and-recovery/).

---

## 🧯 DNS Failure Should Not Take Down the House

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

A DNS outage often looks like a complete internet failure even though connectivity is otherwise fine.

Design for easy recovery:

- Two local resolvers
- Separate failure domains when practical
- Configuration backups
- Known-good upstreams
- Documented recovery procedure
- Ability to temporarily use a trusted external resolver during repair

The best redundant DNS server is one you have actually tested during a primary outage.

---

## 🛠️ Recommended Baseline

:::tip[ELI5]
For a practical privacy-oriented home network, a strong baseline is: This provides most of the practical benefit without turning a home network into an enterprise networking lab.
:::

For a practical privacy-oriented home network, a strong baseline is:

| Layer | Recommendation |
| :--- | :--- |
| DNS filtering | Two local resolvers |
| Policy | Consistent block/allow rules |
| DHCP | Advertise both local DNS servers |
| Upstream | Deliberately selected resolver(s) |
| DNS transport | Encrypted upstream when appropriate |
| DNSSEC | Validate where reliably supported |
| Trusted devices | Main LAN |
| IoT | Separate network/VLAN |
| Guests | Separate guest network |
| Remote administration | Private mesh VPN |
| Internal web services | Reverse proxy + private access |
| Admin interfaces | Never public by convenience |
| Backups | Export resolver configuration |
| Validation | Test DNS and segmentation periodically |

This provides most of the practical benefit without turning a home network into an enterprise networking lab.

---

## ⚠️ Common Mistakes

:::tip[ELI5]
These are recurring mistakes worth checking before assuming the underlying tool is broken.
:::

### Treating the secondary DNS server as unused standby

Clients may query both. Keep policy aligned.

### Assuming router DNS settings control every application

Browsers, VPNs, phones, and devices may bypass them.

### Adding enormous blocklists without understanding them

False positives grow faster than practical privacy benefits.

### Giving IoT devices full LAN access

DNS filtering does not compensate for an unnecessary trust relationship.

### Publishing every internal application through a reverse proxy

A reverse proxy does not automatically mean a service belongs on the public internet.

### Exposing management interfaces because they have passwords

Keep administration behind the LAN or a private VPN.

### Collecting DNS logs forever

Operational telemetry is also sensitive data.

### Building an architecture too complicated to troubleshoot

A simpler design that you understand is usually safer than a theoretically perfect one that you do not.

---

## 🔗 Related Guides

:::tip[ELI5]
This section explains related guides in practical terms and what it changes in the homelab.
:::

- [Tailscale VPN](/homelab/tailscale/) — private remote access
- [Nginx Proxy Manager](/homelab/nginx-proxy-manager/) — private HTTPS and reverse proxying
- [Docker Infrastructure Standards](/homelab/docker-infrastructure-standards/) — consistent service deployment
- [Monitoring & Management](/homelab/monitoring-and-management/) — infrastructure health monitoring
- [Backup & Recovery](/homelab/backup-and-recovery/) — protecting configuration and application state
- [RebelRx Setup](/privacy/my-setup/) — high-level architecture of the current environment

---

## ✅ What to Remember

:::tip[ELI5]
This is the short version to keep in mind after you finish the page.
:::

Good network privacy is not measured by the number of blocked domains on a dashboard.

It comes from **reducing unnecessary trust**:

- Devices should use DNS policy you understand
- Low-trust devices should not have unrestricted access to high-value systems
- Administrative interfaces should remain private
- Remote access should be authenticated and encrypted
- Public exposure should be intentional rather than convenient

DNS filtering is one of the easiest and most effective layers to add, but its real value appears when it becomes part of a broader architecture built around **least privilege, visibility, redundancy, and deliberate trust**.
