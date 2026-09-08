---
title: "🏠 Homelab"
description: >-
  Build a sovereign, privacy-first homelab: Docker standards, private networking, DNS filtering, local AI, monitoring, Git-managed infrastructure, storage, and tested disaster recovery.
---
Guides for building a sovereign, privacy-first homelab you fully control.

This section focuses on:

- Self-hosting critical services
- Eliminating unnecessary cloud dependency
- Designing systems that are stable, observable, and maintainable
- Taking back ownership of your data and infrastructure

---

## ⚠️ Core Principle

> If you don’t control your infrastructure, you don’t control your data.

---

## 🧭 Start Here

### [Docker Homelab](/homelab/docker-home-lab/)

Install and operate a Compose-first homelab on bare-metal Linux.

### [Docker Infrastructure Standards](/homelab/docker-infrastructure-standards/)

The conventions that keep multiple hosts and dozens of stacks maintainable: directory layout, environment variables, Compose validation, documentation, updates, and backups.

### [Git-Managed Homelab](/homelab/git-managed-homelab/)

Use Git/Forgejo as the configuration history and source of truth for infrastructure changes.

---

## 🌐 Network & Access

### [Tailscale](/homelab/tailscale/)

Private remote access without exposing administrative services directly to the Internet.

### [DNS & Network Privacy](/homelab/dns-and-network-privacy/)

AdGuard Home/Pi-hole concepts, upstream DNS, browser DNS over HTTPS (DoH), Internet of Things (IoT) segmentation, and the real limits of DNS blocking.

### [Nginx Proxy Manager](/homelab/nginx-proxy-manager/)

Reverse-proxy patterns for services that need clean internal or controlled external access.

---

## 💾 Storage & Recovery

### [Mounting NAS Storage](/homelab/nas-mounting/)

NFS/SMB design, reliable mounts, Docker ordering, and avoiding databases on network filesystems.

### [Backup & Recovery](/homelab/backup-and-recovery/)

Layered backups, retention, local/offsite copies, and restore testing.

### [Disaster Recovery Runbook](/homelab/disaster-recovery/)

Recovery order, full-host rebuilds, key recovery, offsite planning, and restore drills.

---

## 🧠 Local AI

### [Self-Hosted AI](/homelab/self-hosted-ai/)

Local LLMs, embeddings, image generation, speech recognition, text-to-speech, GPU allocation, and safe agent architecture.

Local AI belongs in the homelab when it provides a real benefit: privacy, latency, capability, or independence — not simply because a GPU is available.

---

## 📊 Monitoring & Management

### [Homelab Monitoring & Management](/homelab/monitoring-and-management/)

Host reachability, system metrics, Docker management, service health, storage capacity, GPU monitoring, and actionable alerting.

> Monitor what predicts outages and data loss, not what produces the prettiest dashboard.

---

## 🧱 Design Philosophy

Homelab is built around:

- Local-first infrastructure
- Minimal external dependencies
- Clear separation of services
- Reproducible deployments
- Git-managed configuration
- Explicit storage boundaries
- Tested backups
- Private-by-default administration

It avoids:

- Over-engineering for the sake of complexity
- Blindly copying configurations without understanding them
- Publicly exposing admin interfaces for convenience
- Treating RAID as backup
- Treating a running container as proof an application is healthy
- “Set it and forget it” systems that silently decay

---

## 🧭 A Sensible Learning Order

If you are building from scratch:

1. Install a clean Linux server
2. Configure private administration
3. Install Docker
4. Adopt a standard stack layout
5. Put configuration in Git
6. Add NAS storage deliberately
7. Add backups before irreplaceable data
8. Add monitoring
9. Add higher-level services
10. Test disaster recovery

---

## 🚧 Future Guides

- Self-Hosted Retro Gaming with RomM
- Home Assistant infrastructure integration

---

## 🧠 Final Thought

Cloud platforms optimize for scale and data aggregation.

Your homelab should optimize for:

> Control, reliability, recoverability, and understanding.
