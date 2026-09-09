---
title: "🏗️ Privacy Migration Guide"
description: >-
  A safe, step-by-step plan for moving to privacy-focused apps and services without losing data or breaking everyday workflows.
---
The easiest way to abandon a privacy migration is to replace ten services at once, break three family workflows, lose a password export, and spend the rest of the weekend troubleshooting.

Do not do that.

This guide moves **one dependency at a time**, keeps the old service available until the new one is proven, and includes an exit plan for every major migration.

---

## 🧠 ELI5: What Are We Actually Migrating?

Your digital life usually consists of a few categories:

```text
Accounts & passwords
Email
Browser & search
Files
Photos
Calendar & contacts
Messaging
Phone apps
Documents
Network/DNS
Media
Development
```

Each category has three jobs:

1. **Export** the old data.
2. **Import and test** the new service.
3. **Cut over only after verification.**

That is the entire migration strategy.

---

## 🛑 Rule #1: Never Delete the Old Service First

Before migrating any category:

- Export a copy.
- Keep the original service running.
- Verify the new service from at least two devices when appropriate.
- Verify backups.
- Only then consider deleting anything.

For family/shared services, leave a longer overlap period.

---

## 🗺️ Recommended Migration Order

I would move in this order:

1. Password manager
2. MFA/security keys
3. Browser + search
4. Email aliases
5. Private messaging
6. Email provider/domain
7. Files
8. Photos
9. Calendar + contacts
10. Mobile apps
11. DNS/network filtering
12. Optional self-hosted services

Why this order?

Your password manager and authentication methods are the keys to everything else. Get those right first.

---

## Phase 0 — Inventory Before Changing Anything

Create a simple table:

| Category | Current | New | Exported? | Tested? | Cut Over? |
|---|---|---|---|---|---|
| Passwords | Chrome | Bitwarden | ✅ | ✅ | ✅ |
| Email | Gmail | Proton Mail | ✅ | ✅ | ⬜ |
| Photos | Google Photos | Immich | ✅ | ⬜ | ⬜ |
| Files | Google Drive | Nextcloud | ✅ | ⬜ | ⬜ |

You do not need a complicated project-management system. A note or spreadsheet is enough.

Also list any **shared dependencies**:

- spouse/partner access
- shared photo albums
- family calendars
- shared passwords
- smart-home integrations
- school/work apps

Those are usually what break during aggressive migrations.

---

## Phase 1 — Password Manager

Recommended: **Bitwarden** or **Proton Pass**.

### Step 1: Create the New Vault

- Use a unique, long master passphrase.
- Enable MFA.
- Save recovery information securely.

### Step 2: Export Existing Passwords

Browser exports are commonly plaintext CSV files.

Treat the file like a stack of printed passwords:

- Save it locally.
- Do not put it in an unencrypted cloud folder.
- Import immediately.
- Remove the temporary export and any duplicate copies afterward.

### Step 3: Verify

Before deleting anything:

- Confirm several logins work.
- Confirm browser/mobile autofill works.
- Confirm passkeys if you use them.
- Confirm you can sign into the password manager from another device.

### Step 4: Start Fixing Reused Passwords

Do not try to change 300 passwords in one night.

Start with:

1. primary email
2. password manager
3. bank/finance
4. Apple/Google/Microsoft account
5. mobile carrier
6. domain registrar
7. social accounts

---

## Phase 2 — MFA, Passkeys & Security Keys

Before moving email or closing accounts, make sure you will not lock yourself out.

### TOTP

Move codes to **Ente Auth** or **Aegis**.

For each important service:

1. Open its security settings.
2. Add the new authenticator.
3. Verify a generated code.
4. Store recovery codes separately.
5. Only then remove the old authenticator.

### Hardware Keys

For high-value accounts:

1. Buy two FIDO2/WebAuthn keys.
2. Register both.
3. Test both.
4. Store the spare securely.

---

## Phase 3 — Browser & Search

This is one of the easiest migrations.

### Brave

1. Install Brave.
2. Import bookmarks.
3. Set your default search engine.
4. Sign into your password manager extension.
5. Make Brave the default browser.
6. Keep Chrome installed temporarily for sites that fail.

### Firefox

If you prefer Firefox:

1. Install Firefox.
2. Import bookmarks.
3. Set Enhanced Tracking Protection to **Strict**.
4. Install uBlock Origin.
5. Set private search.

Keep browser customization modest. More extensions are not automatically more private.

---

## Phase 4 — Email Aliases

This is an easy privacy win before changing your actual mailbox.

Recommended: **SimpleLogin**, **Addy.io**, or Proton Pass aliases.

### Start With New Accounts

For every new signup, create a unique alias.

Then gradually change high-spam or shopping accounts to aliases.

You do not need to update every old account immediately.

---

## Phase 5 — Messaging

Install Signal and start with the people who already use it.

Do not delete SMS/iMessage/WhatsApp simply because Signal exists. You will still need other channels for people and services that do not support it.

The privacy improvement comes from moving **sensitive conversations** to an end-to-end encrypted messenger, not from making yourself unreachable.

---

## Phase 6 — Email

Recommended hosted choices: **Proton Mail** or **Tuta**.

### Option A: Keep Your Existing Address Temporarily

1. Create the new mailbox.
2. Import historical mail if desired.
3. Forward new mail where supported.
4. Start changing important accounts to the new address.
5. Keep the old account alive for several months.

### Option B: Custom Domain

This is my preferred long-term portability strategy.

Example:

```text
Current provider: Gmail
New mailbox: Proton Mail
Permanent identity: you@yourdomain.com
```

