---
title: "🔀 Nginx Proxy Manager (Private HTTPS for Everything)"
description: >-
  Nginx Proxy Manager for a private homelab — clean HTTPS names for every service, wildcard certificates with zero exposed ports via DNS-01, and local DNS with AdGuard Home.
---
Ports and IP addresses don't scale. While `http://192.0.2.20:8096` may work for one service; by service ten it's a memory game, every browser screams "Not Secure," and nothing has TLS.

A reverse proxy fixes this: **one entry point, real HTTPS, clean names** — `https://jellyfin.home.example.com` — without exposing a single port to the internet.

---

## ⚠️ Core Principle

> Every service gets a name and a certificate. Nothing gets a port number in the address bar.

---

## 🧭 How the Pieces Fit

```text
Browser (on the Tailscale tailnet)
   │
   ▼  "jellyfin.home.example.com?"
Local DNS (AdGuard Home)  →  answers with your server's IP
   │
   ▼  HTTPS :443
Nginx Proxy Manager  →  terminates TLS, routes by hostname
   │
   ▼  Docker network
Jellyfin container :8096
```

Three components:

1. **A real domain you own** (a few dollars a year) — used purely for names and certificates; nothing is publicly hosted on it
2. **Local DNS** that answers for it inside your network — AdGuard Home in this guide
3. **NPM** terminating TLS and routing by hostname

> The domain being real is what makes real certificates possible; no self-signed warnings, no CA imports on every device. Private certificate authorities are another valid option, but require distributing trust to clients.

---

## 📦 The NPM Stack

Following the [homelab structure](/homelab/docker-home-lab/), `/opt/docker/stacks/npm/compose.yaml`:

```yaml
name: npm

services:
  npm:
    image: jc21/nginx-proxy-manager:${NPM_TAG:?Set a reviewed NPM release tag}
    container_name: nginx-proxy-manager
    restart: unless-stopped
    ports:
      - "${PROXY_BIND_IP:?Set a reachable private host address}:80:80"
      - "${PROXY_BIND_IP:?Set a reachable private host address}:443:443"
      - "127.0.0.1:81:81"  # admin UI — localhost only, reached via Tailscale/SSH
    volumes:
      - /opt/docker/data/npm/data:/data
      - /opt/docker/data/npm/letsencrypt:/etc/letsencrypt
    networks:
      - proxy

networks:
  proxy:
    external: true
```

Create the stack directory and save the Compose file there. Create a local `.env` using this template, replacing the blank values before starting:

```dotenv
# =============================================================================
# Nginx Proxy Manager - Environment Configuration
# =============================================================================
# A reviewed release from the upstream release notes:
NPM_TAG=
# Actual LAN or Tailscale address assigned to this host (never 0.0.0.0):
PROXY_BIND_IP=
```

Protect it with `chmod 600 .env` and keep it out of Git. The examples use reserved documentation addresses; replace them with your own values locally.

Create the shared network once, then bring it up:

```bash
docker network create proxy
cd /opt/docker/stacks/npm
docker compose config --quiet
docker compose up -d
```

:::caution[Bind the admin UI to localhost]
The `127.0.0.1:81:81` binding means the admin panel is unreachable from
the network — even your LAN or tailnet. Reach it through an SSH tunnel over your authorized private connection.
The panel that controls all your routing should be the hardest thing to
reach, not the easiest.
:::
### First Login

On your client, forward a local port to the server's loopback address:

```bash
ssh -N -L 8181:127.0.0.1:81 user@server.example
```

Replace `server.example` with the server's private name. Open `http://127.0.0.1:8181` on that client while the tunnel remains open. This requires an SSH server and access policy that permit local TCP forwarding; use OpenSSH over Tailscale if your Tailscale SSH setup does not support the required forwarding.

