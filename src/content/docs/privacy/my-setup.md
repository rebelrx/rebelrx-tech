---
title: "🧪 RebelRx Setup"
description: >-
  The current RebelRx hardware and infrastructure setup — personal systems, servers, AI compute, storage, networking, and backup architecture.
---

This is the hardware and infrastructure I actually use every day. It is included as a **real-world example**, not a shopping list or a blueprint you need to copy.

The useful part is the pattern: everyday computers stay easy to use, persistent services live on dedicated server infrastructure, important data lives on redundant storage, less-trusted devices are segmented, DNS filtering happens at the network level, remote administration uses a private access layer, and backups exist independently of the machines being backed up.

> 💡 You can implement the same design with one used mini PC, one NAS, and good backups. The number of machines is not the point.

---

## 🧠 ELI5: How This Setup Fits Together

Think of the environment as a small set of jobs rather than a pile of computers:

| Layer | Job | Example |
|---|---|---|
| **Personal computers** | The machines I interact with directly | Windows desktop, Fedora desktop, Linux laptop |
| **Application server** | Runs persistent self-hosted services | Docker host |
| **Test environment** | Safe place to break things | Proxmox VM host |
| **AI compute** | Runs large local models and GPU workloads | GPU workstation |
| **AI orchestration** | Runs agents and coordinates tools/models | DGX Spark |
| **Storage** | Keeps bulk and application data separate from compute | NAS systems |
| **Network services** | DNS filtering and secure remote access | AdGuard Home, Pi-hole, Tailscale |
| **Dedicated appliances** | Keeps important single-purpose services independent | Home Assistant, Roon, Bitcoin node |
| **Backups / DR** | Provides recovery when local systems fail | Local backup + off-site copy |

A much smaller version could be:

```text
Laptop / desktop
      │
      ├── Mini PC running Docker
      │      ├── AdGuard Home
      │      ├── Nextcloud
      │      ├── Paperless-ngx
      │      └── other apps
      │
      └── NAS
             ├── files
             └── backups

Off-site backup → separate location/provider
```

That already captures most of the important architecture.

---

## ✅ What I Would Copy First

If you are building your own environment, I would prioritize these pieces before adding specialized hardware:

1. One reliable server or mini PC.
2. A separate place for important storage.
3. Automatic backups.
4. A tested off-site copy for irreplaceable data.
5. Network-wide DNS filtering if you want it.
6. Tailscale or another private remote-access method.
7. Only then add dedicated systems for workloads that truly benefit from isolation or more performance.

This page intentionally stays at the **system and architecture level**. Detailed implementation belongs in the linked homelab guides.

---

## 💻 Personal Systems

These are the machines I use at my desk.

### Custom Ryzen Desktop

My primary everyday desktop and gaming PC is a self-built AMD system.

- **CPU:** AMD Ryzen 9 9950X3D
- **GPU:** ASUS ROG Astral GeForce RTX 5090
- **Memory:** 96GB DDR5
- **OS:** Windows 11
- **Role:** Main desktop, gaming, and Windows applications

The RTX 5090 makes the system exceptionally capable for gaming and GPU-accelerated desktop workloads, while the 9950X3D also gives it enough CPU performance for demanding productivity work.

---

### [Framework Desktop](https://frame.work/desktop)

The Framework Desktop is my primary Linux desktop outside of the dedicated AI workstation.

- **OS:** Fedora KDE Plasma
- **Role:** Linux productivity and general desktop use

Fedora gives me a current Linux desktop environment with excellent hardware support, while KDE Plasma provides the desktop workflow I prefer.

👉 See my [Fedora KDE Desktop Installation Guide](/linux/fedora-kde-install/).

---

### [Framework Laptop 13 Pro](https://frame.work/laptop13pro)

My primary laptop is an Intel-based Framework Laptop 13 Pro.

- **OS:** Artix Linux
- **Desktop:** KDE Plasma
- **Init:** OpenRC
- **Role:** Portable Linux workstation, remote administration, and general productivity