If you later change providers:

```text
you@yourdomain.com
        ↓
new mail provider
```

Your contacts and website logins do not have to change.

### Before Cutting Over

Test:

- inbound mail
- outbound mail
- replies
- spam filtering
- mobile notifications
- recovery messages
- password-reset emails

Do not discover a DNS/MX mistake while trying to recover your bank account.

---

## Phase 7 — Files

Choose the model first.

### Hosted Encrypted

- Proton Drive
- Tresorit

### Self-Hosted

- Nextcloud
- Seafile

### Direct Sync

- Syncthing

### Migration Steps

1. Export/download files from the old provider.
2. Keep the export untouched as a temporary migration backup.
3. Upload a test folder to the new service.
4. Install desktop/mobile sync clients.
5. Test creating, renaming, modifying, and deleting files.
6. Test file sharing if you use it.
7. Verify backup of the new service.
8. Move the remainder.

Do not migrate your only copy.

---

## Phase 8 — Photos

### Hosted: Ente Photos

Best when you want encrypted automatic mobile backup without operating a server.

### Self-Hosted: Immich

Best when you want a Google Photos-like experience backed by your own infrastructure.

### Safe Migration

1. Export the original photo library.
2. Keep the export unchanged.
3. Import a small year/album first.
4. Check timestamps and metadata.
5. Verify mobile auto-backup.
6. Verify another backup of the server/library.
7. Import the rest.

Do not treat photo sync as your only photo backup.

---

## Phase 9 — Calendar & Contacts

Export before changing providers.

Typical formats:

- **Calendar:** `.ics`
- **Contacts:** `.vcf` / vCard

Hosted options:

- Proton Calendar
- Tuta Calendar

Self-hosted/standards-based:

- Nextcloud
- Baïkal
- Radicale

Test:

- recurring events
- invitations
- shared calendars
- birthdays
- contact photos
- mobile synchronization

---

## Phase 10 — Mobile Apps

Do the [Mobile Privacy Guide](/privacy/mobile/) Level 1 steps first.

Then replace only the apps where you gain meaningful privacy:

- Brave/Firefox
- Signal
- Organic Maps/OsmAnd
- Ente Auth/Aegis
- Ente Photos/Immich
- Proton apps

Do not attempt a GrapheneOS migration in the middle of moving email, photos, and passwords. Finish core account migrations first.

---

## Phase 11 — DNS & Network Filtering

### Simple Path

Set your router or devices to:

- **Quad9** for a security-focused resolver, or
- **Cloudflare 1.1.1.1** for a fast general resolver.

### Network-Wide Blocking

Deploy:

```text
AdGuard Home = primary DNS
Pi-hole      = secondary DNS
```

Then distribute both addresses through your router's DHCP configuration.

Follow the complete implementation in [DNS & Network Privacy](/homelab/dns-and-network-privacy/).

---

## Phase 12 — Optional Self-Hosting

Only after the easy migrations work should you consider services such as:

- Nextcloud / Seafile
- Immich
- Paperless-ngx
- Actual Budget
- Jellyfin
- Audiobookshelf
- SearXNG
- Forgejo
- Vaultwarden

For each service, require these before you consider it “production”:

```text
Working service
+ updates
+ authentication
+ backup
+ restore test
+ remote-access plan
```

A container that starts successfully is not a complete self-hosted service.

---

## 🔁 Run Old and New in Parallel

Use both systems until you answer **yes** to the questions that matter.

Example for cloud files:

- Can I open the files from my desktop?
- Can I access them from my phone?
- Does sync work both directions?
- Can I share a file?
- Is the server backed up?
- Have I tested a restore?

Only then decommission the old workflow.

---

## 🧹 Decommission Carefully

Before deleting an account:

1. Download one final export.
2. Verify the export opens.
3. Search your password manager for accounts using the old email address.
4. Check subscriptions and receipts.
5. Check family/shared data.
6. Remove trusted devices/app passwords.
7. Delete the account only when you are confident it is no longer needed.

Sometimes the correct answer is simply to leave the old account dormant.

---

## 🚨 Common Migration Failures

### “I Deleted the Old Copy Too Soon”

Fix: keep immutable exports until the migration and backups are verified.

### “My Family Hates the New App”

Fix: move shared workflows last and prioritize usability.

### “I Self-Hosted Everything and Now I Maintain 30 Apps”

Fix: self-host services that provide real value; use hosted encrypted services for the rest.

### “I Lost My Authenticator”

Fix: encrypted TOTP backup + recovery codes + hardware keys where supported.

### “My Custom Domain Email Stopped Working”

Fix: keep provider documentation for MX/SPF/DKIM/DMARC changes and test before deleting the old mailbox.

---

## ✅ A Realistic 30-Day Migration

### Week 1

- Password manager
- MFA/security keys
- Brave/Firefox
- Private search

### Week 2

- Signal
- Email aliases
- Proton/Tuta mailbox setup

### Week 3

- Files
- Photos
- Calendar/contacts

### Week 4

- Mobile cleanup
- DNS filtering
- Backups
- Optional first self-hosted application

There is no prize for finishing faster.

---

## 🚀 End State

A good privacy migration should leave you with technology that is **more controllable without becoming harder to live with**.

The goal is not:

```text
Google → delete everything → 40 Docker containers
```

The goal is:

```text
Understand dependency
  ↓
Choose better tool
  ↓
Export
  ↓
Import
  ↓
Test
  ↓
Back up
  ↓
Cut over
```

Repeat only where the benefit is worth the effort.
