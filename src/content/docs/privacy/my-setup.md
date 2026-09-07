---
title: "🧪 RebelRx Privacy Setup"
description: >-
  The complete RebelRx stack — hardware, operating systems, self-hosted services, and the privacy tools actually in daily use.
---
This is my own real-world, privacy-first stack designed for **control, performance, and usability**.

I run this setup daily and will continuously update these sections as newer and better services become available.

---

## 🧭 Philosophy

This setup is built around:

- **Ownership** → Your data stays under your control  
- **Practicality** → Tools must actually work day-to-day  
- **Scalability** → Can grow with your needs  
- **Security** → No unnecessary exposure  

> 💡 This is not a “maximum privacy” setup. It's a **balanced, usable system**.

---

## 🖥️ Hardware Overview

My setup runs across a mix of **self-hosted infrastructure, dedicated appliances, and personal devices**, each serving a specific role.

---

## 🧱 Core Infrastructure

### Minisforum MS-A2 (Primary Server)

- **OS:** Devuan (bare metal)
- **Role:** Core Docker host

> 💡 This is the backbone of my entire system

👉 Check out the selection of Minisforum Work Station Mini: <https://www.minisforum.com/collections/station-mini-series>

---

### QNAP TS-h1277AXU-RP (NAS)

- **Role:** Bulk storage + backups
- Stores:
  - Media libraries
  - Nextcloud data
  - Backups
  - Archives (ROMs, documents, etc.)

> 💡 Separating compute (server) from storage (NAS) improves flexibility and resilience

👉 Check out the selection of QNAP NAS solutions: <https://www.qnap.com/en-us/product>

---

## 💻 Personal Systems

### Custom Ryzen 9 PC (Windows 11)

- **Role:** Gaming + Windows-only applications
- Used for:
  - High-performance workloads
  - Compatibility with non-Linux software

👉 Check out Micro Center, computer retailer, for nearest locations to you: <https://www.microcenter.com/>

---

### Framework Desktop (Artix Linux)

- **Role:** Secondary workstation
- Used for:
  - General productivity
  - Linux-first workflows

👉 Check out the Framework Desktop: <https://frame.work/marketplace/desktops>

---

### Framework 13 Laptop (Artix Linux)

- **Role:** Travel + development machine
- Used for:
  - Remote access (via Tailscale)
  - Managing my home infrastructure
  - Lightweight productivity

👉 Check out the selection of Framework laptops: <https://frame.work/marketplace/laptops>

---

## 🎮 Gaming & Emulation

### Raspberry Pi 5 (8GB)

- **OS:** Batocera
- **Additional:** MiSTer FPGA
- **Role:** Retro gaming / emulation

👉 Check out the Vilros, tech supplier, selection of Raspberry Pi boards and accessories: <https://vilros.com/>

---

## 🏠 Dedicated Appliances

### Beelink Mini S13

- **Role:** Smart home automation
- **OS:** Home Assistant OS

👉 Check out the selection of Beelink mini PC: <https://www.bee-link.com/collections/product>

---

### Umbrel Home

- **Role:** Bitcoin node
- Runs:
  - Full BTC node
  - Lightning

👉 Check out the selection of Umbrel devices: <https://umbrel.com/>

---

### Intel NUC 13

- **Role:** Audio server
- **OS:** Roon ROCK

👉 Check out B&H for their selection of NUCs and pro tech gear: <https://www.bhphotovideo.com/>

---

## 🧠 Design Philosophy

Each device has a **clear, single responsibility**:

- Server → Compute (Docker workloads)
- NAS → Storage
- Clients → Interaction (desktop/laptop)
- Appliances → Specialized tasks

> 💡 This separation keeps the system:
>
> - Easier to maintain  
> - More resilient  
> - Easier to scale  

---

## ✅ Why This Setup Fits My Needs

- No single point of failure for everything  
- Clear separation of concerns  
- Optimized performance per device  
- Flexibility to upgrade individual components  

---

## 🚀 Final Hardware Thought

But, you don’t need this much hardware to get started.

This setup evolved over time—  
start small, and expand as your needs grow.

---

## 🧱 Core Architecture

- **Docker-based deployment**
- **NAS-backed storage**
- **Reverse proxy (Nginx Proxy Manager)**
- **Private access via Tailscale (no port forwarding)**