This remains one of the systems where I can use my preferred non-systemd Linux environment without compromising what I need from the hardware.

👉 See my [Artix KDE + OpenRC Installation Guide](/linux/artix-kde-openrc-install/).

---

## 🧱 Core Server Infrastructure

The rack contains the systems that provide persistent compute, storage, testing, automation, and AI capacity for the rest of the environment.

### Primary Server — [Minisforum MS-A2 Mini Workstation](https://store.minisforum.com/products/minisforum-ms-a2-workstation)

The MS-A2 is the general-purpose server at the center of the environment.

- **CPU:** AMD Ryzen 9 9955HX
- **GPU:** NVIDIA RTX 2000E 16GB
- **Memory:** 96GB DDR5
- **Storage:** Multiple NVMe SSDs
- **OS:** Debian 13
- **Role:** Primary general-purpose server and application host

I moved this system to Debian because it is an extremely well-supported server platform and a useful reference point alongside my preferred Devuan-based approach.

👉 See my [Debian 13 Server Installation Guide](/linux/debian-server-install/).

---

### Virtualization Lab — [Beelink SER9 MAX](https://www.bee-link.com/products/beelink-ser9-max-amd-ryzen-7-h-255) 

Rather than testing operating systems and potentially disruptive changes on production hardware, I keep a dedicated Proxmox system for experimentation.

- **CPU:** AMD Ryzen 7 H 255
- **Memory:** 64GB DDR5
- **Storage:** NVMe SSD
- **Hypervisor:** Proxmox VE
- **Role:** Virtual machines, Linux distribution testing, and build validation

This is where I can test clean installs, document installation procedures, and experiment with operating systems without risking the systems I depend on every day.

For example, this environment was useful while developing and validating my Devuan server build.

---

### Windows Utility Workstation — [Minisforum MS-S1 MAX AI Workstation](https://store.minisforum.com/products/minisforum-ms-s1-max-mini-pc)

Some workloads are better handled by a powerful Windows machine that can run independently of my main desktop.

- **CPU:** AMD Ryzen AI Max+ 395
- **Graphics:** Radeon 8060S
- **Memory:** 128GB
- **Storage:** High-capacity NVMe storage
- **OS:** Windows 11
- **Role:** General Windows utility workstation

I primarily use it for:

- Disc ripping
- Large file conversions
- ROM and game-library management
- CPU-intensive batch workloads
- Other long-running Windows tasks that I do not want tying up my main desktop

---

## 🤖 Local AI & GPU Compute

Local AI has become a substantial part of the lab, so I separate heavy GPU inference from agent orchestration and general-purpose server workloads.

### Threadripper PRO AI Workstation

This is the main local GPU compute system and by far the most powerful machine in the environment.

- **CPU:** AMD Ryzen Threadripper PRO 9975WX, 32 cores
- **GPU:** 2 × NVIDIA RTX PRO 6000 Blackwell Workstation Edition, 96GB each
- **Total GPU memory:** 192GB VRAM
- **Memory:** 256GB ECC DDR5
- **OS:** Fedora 44 KDE Plasma
- **Role:** Local AI inference, GPU compute, model experimentation, and high-end workstation workloads

The system is intentionally built around large local models and GPU-heavy workloads. Local NVMe storage is used primarily for active AI models and working data rather than long-term archival storage.

Those working datasets and configurations are backed up separately to network storage.

---

### [NVIDIA DGX Spark](https://www.nvidia.com/en-us/products/workstations/dgx-spark/)

The DGX Spark serves a different purpose from the large GPU workstation.

- **Platform:** NVIDIA DGX Spark
- **OS:** DGX OS
- **Storage:** 4TB NVMe
- **Role:** AI agent and orchestration system

I use it primarily as the control/orchestration layer for agentic AI workflows, including **Hermes Agent**. Heavy inference can be delegated to my AI workstation or cloud models (e.g., ChatGPT, Claude).

Separating orchestration from the primary GPU workstation keeps the AI environment much more flexible.

---

