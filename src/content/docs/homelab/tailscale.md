---
title: "🔒 Tailscale VPN for Homelab Remote Access"
description: >-
  Securely reach your homelab with Tailscale on Debian and other devices, then optionally add MagicDNS, subnet routing, exit nodes, and access-control rules without exposing administrative services directly to the internet.
---
**Tailscale** creates a private network between your own devices using WireGuard encryption. It is useful when you want to reach a server, NAS, dashboard, or other homelab service while away from home without forwarding that service's port to the public internet.

:::tip[ELI5]
Tailscale makes your laptop, phone, and homelab machines behave as if they are on the same private network even when they are in different places. You install it on the devices, sign them into the same tailnet, and then connect using their private Tailscale addresses or names.
:::

## 🪜 What You Will Do

:::tip[ELI5]
This section explains what you will do in practical terms and what it changes in the homelab.
:::

1. Install Tailscale on a homelab machine.
2. Join it to your tailnet.
3. Install Tailscale on your remote device.
4. Test direct access to the homelab machine.
5. Enable MagicDNS if you want names instead of IP addresses.
6. Optionally configure a subnet router to reach devices that cannot run Tailscale themselves.
7. Optionally configure an exit node if you specifically need one.
8. Review access-control policy before adding lower-trust users or devices.

## 🧩 Tailscale Terms You Should Know

:::tip[ELI5]
This section explains private remote access through your tailnet rather than exposing the service directly to the internet.
:::

- **Tailnet** — your private Tailscale network.
- **Node** — a device joined to that network.
- **WireGuard** — the encrypted tunneling protocol used for Tailscale's data plane.
- **MagicDNS** — Tailscale's naming system for reaching devices by name.
- **Subnet router** — a Tailscale node that provides access to another local network subnet.
- **Exit node** — a Tailscale node that can route a client's general internet traffic.

The main server path below uses Debian 13. An Artix/OpenRC example is included because the client workflow is slightly different there.

---

## ✅ What You Need to Know First

:::tip[ELI5]
Port forwarding exposes services to the entire internet and hopes your login pages hold.
:::

> Keep administrative access private by default. Expose only the services that genuinely need public access.

For administrative services, a mesh VPN is usually simpler and safer than publishing management ports to the internet. Only authenticated devices that your tailnet policy allows can reach those private paths.

---

## 🧭 What Tailscale Is

:::tip[ELI5]
This section explains private remote access through your tailnet rather than exposing the service directly to the internet.
:::

Tailscale builds a private mesh network (a "tailnet") between your devices using **WireGuard**, the modern, audited VPN protocol used for the encrypted data plane. Tailscale commonly implements WireGuard in userspace.

- Every enrolled device gets a tailnet IP (`100.x.y.z`)
- Devices connect **directly to each other** (peer-to-peer) whenever possible
- Traffic is end-to-end encrypted between your devices
- Works through NAT and firewalls with zero router configuration

> Your server, laptop, and phone behave as if they're on the same LAN from anywhere.

---

## ⚖️ The Honest Tradeoff

:::tip[ELI5]
Tailscale is not fully self-hosted by default.
:::

Tailscale is not fully self-hosted by default. Understand what you're trusting:

| Component | Status |
| :--- | :--- |
| Clients (`tailscaled`) | Open source |
| Encryption (WireGuard) | Open source, end-to-end |
| Coordination server | **Hosted by Tailscale Inc. (closed source)** |

The coordination server only exchanges public keys and connection metadata; it **cannot decrypt your traffic**. But it does see which devices exist and when they connect.

