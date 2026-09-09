---
title: "🏠 Homelab"
description: >-
  Build a practical homelab from start to finish: Docker, Git-managed configuration, NAS storage, DNS filtering, private remote access, monitoring, backups, disaster recovery, and local AI.
---
A homelab is simply a collection of computers, storage, networking, and software you run yourself to learn, experiment, automate, or host services at home. It can be one mini PC with Docker or a full rack; the useful part is what it lets you build, not how elaborate it looks.

These guides are written to hopefully provide up-front context and then more technical, hands-on guidance. Each page starts with the plain-English idea, defines the terms you need, gives you an implementation path, and then provides the deeper reference material that helps when you want to expand or troubleshoot the setup.

:::tip[ELI5]
You do not need to understand the entire homelab before starting. Pick one useful service, get it working cleanly, document it, back it up, and add the next layer only when it solves a real problem.
:::

## 🧭 If You Are New, Follow This Order

:::tip[ELI5]
This section is a suggested order of operations for getting your homelab up and running
:::

1. **Docker Homelab** — learn what containers are and run your first stack.
2. **Docker Infrastructure Standards** — organize stacks and persistent data consistently.
3. **Git-Managed Homelab** — put reproducible configuration under version control.
4. **NAS Mounting** — attach shared storage when applications need it.
5. **DNS & Network Privacy** — add network-wide filtering and sane DNS behavior.
6. **Tailscale** — add private remote access.
7. **Nginx Proxy Manager** — add friendly HTTPS names for internal web apps.
8. **Monitoring & Management** — learn when something is down or filling up.
9. **Backup & Recovery** — protect the data and application state that matter.
10. **Disaster Recovery** — document how to rebuild after a larger failure.
11. **Self-Hosted AI** — add local AI once the underlying compute, storage, networking, and backup layers are solid.

---

## ✅ What You Need to Know First

:::tip[ELI5]
A good homelab is understandable, reproducible, and recoverable.
:::

A good homelab is understandable, reproducible, and recoverable. Start with a working service, then add standards, storage, access, monitoring, and backups as the need appears.

---

## 🧭 Start Here

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

### [Docker Homelab](/homelab/docker-home-lab/)

Install and operate a Compose-first homelab on bare-metal Linux.

### [Docker Infrastructure Standards](/homelab/docker-infrastructure-standards/)

The conventions that keep multiple hosts and dozens of stacks maintainable: directory layout, environment variables, Compose validation, documentation, updates, and backups.

### [Git-Managed Homelab](/homelab/git-managed-homelab/)

Use Git/Forgejo as the configuration history and source of truth for infrastructure changes.

---

## 🌐 Network & Access

:::tip[ELI5]
This section covers a network dependency or boundary you should understand before adding more complexity.
:::

### [Tailscale](/homelab/tailscale/)

Private remote access without exposing administrative services directly to the Internet.

### [DNS & Network Privacy](/homelab/dns-and-network-privacy/)

AdGuard Home/Pi-hole concepts, upstream DNS, browser DNS over HTTPS (DoH), Internet of Things (IoT) segmentation, and the real limits of DNS blocking.

### [Nginx Proxy Manager](/homelab/nginx-proxy-manager/)

Reverse-proxy patterns for services that need clean internal or controlled external access.

---

## 💾 Storage & Recovery

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

### [Mounting NAS Storage](/homelab/nas-mounting/)

NFS/SMB design, reliable mounts, Docker ordering, and avoiding databases on network filesystems.

### [Backup & Recovery](/homelab/backup-and-recovery/)

Layered backups, retention, local/offsite copies, and restore testing.

### [Disaster Recovery Runbook](/homelab/disaster-recovery/)

Recovery order, full-host rebuilds, key recovery, offsite planning, and restore drills.

---

## 🧠 Local AI

:::tip[ELI5]
Local LLMs, embeddings, image generation, speech recognition, text-to-speech, GPU allocation, and safe agent architecture.
:::

### [Self-Hosted AI](/homelab/self-hosted-ai/)

Local LLMs, embeddings, image generation, speech recognition, text-to-speech, GPU allocation, and safe agent architecture.

Local AI belongs in the homelab when it provides a real benefit: privacy, latency, capability, or independence — not simply because a GPU is available.

---

## 📊 Monitoring & Management

:::tip[ELI5]
This section focuses on a signal that helps you notice a real problem before or while it affects a service.
:::

### [Homelab Monitoring & Management](/homelab/monitoring-and-management/)

Host reachability, system metrics, Docker management, service health, storage capacity, GPU monitoring, and actionable alerting.

> Monitor what predicts outages and data loss, not what produces the prettiest dashboard.

---

## 🧱 Practical Design Guidelines

:::tip[ELI5]
This section explains practical design guidelines in practical terms and what it changes in the homelab.
:::

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

:::tip[ELI5]
Test disaster recovery before going live to production!
:::

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

:::tip[ELI5]
This section explains future guides in practical terms and what it changes in the homelab.
:::

- Self-Hosted Retro Gaming with RomM
- Home Assistant infrastructure integration

---

## ✅ What to Remember

:::tip[ELI5]
This is the short version to keep in mind after you finish the page.
:::

A useful homelab is one you can operate without guessing. Keep the configuration understandable, protect the data that matters, and make sure you know how to rebuild the pieces that fail.
