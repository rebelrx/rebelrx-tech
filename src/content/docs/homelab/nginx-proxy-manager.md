---
title: "🔀 Nginx Proxy Manager (Private HTTPS for Everything)"
description: >-
  Nginx Proxy Manager for a private homelab — clean HTTPS names for every service, wildcard certificates with zero exposed ports via DNS-01, and local DNS with AdGuard Home.
---
Ports and IP addresses don't scale. `http://192.168.1.20:8096` works for one service; by service ten it's a memory game, every browser screams "Not Secure," and nothing has TLS.

A reverse proxy fixes all of it: **one entry point, real HTTPS, clean names** — `https://jellyfin.home.example.com` — without exposing a single port to the internet.

---

## ⚠️ Core Principle

> Every service gets a name and a certificate. Nothing gets a port number in the address bar.

---

## 🧭 How the Pieces Fit

```text
Browser (on the tailnet)
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

> The domain being real is what makes real certificates possible; no self-signed warnings, no CA imports on every device.

---

## 📦 The NPM Stack

Following the [homelab structure](/homelab/docker-home-lab/), `/opt/stacks/npm/compose.yaml`:

```yaml
services:
  npm:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx-proxy-manager
    restart: unless-stopped
    ports:
      - "80:80"            # HTTP (redirects to HTTPS)
      - "443:443"          # HTTPS
      - "127.0.0.1:81:81"  # admin UI — localhost only, reached via Tailscale/SSH
    volumes:
      - /opt/data/npm/data:/data
      - /opt/data/npm/letsencrypt:/etc/letsencrypt
    networks:
      - proxy

networks:
  proxy:
    external: true
```

Create the shared network once, then bring it up:

```bash
docker network create proxy
cd /opt/stacks/npm
docker compose up -d
```

:::caution[Bind the admin UI to localhost]
The `127.0.0.1:81:81` binding means the admin panel is unreachable from
the network — even your LAN. Reach it through Tailscale or an SSH tunnel.
The panel that controls all your routing should be the hardest thing to
reach, not the easiest.
:::
### First Login

Browse to `http://server:81` (over Tailscale) and log in with NPM's defaults:

```text
Email:    admin@example.com
Password: changeme
```

It forces a credential change immediately. Use the password manager.

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

The usual Let's Encrypt flow (HTTP-01) requires port 80 open to the internet — exactly what this setup refuses to do. The **DNS-01 challenge** proves domain ownership through a DNS record instead, so it works with every port closed. Bonus: it's the only challenge type that can issue **wildcard** certs.

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

One wildcard cert now covers every service you'll ever add under `*.home.example.com` — no per-service issuance, and renewals are automatic.

:::tip[Keep private names out of public DNS]
With the wildcard, individual hostnames (`jellyfin.`, `paperless.`,
`vault.`) never appear anywhere public — not in your DNS zone, and not in
certificate transparency logs, which log every issued cert and are
searchable by anyone. A per-service cert for `vault.home.example.com`
announces to the world that you run a password vault. The wildcard
announces nothing.
:::
---

## 🧭 Local DNS with AdGuard Home

The internet has no idea what `jellyfin.home.example.com` is — only your network should. In AdGuard Home:

**Filters → DNS rewrites → Add DNS rewrite**

```text
Domain: *.home.example.com
Answer: 192.168.1.10        # your server's LAN IP
```

One wildcard rewrite covers every current and future service.

:::tip[Make it work over Tailscale too]
Point the rewrite at the server's **Tailscale IP** (`100.x.y.z`) instead of
the LAN IP, and set AdGuard Home as your tailnet's DNS server (Tailscale
admin console → DNS → add your AdGuard instance, enable *Override local
DNS*). Now `https://jellyfin.home.example.com` works identically at home
and across the [tailnet](/homelab/tailscale/) — one URL everywhere, ad-blocking
included.
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
is maddeningly vague — pages load but nothing updates. Enable it by
default and never debug it again.
:::
---

## 🛡️ Hardening Checklist

- Admin UI bound to `127.0.0.1`, reached via [Tailscale](/homelab/tailscale/) only
- **Force SSL** on every proxy host; add **HSTS** once you're confident in the cert renewal
- **Block Common Exploits** enabled per host
- Default site (Settings → Default Site) set to a 404 — unknown hostnames hitting the proxy learn nothing
- Remove published ports from services once their proxy host works
- NPM's data lives in `/opt/data/npm` — already covered by the [backup strategy](/homelab/backup-and-recovery/); losing it means re-creating every host by hand

---

## 🧰 Troubleshooting

- **502 Bad Gateway** → NPM can't reach the target. Is the service on the `proxy` network? Is the forward hostname the exact **container name**? Is the port the *internal* one (container's own port, not a published mapping)?
- **DNS challenge fails** → API token scope wrong, or propagation lag — retry once, then re-check the token permissions. NPM's logs (`docker logs nginx-proxy-manager`) show certbot's actual error.
- **Name doesn't resolve** → the client isn't using AdGuard for DNS. Check which resolver the device actually uses (`nslookup jellyfin.home.example.com`); phones on cellular need the Tailscale DNS setup above.
- **Redirect loop** → the backend app also forces HTTPS. Set the app's base URL to the proxied `https://` address, or forward with scheme `https` if the app serves TLS itself.
- **Works on LAN, dead over Tailscale** → the DNS rewrite points at the LAN IP. Use the Tailscale IP (reachable from both contexts) as the rewrite answer.

---

## 🚫 What Not To Do

- Don't forward ports 80/443 on your router "just to make certs easier" — DNS-01 exists precisely so you don't have to
- Don't use `.local`, `.lan`, or a made-up TLD — you'll fight mDNS conflicts and can never get real certificates; a real domain costs less than a coffee per month
- Don't expose the admin UI (`:81`) beyond localhost/Tailscale
- Don't proxy the admin panels of infrastructure (Portainer, Dockge, NPM itself) with the same casualness as media apps — infrastructure control planes deserve stricter access, not prettier URLs

---

## 🧠 Final Thought

The reverse proxy is where a pile of containers starts feeling like **infrastructure**: named, encrypted, consistent, reachable the same way from your couch or another continent.

> One door. Every service behind it. Nothing exposed.
