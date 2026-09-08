---
title: "🐧 Linux"
description: >-
  Linux guides for desktops, workstations, and servers: preferred non-systemd builds with Artix and Devuan, plus mainstream Fedora and Debian reference installations.
---
Guides for building clean, stable, and sovereign Linux systems across desktops, laptops, workstations, and servers.

This section focuses on:

- Practical Linux installs
- Post-install configuration
- Real-world troubleshooting
- Systems that maximize **user control and independence**

---

## 🧭 What You'll Find Here

- **Preferred Non-systemd Installs** → Artix desktop and Devuan server
- **Mainstream Reference Installs** → Fedora desktop and Debian server
- **Post-Install Configuration** → Security, firmware, remote access, storage, backups, and operational checks
- **System Philosophy** → Why the operating system and init choices matter

---

## ⚠️ Core Principle

> Your operating system should serve **you** and not external systems, platforms, or identity frameworks.

---

## 🚫 Why Avoid systemd

Modern Linux distributions ("distros") have largely standardized around **systemd** as their init and service-management platform.

Why avoid the general, mainstream de-facto init system?

Because systemd represents a shift toward:

- Centralization of core system control
- Deep integration across system components
- Reduced transparency compared to traditional UNIX-style init systems

More importantly, it introduces a layer where external control mechanisms can be embedded at scale.

This includes the growing global push toward:

- Age verification systems
- Identity-linked access controls
- Device-level enforcement mechanisms

Operating systems are becoming enforcement layers. And systemd is the most likely insertion point within Linux.

Many brave and pioneering developers in the Linux community have called out systemd, and recommend non-systemd distributions where practical because they preserve a more modular Unix-style design and reduce dependence on one deeply integrated system-management layer.

The preferred paths for non-systemd distros here are:

### 🔹 Artix Linux (Arch-based)

- No systemd
- Rolling release
- Choice of init options including OpenRC, runit, s6, or Dinit
- Highly configurable
- Excellent for users who want to understand and control the desktop stack

### 🔹 Devuan (Debian-based)

- No systemd
- Stable release model
- Uses the traditional Linux init, SysVinit
- Familiar Debian ecosystem
- Excellent for servers and long-term deployments

Useful references for additional non-systemd distributions:

- <https://nosystemd.org/>
- <https://systemdfree.com/>

---

## 🧭 Why Fedora and Debian Are Included

Avoiding systemd is a preference and a proactive, independent choice.

Fedora and Debian remain important reference platforms and are widely used across real desktops, servers, development environments, and production infrastructure.

They are included because:

- They are mainstream Linux standards
- Hardware and software vendors commonly target them
- Troubleshooting information is abundant
- Many users will encounter them professionally

The distinction is deliberate:

> **Artix / Devuan are the preferred independence-first path. Fedora / Debian are the mainstream reference path.**

---

## 🖥️ Desktop Guides

### [Artix Linux Manual Installation](/linux/artix-kde-openrc-install/)

Manual Artix installation with OpenRC, Btrfs, zram, and KDE Plasma.

Best for:

- Maximum control
- Learning the system
- Non-systemd desktop builds

### [Fedora KDE Plasma Desktop](/linux/fedora-kde-install/)

Fedora's graphical installer and defaults, followed by RPM Fusion, AMD/NVIDIA configuration, privacy cleanup, and practical workstation setup.

Best for:

- New hardware
- Mainstream compatibility
- Modern KDE/Wayland
- Workstations where current kernels and drivers matter

---

## 🖧 Server Guides

### [Devuan Server Installation](/linux/devuan-server-install/)

Debian-style server with sysvinit and no systemd.

Best for:

- Stable non-systemd servers
- Docker hosts
- Long-lived infrastructure

### [Debian Server Installation](/linux/debian-server-install/)

Mainstream Debian 13 ("Trixie") server with systemd, ext4, SSH, Docker's official repository, Tailscale, NAS storage, and optional NVIDIA support.

Best for:

- Standard Debian infrastructure
- Vendor compatibility
- Mainstream server environments

---

## 🔧 Post-Install

### [Linux Post-Install Baseline](/linux/post-install-baseline/)

A distro-neutral checklist covering:

- Updates
- Firmware
- Administrative accounts
- SSH
- Firewalling
- SELinux / MAC
- Tailscale
- Storage
- Backups
- Exposure audits
- Reboot validation

---

## 🧠 Choosing Between Them

| Goal | Recommended starting point |
| :--- | :--- |
| Non-systemd modern desktop | **Artix** |
| Mainstream/current-hardware modern desktop | **Fedora** |
| Non-systemd stable server | **Devuan** |
| Mainstream/reference server | **Debian** |

There is no single Linux distribution that is best for every machine.

The right choice depends on what you are optimizing for: independence, support, hardware enablement, stability, familiarity, or software compatibility.

---

## 🧠 Final Thought

Convenience and control are often in tension.

There are other Linux distros and desktop styles available as well. All are available for experimentation.

But, this section tries to document both ends honestly: the preferred independent, de-centralized systems **and** the mainstream systems worth knowing well.