## 💾 Storage Architecture

Storage is deliberately separated from compute.

### Bulk NAS Storage - [QNAP TS-h1277AXU-RP](https://www.qnap.com/en-us/product/ts-h1277axu-rp)

Two rack-mounted QNAP 12-bay NAS systems provide the bulk storage layer.

The arrays are **independent storage pools with different content**, rather than simple mirrors of one another.

Their primary uses are:

- Media libraries
- Long-term archival storage
- Large datasets
- Centralized network storage

One system uses 12 × 24TB enterprise hard drives, while the other uses 12 × 20TB drives, providing substantial raw storage capacity across the two arrays.

> 💡 Keeping bulk storage separate from compute means servers and workstations can be replaced or rebuilt without moving the underlying data architecture with them.

---

### High-Speed Application Storage — [QNAP TBS-h574TX NASbook](https://www.qnap.com/en-us/product/tbs-h574tx)

A QNAP all-flash NAS provides a separate high-speed storage tier.

- **Storage:** 5 × 3.84TB flash drives
- **Usable role:** Fast shared storage for self-hosted data-intensive applications
- **Protocol:** NFS where appropriate

I use this tier for workloads where latency and responsiveness matter more than maximum capacity, including private cloud storage and document-management data.

Use this tier for application-supported document/upload storage; keep SQLite and other locking-sensitive live databases on local disks unless the application explicitly supports the network-storage configuration. See [NAS Mounting](/homelab/nas-mounting/).

This keeps supported application data off the bulk media arrays while also avoiding dependence on storage inside a single compute host.

---

### Off-Site Disaster Recovery - [Hetzner](https://www.hetzner.com/)

Local redundancy does not protect against every failure scenario.

I therefore maintain separate **off-site storage** for disaster recovery of important media and archival data.

The goal is not to make the remote system part of the live storage environment. It exists as an independent recovery target if the local storage environment suffers a major failure or loss.

👉 See the [Disaster Recovery Runbook](/homelab/disaster-recovery/).

---

## 🌐 Network Architecture

