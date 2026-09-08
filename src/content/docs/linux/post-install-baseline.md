---
title: "Linux Post-Install Baseline"
description: >-
  A distro-neutral Linux post-install checklist for updates, firmware, accounts, SSH, firewalling, storage, backups, privacy, and operational validation.
---
Installing Linux is only the beginning. A system becomes dependable when its **update path, access model, storage, firewall, backups, and recovery process** are deliberately configured.

This guide is a distro-neutral baseline. Use the distribution-specific install guide first, then apply the relevant sections here.

---

<a id="1-update-before-customizing"></a>

## 🔄 1. Update Before Customizing

On Fedora:

```bash
sudo dnf upgrade --refresh
```

On Debian/Devuan:

```bash
sudo apt update
sudo apt full-upgrade
```

On Artix:

```bash
sudo pacman -Syu
```

Avoid layering third-party repositories and custom packages onto a stale base system.

---

<a id="2-verify-time-and-timezone"></a>

## ✅ 2. Verify Time and Timezone

Correct time matters for TLS, logs, authentication, backups, and scheduled jobs.

```bash
date
timedatectl 2>/dev/null || true
```

On non-systemd distributions, verify the equivalent NTP service directly.

---

<a id="3-firmware-and-microcode"></a>

## 🧭 3. Firmware and Microcode

Keep motherboard/laptop firmware and device firmware current.

On supported systems using LVFS:

```bash
fwupdmgr get-updates
```

For CPU microcode, prefer your distribution's packages rather than downloading opaque firmware blobs from random mirrors.

---

<a id="4-remove-what-you-do-not-use"></a>

## 🧭 4. Remove What You Do Not Use

Every unused daemon, browser extension, cloud integration, package repository, and exposed port adds maintenance and attack surface.

Audit:

```bash
ss -tulpn
```

Then identify why each listening service exists.

---

<a id="5-administrative-accounts"></a>

## 🔒 5. Administrative Accounts

Use a normal user for daily work.

Use `sudo` or the distribution's appropriate privilege mechanism for administration.

Avoid:

- Daily root logins
- Shared administrator accounts
- Password reuse
- Permanent broad permissions added to "fix" an application

---

<a id="6-ssh-baseline"></a>

## 🔒 6. SSH Baseline

Servers should use key-based SSH whenever practical.

Generate an Ed25519 key on the client:

```bash
ssh-keygen -t ed25519
```

Copy it to the server:

```bash
ssh-copy-id user@host
```

Only disable password authentication after key login has been tested successfully.

---

<a id="7-firewall-baseline"></a>

## 🔒 7. Firewall Baseline

The firewall should be enabled even on a trusted LAN.

The important question is not which frontend you use. It is:

> Which services can receive traffic, from where, and why?

Document intentional exceptions.

Container hosts need extra attention because Docker and other runtimes may create their own netfilter rules.

---

<a id="8-selinux--mandatory-access-control"></a>

## 🔒 8. SELinux / Mandatory Access Control

On Fedora, leave SELinux enforcing.

```bash
getenforce
```

Do not disable a security layer because one application needs a corrected label or policy.

On other distributions, AppArmor or another MAC system may fill a similar role.

---

<a id="9-remote-access"></a>

## 🧭 9. Remote Access

Prefer private overlay networking such as Tailscale for management services rather than exposing SSH, dashboards, and admin interfaces directly to the Internet.

See [Tailscale](/homelab/tailscale/).

---

<a id="10-storage-layout"></a>

## 🗂️ 10. Storage Layout

Decide explicitly where these categories live:

- Operating system
- Application configuration
- Application databases
- Bulk media/data
- Backups
- Temporary/cache data

Keep latency-sensitive databases local unless the application specifically supports network storage.

---

<a id="11-filesystem-health"></a>

## 🧭 11. Filesystem Health

Know what your filesystems are:

```bash
lsblk -f
df -hT
```

For SSD/NVMe devices, confirm discard/TRIM behavior appropriate to the filesystem and distribution.

---

<a id="12-backups-before-data"></a>

## 💾 12. Backups Before Data

Do not wait until a system is "finished" before configuring backups.

Before production use, answer:

- What is backed up?
- Where is the local copy?
- Where is the offsite copy?
- Are backups encrypted?
- How long are versions retained?
- How is the encryption key recovered?
- When was the last restore test?

See [Backup & Recovery](/homelab/backup-and-recovery/).

---

<a id="13-package-sources"></a>

## 📦 13. Package Sources

Prefer, in order:

1. Official distribution repositories
2. Official upstream vendor repository when justified
3. Well-established community repository
4. Manual packages only when necessary

Avoid adding repositories simply to obtain one package without understanding who signs and maintains them.

---

<a id="14-desktop-privacy-baseline"></a>

## 🧭 14. Desktop Privacy Baseline

For desktop systems, review:

- Online accounts
- Cloud synchronization
- Location services
- Search/indexing
- Browser telemetry
- Browser extensions
- Password storage
- Bluetooth
- Remote desktop/sharing
- Crash reporting

Privacy comes from deliberate choices, not a single magic toggle.

---

<a id="15-server-exposure-baseline"></a>

## 🧭 15. Server Exposure Baseline

List listening sockets:

```bash
sudo ss -tulpn
```

For every public or LAN-bound service, know:

- What owns the port
- Whether authentication is required
- Whether TLS is used
- Whether it should instead bind to localhost/Tailscale
- Whether a reverse proxy is needed

---

<a id="16-logs-and-failed-services"></a>

## 🧭 16. Logs and Failed Services

On systemd:

```bash
systemctl --failed
journalctl -p warning -b
```

On OpenRC/sysvinit, use the service manager and `/var/log` files appropriate to the distribution.

A new install should not begin its life with ignored boot errors.

---

<a id="17-reboot-test"></a>

## 🧭 17. Reboot Test

After configuration, reboot.

Then verify:

- Network returns
- Remote access returns
- NAS mounts return
- Containers/services start in the right order
- No new failed services appear
- GPU drivers load
- Backups can still reach their target

The reboot test is part of installation.

---

<a id="18-document-the-system"></a>

## 🧭 18. Document the System

Record at minimum:

- Hostname
- OS and release
- Purpose
- Primary storage
- Important mount points
- Network role
- Backup destination
- Services
- Non-default repositories
- Recovery notes

The best time to document a system is while you still remember why you made each decision.

---

<a id="final-thought"></a>

## 🧠 Final Thought

A clean Linux install is not defined by how many tweaks were applied.

It is defined by how few surprises remain.
