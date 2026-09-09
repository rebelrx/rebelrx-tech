---
title: "🛡️ Privacy-First Living"
description: >-
  A practical, step-by-step guide to improving digital privacy without breaking the tools and workflows you depend on.
---
Digital privacy does not require disappearing from the Internet, abandoning every mainstream service, or building an elaborate self-hosted lab.

For most people, the useful goal is much simpler:

> **Share less data unnecessarily, protect the accounts and devices you already use, and keep important data portable enough that you can leave a service when you want to.**

This section is designed as a practical migration guide. You can start with a normal Windows, macOS, Android, or iPhone setup and improve it one piece at a time.

---

## 🧠 ELI5: What Does “Digital Privacy” Mean?

Think of digital privacy as deciding **who gets to know what about you**.

When you use an app or website, several different things can happen:

- The service may store the data you deliberately give it.
- It may also collect metadata such as your IP address, device, location, usage times, and interactions.
- Advertising and analytics systems may try to connect activity across different sites or apps.
- Your account may become difficult to leave if all your mail, photos, files, passwords, or purchases are trapped inside one ecosystem.

Privacy improvements generally do one of four things:

1. **Collect less** — block unnecessary tracking.
2. **Encrypt more** — make stored or transmitted data harder for third parties to read.
3. **Own more** — keep important data on systems you control, when practical.
4. **Reduce lock-in** — use tools that let you export and move your data.

You do not need to maximize all four at once.

---

## 🚀 Start Here: The Highest-Impact Changes

If you want meaningful improvement without turning privacy into a hobby, do these first:

1. **Use a dedicated password manager** such as Bitwarden or Proton Pass.
2. **Enable multi-factor authentication (MFA)** on important accounts.
3. **Use Signal** for private person-to-person messaging where your contacts support it.
4. **Move everyday browsing away from Chrome** to Brave or a well-configured Firefox.
5. **Use a privacy-respecting search engine** such as Brave Search, DuckDuckGo, or Startpage.
6. **Use email aliases** instead of giving every website your real inbox address.
7. **Review your phone's app permissions** and remove apps you no longer use.
8. **Back up anything you cannot replace.** Privacy does not help if your only copy disappears.

Those changes provide far more practical value than spending hours tweaking obscure browser flags or trying to become anonymous online.

---

## 🧭 What Each Guide Does

Follow these in roughly this order:

1. **[Why Privacy Matters](/privacy/why-privacy/)**  
   What privacy actually protects, with concrete examples and without the manifesto.

2. **[App Recommendations](/privacy/app-recommendations/)**  
   The applications and services I would actually consider today, including hosted and self-hosted options.

3. **[Mobile Privacy](/privacy/mobile/)**  
   Start with the phone you already have, harden it, replace the worst apps, and consider GrapheneOS only if you want to go further.

4. **[Migration Guide](/privacy/migration/)**  
   A step-by-step plan for changing services without losing files, passwords, mail, photos, or family workflows.

5. **[RebelRx Setup](/privacy/my-setup/)**  
   A real-world example showing how I combine mainstream systems, Linux, self-hosting, local storage, DNS filtering, backups, and local AI.

---

## 🪜 Pick Your Level

### Level 1 — Better Defaults

No servers required.

- Brave or Firefox
- Private search
- Bitwarden or Proton Pass
- Signal
- Ente Auth or Aegis
- Hardware security keys for high-value accounts
- Proton Mail or Tuta if you want to move email
- Quad9 or Cloudflare DNS if you are not running your own DNS filtering

### Level 2 — Reduce Cloud Dependence

Add services that give you more control over your data.

- Proton Drive / Tresorit for encrypted hosted storage
- Nextcloud / Seafile for self-hosted files
- Ente Photos or Immich for photos
- Syncthing for direct device-to-device file sync
- Paperless-ngx for documents
- Actual Budget for budgeting
- AdGuard Home / Pi-hole for network-wide filtering

### Level 3 — Self-Hosted Infrastructure

Only do this if you actually want to operate servers.

- Reverse proxy
- Tailscale
- Forgejo
- Immich
- Nextcloud / Seafile
- SearXNG
- Jellyfin
- Paperless-ngx
- Audiobookshelf
- Vaultwarden
- Local AI services

Self-hosting is not automatically more private. A badly maintained public server can be less secure than a reputable hosted service with strong end-to-end encryption.

---

## ⚖️ The Tradeoffs That Actually Matter

| Choice | What You Gain | What You Take On |
|---|---|---|
| Privacy-focused hosted service | Easy setup, professional operations | You still trust a provider |
| Self-hosting | More control and portability | Patching, backups, security, uptime |
| End-to-end encryption | Provider cannot easily read content | Recovery becomes your responsibility |
| Custom domain | Portability and professional identity | Cost, DNS configuration, possible correlation |
| VPN | Hides traffic destinations from your ISP and changes your public IP | VPN provider becomes another network intermediary |
| Alternative mobile OS | More control over platform services | Compatibility and maintenance tradeoffs |

There is no universal “most private” answer. The best setup is the one whose tradeoffs you understand and can maintain.
