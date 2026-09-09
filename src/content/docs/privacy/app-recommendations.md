---
title: "🔁 Privacy-Based App Recommendations"
description: >-
  Practical replacements for common apps and cloud services, with clear recommendations for beginner, hosted, and self-hosted setups.
---
This is not a list of every privacy app on the Internet.

It is a shortlist of tools I would actually consider using or recommending today.

The goal is not to replace every mainstream service simply because it comes from a large company. Replace the services where you gain something meaningful: **less tracking, stronger encryption, better portability, or more control over your data**.

---

## 🧠 ELI5: How to Read This Page

Most categories have three possible approaches:

- **Easy:** use a reputable privacy-focused hosted service.
- **Local:** use an application that stores data primarily on your own devices.
- **Self-hosted:** run the service on your own server.

Self-hosting is not always the best privacy choice. If you cannot patch, secure, monitor, and back up a server, a well-run end-to-end encrypted service can be safer.

---

## ⭐ My “Just Give Me the Best Choices” List

| Need | Default Recommendation | Why |
|---|---|---|
| Browser | **Brave** | Strong privacy defaults with excellent Chromium compatibility |
| Search | **Brave Search** or **DuckDuckGo** | Good everyday replacements for Google Search |
| Password manager | **Bitwarden** or **Proton Pass** | Mature, cross-platform, strong encryption |
| Private messaging | **Signal** | Best balance of security and normal-person usability |
| Email | **Proton Mail** | Mature privacy ecosystem and easy migration |
| Email aliases | **SimpleLogin** | Unique addresses for different accounts |
| 2FA | **Ente Auth** / **Aegis** | Open-source, exportable TOTP |
| Hardware MFA | **Yubico Security Key / YubiKey** | Phishing-resistant FIDO2/WebAuthn |
| Hosted cloud storage | **Proton Drive** | Encrypted hosted option with broad ecosystem integration |
| Self-hosted files | **Nextcloud** or **Seafile** | Full-control cloud/file platforms |
| Photos | **Ente Photos** hosted / **Immich** self-hosted | Strong private-photo options |
| Maps | **Organic Maps** | Offline, simple, no account required |
| VPN | **Mullvad** or **Proton VPN** | Reputable, audited privacy VPNs |
| DNS | **Quad9** security / **Cloudflare** speed | Strong public DNS choices when not self-hosting |
| Network ad blocking | **AdGuard Home + Pi-hole** | Practical primary/secondary DNS filtering |

---

## 🌐 Browsers

### Best Everyday Choice: Brave

Use **Brave** if you want something that behaves like Chrome without using Chrome as your default browser.

**Why:**

- Chromium compatibility
- Built-in Shields content blocking
- Third-party tracking protection
- Very little setup required

**Basic setup:**

1. Install Brave.
2. Import bookmarks and passwords only if you are not yet using a dedicated password manager.
3. Open **Settings → Shields**.
4. Leave blocking enabled globally.
5. Add exceptions only for sites that actually break.

### Best Non-Chromium Choice: Firefox

Firefox remains an excellent alternative if you want to avoid a Chromium-only web.

Recommended minimum changes:

1. Set **Enhanced Tracking Protection → Strict**.
2. Disable sponsored address-bar suggestions.
3. Use your preferred private search engine.
4. Add **uBlock Origin**.

### Higher-Privacy Browsing: Mullvad Browser

Mullvad Browser is useful when anti-fingerprinting matters more than convenience. It intentionally avoids persistent browser state and is not designed to be customized heavily.

Use **Tor Browser**, not a normal browser plus a VPN, when you specifically need anonymity.

---

## 🔎 Search