---

## ☁️ Data & Productivity

### Nextcloud AIO

- Files
- Calendar (CalDAV)
- Contacts (CardDAV)
- NAS-backed storage

### Cloud Storage (Hosted)

- pCloud.com

---

## 📧 Email

- Proton Mail

---

## 📸 Photos

### Immich

- Google Photos replacement
- Fast, modern UI
- Fully self-hosted

---

## 📝 Office

### ONLYOFFICE

- Microsoft Office 365 replacement
- Full productivity suite (document, spreadsheet, presentation, pdf, and forms editors)
- Free and open-source

---

## 📄 PDFs & Documents

- Sumatra PDF (lightweight reader)
- BentoPDF (PDF tooling)
- Paperless-ngx (document archive)

---

## 📝 Notes & Knowledge

### Joplin

- Markdown-based
- Cross-platform
- Sync via Nextcloud

### Paperless-ngx

- Document management system
- OCR + tagging
- Replaces paper clutter

---

## 🔐 Security & Identity

### Password Manager

- Proton Pass (hosted alternative)

### 2FA

- Enabled across all services
- Passkeys when available

---

## 🌍 Network & Privacy Layer

### DNS Blocking

- AdGuard Home
- Network-wide ad + tracker blocking

### VPN

- Mullvad (privacy-first external VPN)

### Private Access

- Tailscale
- Secure remote access to services
- No exposed ports

---

## 🌐 Browser

- Brave
  - Built-in ad/tracker blocking
  - Minimal extensions required

---

## 🎥 Media & Entertainment

### Jellyfin

- Self-hosted streaming
- Replaces Netflix / HBO / streaming services

### Arr Stack

- Sonarr
- Radarr
- Prowlarr
- Automated media management

---

## 📚 Books & Audio

### Calibre-Web / Kavita

- Ebook libraries

### Audiobookshelf

- Audiobooks + podcasts
- Fully self-hosted

---

## 💰 Finance

### Actual Budget

- Self-hosted budgeting
- Privacy-first alternative to Mint/YNAB

---

## 🧰 Development & Infrastructure

### Git

- Forgejo (self-hosted Git service)

### Editor

- VSCodium (telemetry-free VS Code)

---

## 🌐 Network Tools

- LibreSpeed
- Speedtest-tracker

Self-hosted network performance testing without tracking.

---

## 🔁 What This Setup Replaces

| Big Tech | Replacement |
|---------|------------|
| Google Drive | Nextcloud |
| Google Photos | Immich |
| Google Calendar | Nextcloud |
| Google Contacts | Nextcloud |
| Gmail | Proton Mail / Tuta |
| Chrome Passwords | Proton Pass |
| Chrome | Brave |
| Google Docs (partial) | Nextcloud + Joplin |
| Netflix / HBO | Jellyfin + Arr stack |
| Kindle / Audible | Calibre-Web / Audiobookshelf |
| Adobe Acrobat | Sumatra PDF / BentoPDF |
| Mint / YNAB | Actual Budget |
| GitHub | Forgejo |
| ISP DNS | AdGuard Home / Pi-hole |
| Speedtest.net | LibreSpeed / Speedtest-tracker |

---

## 🧠 Design Principles

### 1. Local-First Where Possible

Data lives:

- On your server
- On your NAS

---

### 2. Self-Host When It Adds Value

Not everything needs to be self-hosted.

Balanced approach:

- Self-host → core data (files, photos, passwords)
- Hosted → convenience (email if preferred)

---

### 3. Secure by Default

- No exposed ports
- Access via Tailscale only
- Reverse proxy for internal routing

---

### 4. Keep It Maintainable

- Docker-based services
- Clear directory structure
- Version-controlled configs (Forgejo)

---

## ⚖️ Why This Setup Works

- High control over data  
- Minimal ongoing cost  
- Scalable architecture  
- Secure remote access  
- Works across all devices  

---

## 🚀 Final Thought on Infrastructure

This isn’t the only way to do it and certainly not perfect!

But, it’s a **battle-tested, real-world setup** that balances:

- Privacy  
- Usability  
- Reliability  

> 🧠 The goal isn’t perfection; it’s **control without friction**.