Complete the first-run account setup for your chosen release. Older releases used a default account; do not assume those credentials apply to a new installation. See the [upstream setup instructions](https://nginxproxymanager.com/setup/) and the release notes for the exact version. Use a strong unique password.

---

## 🕸️ The Shared Proxy Network

NPM routes to containers **by name over a shared Docker network** — no published ports needed on the services themselves.

Add the `proxy` network to any stack NPM should reach:

```yaml
services:
  jellyfin:
    # ...existing config...
    networks:
      - default
      - proxy

networks:
  proxy:
    external: true
```

Now NPM can reach `jellyfin:8096` directly, and you can **remove the service's published ports entirely** — the proxy becomes the only door.

> Fewer published ports = smaller attack surface = less to reason about. The proxy network is the homelab's hallway; NPM is the only one with keys to the front.

---

## 🔐 Wildcard Certificate with Zero Exposed Ports (DNS-01)

The usual Let's Encrypt flow (HTTP-01) requires port 80 open to the internet which we try to avoid. The **DNS-01 challenge** proves domain ownership through a DNS record instead, so issuance needs no inbound public port. DNS, ACME, and provider API access still require outbound connectivity. Bonus: it's the only challenge type that can issue **wildcard** certs.

### 1. Create a DNS API Token

At your DNS provider (Cloudflare shown; NPM supports dozens):

- **My Profile → API Tokens → Create Token**
- Template: *Edit zone DNS*
- Scope it to **only** the one zone (e.g., `example.com`)

### 2. Request the Certificate in NPM

**SSL Certificates → Add SSL Certificate → Let's Encrypt**

- Domain names: `*.home.example.com` and `home.example.com`
- ✅ *Use a DNS Challenge* → provider: Cloudflare → paste the token
- Agree, save. Issuance takes a minute or two.

The wildcard covers one label, such as `jellyfin.home.example.com`, but not `a.b.home.example.com`. The separate `home.example.com` name covers the base. Monitor renewals and keep DNS API credentials valid.

:::tip[Keep private names out of public DNS]
A wildcard avoids listing every service name in the certificate. The wildcard and base domain still appear in public certificate transparency logs, and DNS-01 publishes a temporary validation record. Keep service records in local DNS, but do not treat wildcard certificates as anonymity or access control. See [Let's Encrypt challenge types](https://letsencrypt.org/docs/challenge-types/).
:::
---

## 🧭 Local DNS with AdGuard Home

The internet has no idea what `jellyfin.home.example.com` is — only your network should. In AdGuard Home:

**Filters → DNS rewrites → Add DNS rewrite**

```text
Domain: *.home.example.com
Answer: 192.0.2.10        # your server's LAN IP
```

One wildcard rewrite covers every current and future service.

:::tip[Make it work over Tailscale too]
A Tailscale address works only for clients with a permitted tailnet path. Ordinary LAN devices do not gain that route just because DNS returns the address. For mixed clients, use LAN DNS answers plus an approved subnet route for remote clients, or deliberate split DNS. Ensure the DNS resolver and NPM's bound address are reachable from each client class. See [DNS & Network Privacy](/homelab/dns-and-network-privacy/) and [Tailscale](/homelab/tailscale/).
:::
---

## 🔀 Creating Proxy Hosts

The per-service payoff. **Hosts → Proxy Hosts → Add Proxy Host**:

**Details tab**

```text
Domain Names:         jellyfin.home.example.com
Scheme:               http
Forward Hostname/IP:  jellyfin        ← container name on the proxy network
Forward Port:         8096
Websockets Support:   ✅
Block Common Exploits: ✅
```

**SSL tab**

```text
SSL Certificate:  *.home.example.com   ← the wildcard from earlier
Force SSL:        ✅
HTTP/2 Support:   ✅
```

Save. `https://jellyfin.home.example.com` is live — padlock and all.

Repeat per service; each one is thirty seconds:

| Service | Forward to |
| :--- | :--- |
| Immich | `immich-server:2283` |
| Paperless | `paperless-webserver:8000` |
| Forgejo | `forgejo:3000` |
| Uptime Kuma | `uptime-kuma:3001` |

:::tip[Websockets: just leave it on]
Half the homelab (Jellyfin, Uptime Kuma, Dozzle, Home Assistant, anything
with a live-updating UI) needs websockets, and the symptom when it's off
is maddeningly vague — pages load but nothing updates. Enable it for applications that require it and test the connection.
:::
---

## 🛡️ Hardening Checklist

- Admin UI bound to `127.0.0.1`, reached through the SSH tunnel over [Tailscale](/homelab/tailscale/)
- **Force SSL** on every proxy host; add **HSTS** once you're confident in the cert renewal
- **Block Common Exploits** enabled per host
- Default site (Settings → Default Site) set to a 404 — unknown hostnames hitting the proxy learn nothing
- Remove published ports from services once their proxy host works
- NPM's data lives in `/opt/docker/data/npm` — include both data and certificates explicitly in the [backup strategy](/homelab/backup-and-recovery/); losing it means re-creating every host by hand

---

## 🧰 Troubleshooting

- **502 Bad Gateway** → NPM can't reach the target. Is the service on the `proxy` network? Is the forward hostname the exact **container name**? Is the port the *internal* one (container's own port, not a published mapping)?
- **DNS challenge fails** → API token scope wrong, or propagation lag — retry once, then re-check the token permissions. NPM's logs (`docker logs nginx-proxy-manager`) show certbot's actual error.
- **Name doesn't resolve** → the client isn't using AdGuard for DNS. Check which resolver the device actually uses (`nslookup jellyfin.home.example.com`); phones on cellular need the Tailscale DNS setup above.
- **Redirect loop** → the backend app also forces HTTPS. Set the app's base URL to the proxied `https://` address, or forward with scheme `https` if the app serves TLS itself.
- **Works on LAN, dead over Tailscale** → the DNS rewrite points at the LAN IP. Check approved subnet routes, access policy, DNS answers, and the address NPM actually binds to.

---

## 🚫 What Not To Do

- Don't forward ports 80/443 on your router "just to make certs easier": DNS-01 exists precisely so you don't have to
- Don't use `.local`, `.lan`, or a made-up TLD — you'll fight mDNS conflicts and can never get real certificates; a real domain costs less than a coffee per month
- Don't expose the admin UI (`:81`) beyond localhost/Tailscale
- Don't proxy the admin panels of infrastructure (Portainer, Dockge, NPM itself) with the same casualness as media apps — infrastructure control planes deserve stricter access, not prettier URLs

---

## 🧠 Final Thought

The reverse proxy is where a pile of containers starts feeling like **infrastructure**: named, encrypted, consistent, reachable the same way from your couch or another continent.

> One entry point. Private access. Deliberate routing.