| Service | Best For | Notes |
|---|---|---|
| [Brave Search](https://search.brave.com/) | Everyday use | Independent search index for much of its results |
| [DuckDuckGo](https://duckduckgo.com/) | Simple Google replacement | Easy default for most users |
| [Startpage](https://www.startpage.com/) | Google-style results with less direct tracking | Privacy proxy around search results |
| [SearXNG](https://docs.searxng.org/) | Self-hosting | Metasearch frontend; upstream engines still process requests from the instance |

You do not need five search engines. Pick one default and keep another bookmarked for difficult searches.

---

## 📧 Email

### Hosted

- **[Proton Mail](https://proton.me/mail)** — best general privacy-focused ecosystem choice.
- **[Tuta](https://tuta.com/)** — strong encrypted alternative with its own mail/calendar ecosystem.

Email is not magically end-to-end encrypted just because you use Proton or Tuta. Encryption is strongest between compatible users/services; ordinary Internet email still has limitations.

### Use a Custom Domain When Portability Matters

Instead of making `yourname@provider.com` your permanent identity, use something like:

```text
you@yourdomain.com
```

If you later move from Proton to another mail host, you can move the domain without changing hundreds of account logins.

---

## 🎭 Email Aliases

This was one of the biggest missing categories in the old guide.

An alias gives each website a different address while forwarding mail to your real inbox.

Recommended:

- **[SimpleLogin](https://simplelogin.io/)**
- **[Addy.io](https://addy.io/)**
- **Proton Pass aliases** if you already use Proton Pass

Example:

```text
amazon.47fd@simplelogin-domain.example
netflix.1ca8@simplelogin-domain.example
randomstore.8b21@simplelogin-domain.example
```

If `randomstore` starts spamming you, disable that alias without changing your real mailbox.

---

## 🔐 Password Managers

Recommended hosted choices:

- **[Bitwarden](https://bitwarden.com/)**
- **[Proton Pass](https://proton.me/pass)**

Self-hosted:

- **[Vaultwarden](https://github.com/dani-garcia/vaultwarden)** — lightweight Bitwarden-compatible server.

Local/offline power-user option:

- **[KeePassXC](https://keepassxc.org/)** — excellent if you want a local database and are comfortable handling synchronization and backups yourself.

### Setup Checklist

1. Choose one manager.
2. Create a long, unique master passphrase.
3. Enable MFA on the password-manager account.
4. Import existing credentials.
5. Change reused passwords over time.
6. Create an encrypted backup/export according to your manager's documentation.
7. Test that you can recover your account before an emergency.

---

## 🔑 MFA, Passkeys & Hardware Security Keys

### TOTP Authenticator Apps

- **[Ente Auth](https://ente.io/auth/)** — cross-platform, optional encrypted synchronization.
- **[Aegis](https://getaegis.app/)** — excellent Android-only local authenticator.

### Hardware Security Keys

For high-value accounts such as email, password managers, finance, Git hosting, and cloud administration, use FIDO2/WebAuthn security keys where supported.

Recommended:

- **Yubico Security Key** — best simple FIDO2 option.
- **YubiKey 5 Series** — additional smart-card, OTP, and OpenPGP capabilities.
- **Nitrokey** — good open-source-oriented alternative.

Buy **at least two keys** if a service allows it: primary + recovery spare.

---

## ☁️ Cloud Storage & File Sync

### Hosted Encrypted Storage

- **[Proton Drive](https://proton.me/drive)** — easiest recommendation if you already use Proton.
- **[Tresorit](https://tresorit.com/)** — mature encrypted business/personal storage.

### Self-Hosted

- **[Nextcloud](https://nextcloud.com/)** — broad “private cloud” platform: files, sharing, calendars, contacts, apps.
- **[Seafile](https://www.seafile.com/)** — focused, fast file synchronization with less platform overhead.

### Device-to-Device Sync

- **[Syncthing](https://syncthing.net/)** — directly synchronizes folders between your devices without requiring a central cloud-storage service.

### Add Encryption to an Existing Cloud

- **[Cryptomator](https://cryptomator.org/)** — creates encrypted vaults you can store inside Dropbox, OneDrive, Google Drive, or another storage provider.

This is useful when you cannot replace a cloud provider but do not want it reading the contents of a particular folder.

---

## 📸 Photos

### Hosted

- **[Ente Photos](https://ente.io/)** — end-to-end encrypted photo backup with mobile auto-upload.

### Self-Hosted

- **[Immich](https://immich.app/)** — my primary self-hosted Google Photos-style recommendation.
- **[PhotoPrism](https://www.photoprism.app/)** — mature photo-management alternative; it does not provide E2EE itself, so protect the server and storage appropriately.

For most families, photo backup reliability matters more than whether the solution is hosted or self-hosted. Keep another backup either way.

---

## 📝 Notes & Documents

- **[Joplin](https://joplinapp.org/)** — excellent Markdown-oriented cross-platform notes with flexible sync.
- **[Notesnook](https://notesnook.com/)** — privacy-focused end-to-end encrypted notes.
- **[Standard Notes](https://standardnotes.com/)** — encrypted notes, now part of Proton.

For personal document archives:

- **[Paperless-ngx](https://docs.paperless-ngx.com/)** — scan, OCR, tag, and search household documents.

---

## 🏢 Office & Collaborative Documents

### Desktop Office

- **[LibreOffice](https://www.libreoffice.org/)** — best fully offline open-source office suite.
- **[ONLYOFFICE](https://www.onlyoffice.com/)** — strong Microsoft Office format compatibility and Nextcloud integration.

### Private Real-Time Collaboration

- **[CryptPad](https://cryptpad.org/)** — end-to-end encrypted collaborative documents, spreadsheets, forms, and whiteboards.

### PDF Tools

- **[Sumatra PDF](https://www.sumatrapdfreader.org/free-pdf-reader)** — lightweight Windows PDF reader.
- **[BentoPDF](https://github.com/alam00000/bentopdf)** — self-hosted/local PDF toolbox.

---

## 📆 Calendar & Contacts

Hosted encrypted ecosystems:

- **Proton Calendar**
- **Tuta Calendar**

Self-hosted standards-based options:

- **Nextcloud Calendar + Contacts**
- **Baïkal**
- **Radicale**

The key terms are:

- **CalDAV** → calendar synchronization standard.
- **CardDAV** → contacts synchronization standard.

Standards-based sync makes it easier to use multiple clients without being trapped in one vendor's app.

---

## 💬 Messaging

### Default Recommendation: Signal

Signal remains the easiest recommendation for private person-to-person conversations because it combines strong end-to-end encryption with normal mobile usability.

Other worthwhile options:

- **[SimpleX Chat](https://simplex.chat/)** — minimizes persistent identifiers and supports decentralized messaging infrastructure.
- **[Element / Matrix](https://element.io/)** — useful for communities, teams, federation, and self-hosting; understand the homeserver and encryption model first.

Do not use social-network direct messages for sensitive conversations when a purpose-built encrypted messenger is available.

---

## 🗺️ Maps & Navigation

- **[Organic Maps](https://organicmaps.app/)** — easiest privacy-first recommendation; excellent offline maps and navigation.
- **[OsmAnd](https://osmand.net/)** — more advanced OpenStreetMap navigation, layers, routing, and outdoor features.

Neither fully replaces every Google Maps feature such as broad business reviews, Street View, or universal live traffic. Keep Google Maps available in a browser when you actually need one of those features rather than granting its app permanent access to your location.

---

## 🌍 DNS & Network Ad Blocking

### No Self-Hosting

- **Quad9** — my security-first DNS recommendation.
- **Cloudflare 1.1.1.1** — excellent speed-oriented public resolver.

Avoid simply accepting your ISP resolver by default when better options are available.

### Self-Hosted Filtering

- **AdGuard Home**
- **Pi-hole**

For a complete primary/secondary setup, see [DNS & Network Privacy](/homelab/dns-and-network-privacy/).

---

## 🔒 VPNs & Private Remote Access

These are two different jobs.

### Privacy VPN

A commercial VPN changes the IP address websites see and prevents your ISP/local Wi-Fi operator from directly seeing the destinations of normal DNS/IP traffic in the same way.

Recommended:

- **[Mullvad](https://mullvad.net/)**
- **[Proton VPN](https://protonvpn.com/)**
- **[IVPN](https://www.ivpn.net/)**

A VPN does **not** make you anonymous. Use Tor Browser when anonymity is the actual objective.

### Remote Access to Your Own Network

- **[Tailscale](https://tailscale.com/)** — easiest mesh VPN recommendation.
- **[Headscale](https://github.com/juanfont/headscale)** — self-hosted control-server alternative for compatible Tailscale clients.

See the [Tailscale Guide](/homelab/tailscale/).

---

## 📤 Private File Sharing

- **Proton Drive links** — simple encrypted hosted sharing.
- **[Send](https://github.com/timvisee/send)** — encrypted link-based file transfer; self-hostable.
- **[OnionShare](https://onionshare.org/)** — direct sharing over Tor when privacy/anonymity requirements justify it.

---

## 🧹 Data Removal & Exposure Checks

Privacy is also about cleaning up data already circulating.

Worthwhile tools/services:

- **Have I Been Pwned** — check whether addresses appear in known breaches.
- **Google “Results about you”** — useful for finding/removing exposed personal contact information from Google Search.
- **EasyOptOuts** — paid data-broker removal option for users who do not want to manually opt out of dozens of brokers.

Treat removal services as ongoing cleanup, not magic erasure from the Internet.

---

## 🧼 Metadata Removal Before Sharing Files

Photos and documents can contain metadata you did not intend to publish, including camera model, timestamps, author information, and sometimes GPS coordinates.

Worthwhile tools:

- **MAT2** — removes metadata from many document, image, audio, and archive formats.
- **Metadata Cleaner** — graphical Linux frontend powered by MAT2.
- **ExifEraser** — simple Android image-metadata removal.
- **ExifTool** — extremely capable cross-platform command-line metadata tool.

Example with ExifTool:

```bash
exiftool -all= photo.jpg
```

Do this before publishing sensitive photos or documents—not blindly to your entire photo library, where metadata may be useful for organization.

---

## 📰 RSS Instead of Algorithmic Feeds

RSS is an old technology that remains one of the simplest ways to follow websites without handing an algorithm a complete behavioral profile.

Good choices:

- **Miniflux** — lightweight self-hosted web RSS reader.
- **NewsFlash** — excellent Linux desktop reader.
- **Feeder** — straightforward Android RSS client.
- **NetNewsWire** — excellent Apple-platform client.

You can even follow many YouTube channels through their public RSS feeds without subscribing through a Google account.


---

## 🎥 Media

- **[Jellyfin](https://jellyfin.org/)** — self-hosted media streaming.
- **[Audiobookshelf](https://www.audiobookshelf.org/)** — audiobooks and podcasts.
- **[Calibre-Web](https://github.com/janeczku/calibre-web)** / **[Kavita](https://www.kavitareader.com/)** — ebooks and comics.

The *Arr applications* are media-management automation tools. They are not inherently privacy tools and should be used only with media sources and workflows you are legally entitled to use.

---

## 💰 Personal Finance

- **[Actual Budget](https://actualbudget.org/)** — excellent self-hosted/local-first budgeting platform.

For payment privacy in the U.S., virtual-card services such as **Privacy.com** can reduce how often merchants receive your real card number, although they introduce another financial-service provider into the transaction chain.

---

## 🧰 Development

- **[VSCodium](https://vscodium.com/)** — Microsoft VS Code codebase built without Microsoft's branded telemetry/services by default.
- **[Forgejo](https://forgejo.org/)** — self-hosted Git hosting.
- **GitHub/GitLab** — still perfectly reasonable when public collaboration, integrations, or hosted CI matter more than self-hosting.

See [Git-Managed Homelab](/homelab/git-managed-homelab/) for the complete tradeoffs.

---

## 🧱 Recommended Stacks by Effort

### 🟢 Beginner — No Server

- Brave
- Brave Search / DuckDuckGo
- Bitwarden / Proton Pass
- Signal
- Ente Auth
- Two hardware security keys
- Proton Mail
- SimpleLogin
- Proton Drive
- Organic Maps
- Quad9

### 🟡 Intermediate — Privacy Without Becoming a Sysadmin

Everything above, plus:

- Custom email domain
- Mullvad or Proton VPN
- Ente Photos
- Cryptomator
- Syncthing
- Notesnook / Joplin
- LibreOffice / ONLYOFFICE

### 🔴 Self-Hosted

Add only the applications you actually need:

- AdGuard Home + Pi-hole
- Nextcloud or Seafile
- Immich
- Paperless-ngx
- Vaultwarden
- SearXNG
- Jellyfin
- Audiobookshelf
- Actual Budget
- Forgejo
- Tailscale

The goal is not to self-host the longest possible list. Every service you host becomes another service you need to patch, back up, and recover.
