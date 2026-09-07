---
title: "📱 Mobile Privacy"
description: >-
  A three-level ladder for mobile privacy — harden the phone you have, replace the apps that track you, and when you're ready, replace the OS itself with GrapheneOS.
---
Your phone is the most personal surveillance device ever built. It knows where you sleep, who you talk to, what you read, and how long you look at it.

This guide is a **ladder, not a cliff**: three levels, each one a real improvement, each one optional.

---

## ⚠️ Core Principle

> The device you carry everywhere should answer to you; not report on you.

---

## 🧭 The Starting Reality

- **Stock Android** → Google Play Services runs with system-level privileges: location, sensors, app usage, network regardless of your settings toggles. A typical Android phone contacts Google servers hundreds of times per day.
- **iPhone** → Meaningfully better defaults and strong hardware security, but a closed system where Apple holds the metadata and the keys to the ecosystem.
- **De-googled Android** → The only path where the OS itself works for you.

You don't have to jump to the end. Start where you are.

---

## 🪜 Level 1 — Harden What You Have (Tonight, Free)

No new phone, no flashing. Thirty minutes:

- **Audit app permissions** → Settings → Privacy. Revoke location, microphone, and camera from everything that doesn't clearly need them. Prefer "Only while using."
- **Kill the advertising ID** → Android: Settings → Privacy → Ads → *Delete advertising ID*. iPhone: Settings → Privacy → Tracking → disable *Allow Apps to Request to Track*.
- **Delete apps you don't use** → Every installed app is standing attack surface and a data collector.
- **Use the browser instead of the app** where possible (social media especially) — websites get far less access than installed apps.
- **Turn off Wi-Fi and Bluetooth scanning** → Android buries these under Location settings; they beacon your presence even when Wi-Fi is "off."
- **Set a strong passcode** → 6+ digits minimum; biometrics are convenience, the passcode is the real lock.
- **iPhone extra** → Enable **Advanced Data Protection** (Settings → iCloud) for end-to-end encrypted backups.

> Level 1 doesn't defeat platform telemetry. It shrinks what the app layer collects and that's most of the daily bleeding.

---

## 🪜 Level 2 — Replace the Apps That Track You

Same phone, better software. The mobile versions of the [App Recommendations](/privacy/app-recommendations/):

| Replace | With | Why |
|--------|------|-----|
| Chrome / Safari | [Brave](https://brave.com/) | Built-in ad/tracker blocking |
| Google Search | [DuckDuckGo](https://duckduckgo.com/) / [Startpage](https://www.startpage.com/) | Reduced tracking |
| SMS / Messenger / WhatsApp | [Signal](https://signal.org/) | End-to-end encryption |
| Gmail app | [Proton Mail](https://proton.me/mail) / [Tuta](https://tuta.com/) | Encrypted email |
| Google Maps | [Organic Maps](https://organicmaps.app/) | Offline, open-source, zero tracking |
| Google Photos | [Immich](https://immich.app/) mobile app | Auto-backup to **your** server |
| Gboard | [HeliBoard](https://github.com/Helium314/HeliBoard) (Android) | Your keyboard shouldn't need network access |
| Google Authenticator / Authy | [Aegis](https://getaegis.app/) (Android) / [Ente Auth](https://ente.io/auth/) | Open-source 2FA, encrypted exportable backups |
| YouTube app | [NewPipe](https://newpipe.net/) (Android) | No account, no ads, no watch profiling |
| Notes app | [Joplin](https://joplinapp.org/) | Syncs with your existing setup |

### 🔑 A Word on 2FA Apps

Two-factor is non-negotiable but the *app* matters:

- **Google Authenticator** syncs your 2FA seeds to your Google account (unencrypted end-to-end for years) — the keys to everything, held by the company you're leaving
- **Authy** is closed-source and was breached in 2024 (phone numbers of 33M users exposed)
- **Aegis** and **Ente Auth** are open-source with encrypted, locally-controlled backups

:::caution[Back up your 2FA vault before you need it]
A lost phone with an unbacked-up authenticator locks you out of every
account it protected. Export the encrypted vault (both Aegis and Ente Auth
support this) and store it with your password manager backups. Test the
restore once.
:::
### 📦 Where to Get Apps (Android)

- **[F-Droid](https://f-droid.org/)** → Open-source apps, no account
- **[Obtainium](https://github.com/ImranR98/Obtainium)** → Install and update straight from developers' releases
- **[Aurora Store](https://auroraoss.com/)** → Anonymous front-end to the Play Store catalog for apps you can't avoid

---

## 🪜 Level 3 — Replace the OS (GrapheneOS)

App swaps can't fix an operating system that reports home. When you're ready to remove Google from the platform itself, [**GrapheneOS**](https://grapheneos.org/) is the strongest option available; a hardened, security-first Android with no Google services and no compromises bolted on.

### The Pixel Irony

Yes: the best way to escape Google's software is Google's hardware.

GrapheneOS supports **only Pixel devices** (currently Pixel 6 through the Pixel 10 series) because Pixels are the only mainstream phones that let you **re-lock the bootloader with your own signing keys** meaning verified boot protects *your* OS, not the vendor's. No other consumer hardware offers that.

:::tip[Practical buying advice]
- Buy **factory unlocked**, directly from Google or a reputable retailer —
  carrier-locked models (especially US Verizon/AT&T variants) often cannot
  be bootloader-unlocked at all
- A used Pixel 8/8a is the budget sweet spot: well under $350 with security
  support for years
- Newer models simply extend the support window
:::
### Installing

The [official web installer](https://grapheneos.org/install/web) runs from a browser. Connect the phone, follow the steps, re-lock the bootloader at the end. 15–20 minutes, no tooling to install.

### Living With It

- **Sandboxed Google Play** → If an app truly requires Play Services, GrapheneOS can run the real thing as an ordinary, unprivileged, fully sandboxed app; no system-level access, installed only in the profile you choose. Most people put it in a separate profile and keep their main profile Google-free.
- **User profiles** → Full isolation between contexts (personal / work / "apps that demand Google")
- **Day-to-day** → It's still Android. Your Level 2 apps all work.

:::caution[Check your banking apps first]
Some banking apps demand Google's hardware attestation and refuse to run
on any custom OS — roughly half work on GrapheneOS with sandboxed Play,
and it varies by bank and by year. Check community compatibility lists for
your specific apps **before** flashing. The fallback that always works:
your bank's website in Brave.
:::
### Alternative: CalyxOS

[CalyxOS](https://calyxos.org/) trades some of GrapheneOS's hardening for convenience: **microG** (an open-source Play Services reimplementation) ships pre-installed, and it supports Fairphone and some Motorola devices in addition to Pixels. A reasonable middle path — but if you have a supported Pixel, GrapheneOS is the stronger choice.

---

## 🚫 What Not To Do

- Don't root your phone for privacy. Rooting **breaks** the security model and verified boot that protect you
- Don't install random "privacy" apps from the Play Store. Most are adware wearing a trench coat
- Don't flash abandoned or one-maintainer ROMs. An OS without security updates is worse than stock
- Don't try to do all three levels in one weekend. That's how migrations get abandoned

---

## 🧠 Final Thought

Your phone sees more of your life than any other object you own.

Every level of this ladder moves it closer to being **yours**:

> Same pocket. Different allegiance.
