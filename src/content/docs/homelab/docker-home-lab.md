---
title: "🐳 Docker Homelab (Devuan + Compose)"
description: >-
  Build a clean, reproducible Docker Compose homelab on bare-metal Devuan — no systemd, no hypervisor overhead.
---
A practical guide to running a **clean, reproducible Docker homelab** on bare metal using Devuan and Docker Compose.

Most homelab guides assume Debian, Ubuntu, or some other systemd distro. This one goes the other way: **Devuan**, Debian *without* systemd, for a leaner, init-simple base you fully control. The Compose stacks come from the [RebelRx homelab repo](https://github.com/rebelrx/rebelrx-homelab) and run the same on any Docker host; here we set them up the Devuan way.

---

## 🔥 Why Docker (Not Proxmox)

You *can* use Proxmox. Many people do.

For this Docker host, I prefer bare metal because it reduces the number of layers to maintain. A dedicated hypervisor remains useful for OS testing, snapshots, and stronger workload isolation—as in [my setup](/privacy/my-setup/).

### ❌ Proxmox Challenges

- VM overhead (CPU + RAM waste)
- More layers to debug
- Backup complexity
- Networking becomes harder than it should be
- Encourages fragmentation (many small VMs instead of a unified system)

---

### ✅ Why Prefer Docker Bare Metal

- **Lightweight** → no virtualization overhead  
- **Simple** → one OS, one system to manage  
- **Fast deployments** → spin up services in seconds  
- **Reproducible** → everything defined in Compose  
- **Portable** → move configuration with Git, then restore secrets and application data separately  

> 💡 Choose the isolation model for the workload. Containers share the host kernel; a VM provides a different boundary.

---

## ⚙️ Requirements

- PC or Laptop
- Internet access
- Linux OS installed (in this guide, Devuan)

If you don't have a dedicated PC, you can purchase one of these inexpensive mini PC boxes that includes RAM and SSD to get started right away: [Beelink Mini S12](https://www.amazon.com/dp/B0BW8JSQCH)

If you don't have Linux installed, see the [Devuan Linux Server Install Guide](/linux/devuan-server-install/)

---

## 📦 Install Dependencies

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git
```

---

## 🔑 Add Docker Repository

Docker's `.deb` repository is keyed by **Debian** codename — but Devuan ships
its own (`daedalus`, `excalibur`, …), which Docker's repo won't recognize. Map
it to the Debian base your Devuan release is built on.

```bash
sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/debian/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Devuan ships its own codename; Docker's Debian repo needs the Debian base:
#   Devuan 5  "Daedalus"  → bookworm
#   Devuan 6  "Excalibur" → trixie
DEBIAN_CODENAME=trixie   # set to match your Devuan release's Debian base

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian \
  $DEBIAN_CODENAME stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

---

## 🐳 Install Docker + Compose

```bash
sudo apt update

sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

---

## 🚀 Enable + Start Docker (SysVinit)

```bash
sudo service docker start
sudo update-rc.d docker defaults
```

Verify:

```bash
docker --version
docker compose version
```

---

## 🔐 Add User to Docker Group

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Membership in the `docker` group grants root-equivalent control. Add only trusted administrators.

Test:

```bash
docker run hello-world
```

---

## 📁 Directory Structure

Keep **config and data in separate trees** — this is the single most important
layout decision, and every stack in the repo follows it:

```bash
/opt/docker/stacks/<stack>/     # Docker Compose stacks (compose.yaml, .env, README)
/opt/docker/data/<stack>/       # Persistent app data (never committed to Git)
```

Example:

```bash
/opt/docker/stacks/
├── npm/
│   ├── compose.yaml
│   ├── .env
│   └── README.md
├── plex/
└── ...

/opt/docker/data/
├── npm/
├── plex/
└── ...
```

### Why this matters

- Separation of **config vs data**
- Easier backups (snapshot `/opt/docker/data`; the compose tree lives in Git)
- Cleaner Git repos (no runtime data ever versioned)
- Avoids Docker "sprawl"

> 💡 Configure Dockge's `DOCKGE_STACKS_DIR` explicitly as `/opt/docker/stacks` and mount the same path inside its container. The site's layout differs from Dockge's usual `/opt/stacks` example.

---

## 🚀 Clone the RebelRx Homelab Repo

```bash
cd ~
git clone https://github.com/rebelrx/rebelrx-homelab.git
```

> This repo provides **real-world Compose templates** used in production, one
> directory per stack, each with a filled-in `README.md`.

Use the public repository as a template source. Review the current stack README and create your own private deployment repository at `/opt/docker/stacks/`, as described in [Git-Managed Homelab](/homelab/git-managed-homelab/). Copying a template is initial setup, not an ongoing synchronization strategy:

```bash
sudo mkdir -p /opt/docker/stacks
sudo cp -a ~/rebelrx-homelab/stacks/npm /opt/docker/stacks/
```

---

## 📦 Template Structure

Inside the repo:

```bash
rebelrx-homelab/
└── stacks/
   ├── arr/
   ├── audiobooks/
   ├── authentik/
   └── ...
```

Each stack includes at minimum:

- `compose.yaml`
- `.env.example`
- `README.md` (services, env vars, ports, deployment, backup)

Some stacks ship extra files (e.g. `paperless` has a `docker-compose.env.example`, `monitor` a `prometheus.yml.example`) — the stack's README calls these out.

---

## 🧠 Key Concepts (Read This First)

### 1. Compose-First Mindset

Everything is defined in YAML.

- No clicking around in GUIs
- No manual container creation
- Git = source of truth

---

### 2. `.env` Files

Each stack uses environment variables:

```text
PUID=1000
PGID=1000
TZ=America/New_York
```

**Why this matters:**

- Consistent permissions
- Portable configs
- Easy overrides

Secrets (passwords, API keys) also live in `.env` — which is **gitignored**.
Only `.env.example` templates with blank secrets are committed.

---

### 3. Volume Mapping

```yaml
volumes:
  - /opt/docker/data/plex:/config
```

This ensures:

- Data persists across container restarts
- Easy backups (it's all under `/opt/docker/data`)
- Full control over storage

---

### 4. Port Binding

```yaml
ports:
  - 8080:8080              # published on all interfaces — reachable on your LAN
  # - 127.0.0.1:8080:8080  # loopback only — reverse proxy in front
```

**How the repo handles this:**

- Web UIs are published on **all interfaces by default**, so they work on your
  LAN out of the box.
- Prefix a mapping with `127.0.0.1:` to keep a service **loopback-only** and
  reach it through a host-based proxy or SSH tunnel. A containerized NPM reaches backends on a shared Docker network; its localhost is not the host's loopback.
- **Internal services** (databases, Redis/Valkey, brokers) publish **no host
  port at all** — they're only reachable on the stack's internal network.

---

## 🌐 Reverse Proxy (Nginx Proxy Manager)

Recommended approach — the `npm` stack in the repo:

- Run **Nginx Proxy Manager (NPM)**
- Expose services via subdomains
- Handle SSL automatically

Services attach to a shared `proxy` network in this guide (existing templates may use `proxy_net`; preserve or explicitly map their actual network name); NPM reaches each one by
container name, so the reverse proxy works whether or not a host port is
published.

Example:

```text
https://plex.yourdomain.com
```

Benefits:

- No port juggling
- Clean URLs
- Centralized access control

---

## ▶️ Running Your First Stack

Start with the reverse proxy so everything else has something to sit behind:

```bash
cd /opt/docker/stacks/npm

cp .env.example .env
chmod 600 .env
nano .env
```

Then:

```bash
docker compose up -d
```

---

## 🔄 Updating Containers

Read release notes, confirm a current application-consistent backup, and record the old image version before updating. Validate the application afterward. See [Docker Infrastructure Standards](/homelab/docker-infrastructure-standards/).

```bash
docker compose pull
docker compose up -d
```

## 🔄 Stopping and Starting Containers

```bash
docker compose down
docker compose up -d
```

## 🔄 Re-starting Containers

```bash
docker compose restart [service_name]
```

💡 Download the Ultimate Docker Compose Cheat Sheet from DevOps Cycle: [Docker Compose Cheat Sheet](https://devopscycle.com/pdfs/the-ultimate-docker-compose-cheat-sheet.pdf)

---

## 🧼 Cleanup

Inspect resource usage first with `docker system df`. The following removes unused images, stopped containers, networks, and build cache; it can remove rollback images. Use it only after successful validation and after deciding what recovery artifacts to retain:

```bash
docker system prune -a
```

---

## ⚠️ Common Pitfalls

### ❌ Permission Issues

Compose files can be owned by your user; **data** directories are usually owned
by the container's `PUID:PGID` (often `1000:1000`):

```bash
sudo chown -R $USER:$USER /opt/docker/stacks/<stack>
# Set ownership only on new paths, using the image's documented UID/GID.
# Do not recursively chown existing application or database data.
```

---

### ❌ Ports Already in Use

```bash
ss -tulnp | grep :PORT
```

---

### ❌ Containers Not Updating

```bash
docker compose pull
```

---

### ❌ Editing Running Containers

Don't.

Edit the **Compose file**, then redeploy.

---

## 🧠 Final Thoughts

This setup is built around a few principles:

- **Keep it simple**
- **Define everything in code**
- **Own your infrastructure**
- **Avoid unnecessary layers**

Just Docker + Compose + discipline.

---

## 🔗 Suggested Next Steps

- Add more stacks from the RebelRx repo
- Set up the reverse proxy with the `npm` stack (Nginx Proxy Manager)
- Implement backups with the `backup` stack (Kopia)
- Use a Docker Compose stack manager with the `dockge` stack (Dockge)
- Add a file browser with the `filebrowser` stack (Filebrowser Quantum)

---

## ⚠️ Disclaimer

This guide is for educational purposes.

You are responsible for securing and maintaining your system.
