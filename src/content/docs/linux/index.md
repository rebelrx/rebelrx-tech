---
title: "🐧 Linux"
description: >-
  Linux guides for people who want control: why Linux, Artix desktop installation, and Devuan server setup — all without systemd.
---
Guides for building clean, stable, and sovereign Linux systems across desktops, laptops, and servers.

This section focuses on:

- Practical Linux installs  
- Post-install configuration  
- Real-world troubleshooting  
- Systems that maximize **user control and independence**  

---

## 🧭 What You'll Find Here

- **Install Guides** → Step-by-step setups for curated non-systemd Linux distributions  
- **Post-Install Configuration** → Hardening, usability, performance  
- **Troubleshooting** → Real-world fixes  
- **System Philosophy** → How to think about Linux correctly  

---

## ⚠️ Core Principle

> Your operating system should serve **you** and not external systems, platforms, or identity frameworks.

---

## 🚫 Why Avoid systemd

Modern Linux distributions have largely standardized around **systemd** as their init system.

RebelRx explicitly avoids systemd.

### Why?

Because systemd represents a shift toward:

- Centralization of core system control  
- Deep integration across system components  
- Reduced transparency compared to traditional UNIX-style init systems  

More importantly:

> It introduces a layer where external control mechanisms can be embedded at scale.

This includes the growing global push toward:

- Age verification systems  
- Identity-linked access controls  
- Device-level enforcement mechanisms  

RebelRx assumes the opposite:

> Operating systems are becoming enforcement layers.

And systemd is the most likely insertion point within Linux.

---

## 🔐 Privacy & Control Philosophy

Across all major platforms (Windows, macOS, iOS, Android), we are already seeing:

- Mandatory account integration  
- Increasing telemetry and tracking  
- Platform-level restrictions tied to identity  

Linux is often presented as the alternative.

But:

> Not all Linux is created equal.

Your level of control depends heavily on:

- Your distribution  
- Your init system  
- Your willingness to avoid convenience-driven defaults  

---

## 🧱 Recommended Approach (Non-systemd)

To minimize exposure to centralized control layers, this guide focuses on:

### 🔹 Artix Linux (Arch-based)

- No systemd  
- Rolling release  
- Multiple init options (OpenRC, runit, s6)  
- Maximum flexibility and control  

### 🔹 Devuan (Debian-based)

- No systemd  
- Stable release model  
- Familiar Debian ecosystem  
- Ideal for servers and long-term deployments  

👉 Full list of non-systemd based Linux distributions: <https://nosystemd.org/> and <https://systemdfree.com/>

---

## 📚 Guides

- [Artix Desktop Manual Install](/linux/artix-kde-openrc-install/)  
- [Devuan Server Install](/linux/devuan-server-install/)  

---

## 🚧 Guides In Development

- Linux Terminal & Command Reference  
- System Hardening Guide  
- Backup & Recovery Strategy  

---

## 🧠 Final Thought

Convenience and control are often inversely related.

This section prioritizes control even when it requires more effort.