:::tip[Self-hosted control-server option: Headscale]
[Headscale](https://github.com/juanfont/headscale) is an open-source, self-hostable
replacement for Tailscale's coordination server. The official Tailscale clients
connect to it directly.

If you specifically want to self-host the coordination layer, Headscale is an option. It requires its own control-server URL and policy setup, so follow Headscale's registration instructions rather than assuming the hosted Tailscale commands are identical.
:::
---

## ⚙️ Requirements

:::tip[ELI5]
Check the current [Tailscale plans](https://tailscale.com/pricing) for user, device, and feature limits; plan allowances can change.
:::

- A Debian 13 server or another supported Linux system
- A free Tailscale account → <https://login.tailscale.com/start>
  - Choose whichever supported sign-in method fits your account-security preferences; protect the account with strong MFA/passkeys where available.

Check the current [Tailscale plans](https://tailscale.com/pricing) for user, device, and feature limits; plan allowances can change.

---

## 📦 Install on Debian 13 (Server)

:::tip[ELI5]
Install the Tailscale package, start the service, then run one command that gives you a login link. After authentication, the server becomes a node on your private tailnet.
:::

### 1. Add the Tailscale Repository

```bash
sudo mkdir -p --mode=0755 /usr/share/keyrings

curl -fsSL https://pkgs.tailscale.com/stable/debian/trixie.noarmor.gpg | \
  sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg > /dev/null

curl -fsSL https://pkgs.tailscale.com/stable/debian/trixie.tailscale-keyring.list | \
  sudo tee /etc/apt/sources.list.d/tailscale.list > /dev/null

sudo apt update
sudo apt install -y tailscale
```

### 2. Verify the Daemon

The package installs a systemd service on Debian. Confirm it is running:

```bash
sudo systemctl enable --now tailscaled
sudo systemctl status tailscaled --no-pager
```

### 3. Join Your Tailnet

```bash
sudo tailscale up
```

Open the printed URL, authenticate, and approve the device if your tailnet policy requires it.

Verify:

```bash
tailscale status
tailscale ip -4
```

The node should now be reachable from another permitted Tailscale device.

## 🖥️ Install on Artix (Desktop / Laptop)

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

Artix packages the init scripts separately per init system:

```bash
sudo pacman -S tailscale tailscale-openrc
sudo rc-update add tailscaled default
sudo rc-service tailscaled start
sudo tailscale up
```

(For runit or s6, install `tailscale-runit` or `tailscale-s6` instead.)

This matches the post-install section of the [Artix Desktop Install Guide](/linux/artix-kde-openrc-install/).

---

## 📱 Other Devices

:::tip[ELI5]
Devices can reach one another only as allowed by the tailnet policy and host firewall.
:::

Install the Tailscale app on your phone or tablet and sign in to the same account:

- Android → F-Droid or Play Store
- iOS → App Store

Devices can reach one another only as allowed by the tailnet policy and host firewall. Review the initial policy before adding shared users or lower-trust devices.

---

## 🌐 MagicDNS (Names Instead of IPs)

:::tip[ELI5]
This section explains how name lookups affect the network and what you should configure or verify.
:::

In the Tailscale admin console → **DNS**, enable **MagicDNS**.

Now instead of memorizing addresses:

```bash
ssh user@100.xx.xx.xx
```

You use machine names:

```bash
ssh user@machinename
```

Rename machines in the admin console (**Machines** → the `…` menu) to keep names clean and predictable.

---

## 🔑 Disable Key Expiry on Servers

:::tip[ELI5]
By default, every node's keys expire after ~6 months, and the node **drops off your tailnet until you re-authenticate it interactively**.
:::

By default, every node's keys expire after ~6 months, and the node **drops off your tailnet until you re-authenticate it interactively**.

Fine for laptops. Frustrating for headless servers.

In the admin console → **Machines** → your server → `…` → **Disable key expiry**.

---

## 🏠 Subnet Router (Reach Your Whole LAN)

:::tip[ELI5]
Some devices can't run Tailscale — a NAS, printers, IoT appliances, IPMI interfaces.
:::

Some devices can't run Tailscale — a NAS, printers, IoT appliances, IPMI interfaces. A **subnet router** lets one Tailscale node bridge your whole LAN.

### 1. Enable IP Forwarding (on the subnet-router server)

```bash
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 2. Advertise Your LAN Subnet

```bash
sudo tailscale set --advertise-routes=192.0.2.0/24
```

(Replace the reserved documentation subnet with your actual LAN subnet. Do not publish that value in your public guide.)

### 3. Approve the Route

Admin console → **Machines** → your server → **Edit route settings** → approve the subnet.

Now your phone on cellular can reach devices on the approved subnet devices as if you were home — NAS web UI, printer, everything.

> One subnet router replaces installing Tailscale on every device you own.

---

## 🚪 Exit Node (Optional)

:::tip[ELI5]
An exit node routes **all** of a device's internet traffic through your device's connection which is useful when traveling, particularly on hotel or airport Wi-Fi.
:::

An exit node routes **all** of a device's internet traffic through your device's connection which is useful when traveling, particularly on hotel or airport Wi-Fi.

A real-world example: you set your Apple TV at home with Tailscale installed as an exit node. While traveling to another country connected to public Wi-Fi at a local internet cafe, your phone's connection is routed securely through your Apple TV so your traffic and location can't be sniffed by the local ISP or public scammers. 

On the server:

```bash
sudo tailscale set --advertise-exit-node
```

Approve it in the admin console (same place as routes). Then on your laptop or phone, select the server as your exit node when on untrusted networks.

:::tip
Use `tailscale set` to change selected preferences on an already connected node. `tailscale up` may require previously configured non-default flags and reports what is missing. See the [CLI reference](https://tailscale.com/docs/reference/tailscale-cli).
:::
---

## 🐳 Accessing Homelab Services

:::tip[ELI5]
With Tailscale up, your [Docker services](/homelab/docker-home-lab/) are reachable with **zero exposed ports**.
:::

With Tailscale up, your [Docker services](/homelab/docker-home-lab/) are reachable with **zero exposed ports**:

```text
http://homemachine:8096    → Jellyfin
http://homemachine:2283    → Immich
http://127.0.0.1:8181      → NPM admin through the SSH tunnel on your client
```

The clean pattern:

- Docker services bind to the host (or to the Tailscale IP only)
- Nginx Proxy Manager routes internal hostnames
- Tailscale is the intended remote path; LAN-bound ports may also be reachable locally
- Router port forwarding: **none**

> Verify reachability explicitly. IPv6, UPnP/NAT-PMP, tunnels, and Docker bindings can create access paths without a manual IPv4 port-forward.

---

## 🛡️ ACLs (Lock Down Who Reaches What)

:::tip[ELI5]
By default, every device on your tailnet can reach every other device.
:::

By default, every device on your tailnet can reach every other device. For a single-user homelab that's acceptable — but tighten it as you grow.

In the admin console → **Access Controls**, ACLs are defined as JSON. A simple example: tag your servers, then restrict phones/laptops to specific services:

```json
{
  "tagOwners": {
    "tag:server": ["autogroup:admin"]
  },
  "acls": [
    {
      "action": "accept",
      "src": ["autogroup:member"],
      "dst": ["tag:server:8096,2283,443"]
    }
  ]
}
```

:::caution[SSH check mode and automation]
Tailscale SSH rules support `"action": "check"`, which forces periodic
browser re-authentication. Strong protection for interactive human sessions —
but any **automation** (CI runners, deploy scripts, cron jobs) using that
rule will hang silently waiting for a browser that never comes.

Keep `check` for humans. Use a separate `accept` rule — tightly scoped to a
low-privilege user — for anything unattended.
:::
---

## 🔐 Security Best Practices

:::tip[ELI5]
This section focuses on reducing unnecessary access and limiting the damage if something goes wrong.
:::

- Protect your Tailscale login with strong 2FA; it is now the key to your entire infrastructure
- Remove old devices from the admin console when you retire hardware
- Use tags and ACLs once more than one person joins your tailnet
- Keep clients updated: `apt upgrade` / `pacman -Syu` covers it

---

## 🧰 Troubleshooting

:::tip[ELI5]
Work through these checks in order so you isolate the failing layer instead of changing several things at once.
:::

```bash
tailscale status        # who's connected, and how (direct vs relayed)
tailscale netcheck      # NAT type, nearest DERP relay, port mapping info
tailscale ping machinename   # verify connectivity + path to a node
```

Common issues:

- **`failed to connect to local tailscaled`** → the daemon is not running. On Debian use `sudo systemctl restart tailscaled`; on Artix/OpenRC use `sudo rc-service tailscaled restart`.
- **Connections show `relay` instead of `direct`** → traffic is bouncing through Tailscale's DERP relays. Still encrypted, just slower. Direct connectivity depends on both peers' NAT/firewall behavior; inspect `tailscale netcheck` and upstream firewall guidance before changing rules.
- **Subnet routes not working** → route not approved in the admin console, or IP forwarding not enabled. Check both.
- **Node vanished from the tailnet** → key expiry. Re-authenticate with `sudo tailscale up`, then disable expiry so it doesn't recur.

---

## ✅ What to Remember

:::tip[ELI5]
This is the short version to keep in mind after you finish the page.
:::

Every forwarded port is a standing invitation to the entire internet.

A private mesh flips the model:

> Nothing is exposed. Everything is reachable by you and only you.