The wired backbone of the lab is built around **10 Gigabit Ethernet**, with a [QNAP QSW-M3224-24T](https://www.qnap.com/en-us/product/qsw-m3224-24t) managed 10GbE switch serving as the core LAN switch.

My Internet connection is multi-gigabit fiber, so the internal network has enough capacity that communication between workstations, servers, and storage does not become the bottleneck for most workloads.

I also separate **IoT** and **guest** devices from the primary network rather than treating every device in the house as equally trusted.

---

### DNS & Network Privacy

Network-wide DNS filtering uses a primary/secondary design:

- **AdGuard Home** → Primary DNS filtering
- **Pi-hole** → Secondary/backup DNS filtering

This gives me network-level blocking while retaining a second DNS filtering path if the primary service is unavailable.

👉 See [DNS & Network Privacy](/homelab/dns-and-network-privacy/).

---

### Remote Access

I use **Tailscale** as the primary private remote-access layer for infrastructure administration.

Selected web services can also be presented through a reverse proxy where appropriate, but I avoid exposing internal management interfaces unnecessarily.

👉 See my [Tailscale Guide](/homelab/tailscale/).

---

## 🏠 Dedicated Appliances

Some systems are deliberately kept single-purpose rather than folded into the primary server.

### Home Assistant

A [Beelink Mini S13](https://www.amazon.com/dp/B0BTBPC6TY) is dedicated entirely to Home Assistant OS.

- **CPU:** Intel N150
- **Memory:** 16GB
- **Storage:** 500GB NVMe
- **OS:** Home Assistant OS
- **Role:** Smart-home automation

Running Home Assistant on dedicated hardware keeps home automation independent of maintenance or failures affecting the general server environment.

---

### Pi-hole

A [Raspberry Pi 4B](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/) provides the secondary DNS filtering service.

- **Role:** Backup DNS filtering
- **Primary DNS:** AdGuard Home elsewhere in the infrastructure

Using a physically separate small device for secondary DNS gives the network a useful fallback when performing maintenance on the primary server environment.

---

### [Umbrel Home](https://umbrel.com/umbrel-home)

An Umbrel Home is used as a dedicated **local Bitcoin node**.

Keeping this workload on its own appliance makes it easy to operate independently from the rest of the self-hosted infrastructure.

👉 Learn more about Umbrel: <https://umbrel.com/>

---

### Roon ROCK Server

An Intel NUC11 is dedicated exclusively to Roon ROCK, my Roon music server.

- **CPU:** Intel Core i7-1165G7
- **Role:** Dedicated Roon music server

Roon is one of the workloads I prefer to keep appliance-like: the system exists for one purpose and generally does not need to be touched.

---

## 🔌 Out-of-Band Management - [GL.iNet GL-RM10 Comet Pro Remote KVM](https://www.gl-inet.com/en-us/products/gl-rm10?country=US)

Several important systems use dedicated remote KVM hardware.

This gives me console-level access even when an operating system is unavailable, networking inside the host is misconfigured, or a machine needs BIOS/UEFI-level intervention.

For a rack containing multiple servers and compute systems, remote KVM access is one of those features that seems optional until the first time it saves a trip to the rack.

👉 Learn more about [GL.iNet Remote KVMs](https://www.gl-inet.com/en-us/collections/remote-kvms?country=US)

---

## 💽 Backup Strategy

Backups are designed around the idea that **configuration, application data, and irreplaceable working data matter more than the operating-system installation itself**.

I use **Kopia** to protect the important data from the primary server, AI workstation, and DGX Spark, including items such as:

- Infrastructure configuration
- Application data
- AI models and related working data
- Important local datasets

Backups are written to local NAS storage, while separate off-site storage provides another recovery layer for large media and archival collections.

This makes rebuilding a failed compute node significantly easier because the system itself can be reinstalled while the important state is restored from backup.

👉 See [Backup & Recovery](/homelab/backup-and-recovery/) and the [Disaster Recovery Runbook](/homelab/disaster-recovery/).

---

## 🧠 Why the Environment Is Split This Way

At first glance, using this many systems can look unnecessarily complicated. In practice, the separation is intentional.

| System type | Primary responsibility |
|---|---|
| Personal desktops/laptop | Interaction, productivity, gaming |
| General server | Persistent self-hosted compute |
| Virtualization host | Testing and disposable environments |
| AI workstation | Heavy GPU inference and compute |
| DGX Spark | AI agent orchestration |
| Bulk NAS systems | Media and archival storage |
| Flash NAS | High-speed application data |
| Home Assistant appliance | Home automation |
| Roon appliance | Music server |
| Umbrel appliance | Bitcoin node |
| Off-site storage | Disaster recovery |

The advantage is that I can upgrade, rebuild, or experiment with one layer without necessarily disrupting the others.

For example:

- Reinstalling the AI workstation does not affect bulk storage.
- Testing a Linux distribution happens on the virtualization host rather than a production server.
- Server maintenance does not take Home Assistant offline.
- A failed workstation does not contain the only copy of important data.

---

## ✅ What This Architecture Gives Me

The current setup provides:

- High-performance local compute
- Large local AI inference capacity
- Independent AI orchestration
- Fast 10GbE access to centralized storage
- Separate high-speed and bulk storage tiers
- Dedicated environments for virtualization and testing
- Secure remote administration
- Segmentation for less-trusted devices
- Local and off-site recovery options
- The ability to replace individual systems without redesigning the entire environment

---

## 🚀 Practical Takeaway

Do not copy the hardware list. Copy the **separation of responsibilities**:

1. Keep important data backed up independently of the computer using it.
2. Keep experiments away from services you rely on.
3. Use dedicated appliances only when independence or reliability justifies them.
4. Keep private administration private instead of exposing management interfaces directly to the Internet.
5. Document enough of the environment that you could rebuild it after a failure.

If your needs are met by one mini PC and a NAS, that is a successful homelab. Add complexity only when a real workload requires it.
