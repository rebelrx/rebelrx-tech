---
title: "🏗️ Migration Guide"
description: >-
  A phased, realistic plan for leaving Big Tech platforms — ordered steps, no cold-turkey cutover, no abandoned migrations.
---
How to move away from Big Tech **without breaking your workflow**.

---

## ⚠️ Golden Rule

> Do NOT migrate everything at once.

This is the #1 reason people fail.

---

## 🧭 Migration Strategy Overview

You will follow a phased approach:

1. Parallel Setup  
2. Gradual Migration  
3. Dual Usage  
4. Cutover  
5. Decommission  

---

## 🪜 Phase 1: Parallel Setup

Set up your new tools **without deleting anything**.

### Core Apps to Install First

- Browser → **Brave**
- Password Manager → **Bitwarden / Proton Pass**
- Email → **Proton Mail / Tuta**
- Messaging → **Signal**

---

### Optional (Early Infrastructure)

If you're going self-hosted:

- **Nextcloud (or Sync.com if hosted)**
- **Immich (photos)**
- **AdGuard Home / Pi-hole**
- **Tailscale**

> 💡 Don’t overbuild early—get things working first.

---

## 🔄 Phase 2: Gradual Migration

Move one category at a time.

---

### 🌐 Browser

- Install Brave
- Add extensions (minimal):
  - uBlock Origin (optional—Brave already blocks ads)
- Import bookmarks from Chrome

---

### 🔐 Passwords

- Export from Chrome
- Import into:
  - Bitwarden **or**
  - Proton Pass
- Enable 2FA

> ⚠️ Do this early—everything depends on it

---

### 📧 Email

- Create Proton Mail or Tuta account
- Set up:
  - Forwarding from Gmail → new inbox
  - Begin using new email for logins

> 💡 Optional: set up a custom domain

---

### ☁️ Files

**Option A (Self-hosted):**

- Upload data → Nextcloud

**Option B (Hosted):**

- Upload data → Sync.com

Start with:

- Documents
- Personal files
- Non-critical data

---

### 📸 Photos

- Export from Google Photos
- Upload into Immich

> ⚠️ This can take time—do it in batches

---

### 📝 Notes

- Export Google Keep / Apple Notes
- Import into Joplin

---

### 📆 Calendar & Contacts

- Export Google data
- Import into:
  - Nextcloud  
  - or Baikal / Radicale

---

### 🌍 Network

- Deploy AdGuard Home or Pi-hole
- Update DNS on:
  - Router (optional)
  - Devices

---

### 🔒 VPN / Access

- Install Mullvad (privacy VPN)
- Set up Tailscale (remote access to homelab)

---

### 📚 Documents

- Scan/import into Paperless-ngx
- Replace PDF workflows:
  - Sumatra PDF
  - BentoPDF

---

### 🎥 Media

- Set up Jellyfin
- (Optional advanced):
  - Deploy Arr stack (Sonarr, Radarr, Prowlarr)

---

### 📚 Books & Audio

- Import ebooks → Calibre-Web / Kavita
- Import audiobooks/podcasts → Audiobookshelf

---

### 💰 Finance

- Set up Actual Budget
- Import/export financial data (if applicable)

---

### 🧰 Development

- Replace GitHub workflows with Forgejo (optional)
- Switch to VSCodium

---

## 🔁 Phase 3: Dual Usage

Run both systems simultaneously.

Validate:

- Sync reliability
- Mobile access
- Backups
- Performance

---

## 🔌 Phase 4: Cutover

Start switching fully:

- Update login emails across accounts
- Move daily workflows:
  - Notes → Joplin
  - Files → Nextcloud / Sync.com
  - Photos → Immich
- Reduce reliance on Google/Apple

---

## 🧹 Phase 5: Decommission

Once confident:

- Export final backups from old services
- Disable unused accounts
- Remove apps you no longer use

> ⚠️ Keep backups before deleting anything

---

## ⚠️ Common Pitfalls

- Migrating too fast  
- Breaking family/shared workflows  
- No backup strategy  
- Overengineering early  
- Chasing “perfect privacy” instead of usable systems  

---

## 🔐 Security Best Practices

- Use a password manager (Bitwarden / Proton Pass)
- Enable 2FA everywhere
- Keep systems updated
- Maintain **offsite backups**
- Test restores (not just backups)

---

## 🧠 Pro Tips

### 1. Prioritize High-Impact Wins

Start with:

- Browser
- Password manager
- Email

---

### 2. Separate Hosted vs Self-Hosted

| Type | When to Use |
|------|------------|
| Hosted (Proton, Sync.com) | Simpler, faster setup |
| Self-hosted (Nextcloud, Immich) | Maximum control |

---

### 3. Build in Layers

- Layer 1 → Apps (Brave, Signal, Bitwarden)
- Layer 2 → Services (Email, Storage)
- Layer 3 → Infrastructure (Nextcloud, DNS, VPN)

---

## 🚀 Final Thought

> Migration is a process, not an event.

You don’t need to replace everything overnight.

Focus on:

- Progress
- Stability
- Control
