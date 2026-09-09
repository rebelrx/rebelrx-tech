---
title: "🐳 Docker Homelab (Debian + Compose)"
description: >-
  Build a clean, reproducible Docker Compose homelab on Debian 13 using Docker Engine and Docker Compose, with persistent data kept separate from disposable containers.
---
Docker lets you run applications in **containers**: lightweight, isolated packages that include an application and the pieces it needs to run. Instead of installing every service directly into Linux and hoping their dependencies do not collide, you can describe each service in a small configuration file and start or replace it consistently.

If you already understand virtual machines, think of containers as the lighter-weight cousin. A VM includes an entire guest operating system; a Docker container shares the host's Linux kernel and isolates the application itself. That makes containers fast to start, easy to replace, and especially convenient for self-hosted services.

This guide takes you from a fresh Linux host to a working Docker homelab. By the end, you will understand the basic terms, install Docker and Docker Compose, create a clean directory structure, start a first stack, update it, and troubleshoot the most common problems.

:::tip[ELI5]
Docker is a standardized way to run apps without manually installing every app into the operating system. You describe what you want, Docker starts it, and if a container breaks you replace the container while keeping the important data separately.
:::

## 🧩 Docker Terms You Should Know First

:::tip[ELI5]
This section explains how the Docker part of the setup should be configured or operated.
:::

- **Image** — the packaged application template Docker downloads.
- **Container** — a running instance of an image.
- **Volume / bind mount** — storage that lives outside the disposable container so your data survives upgrades and replacement.
- **Port** — the network doorway used to reach an application, such as `8080`.
- **Docker Compose** — a YAML file that describes one or more containers and how they should run together.
- **Stack** — the practical unit you operate together: an app and any database, cache, worker, or supporting services it needs.

A simple mental model is:

```text
compose.yaml
    ↓
Docker pulls images
    ↓
Docker creates containers
    ↓
Containers use persistent data + network ports
```

## 🪜 What You Will Build

:::tip[ELI5]
This section explains what you will build in practical terms and what it changes in the homelab.
:::

1. Install Docker Engine and the Compose plugin.
2. Give your normal user permission to operate Docker.
3. Create separate directories for stack definitions and persistent data.
4. Start one Compose stack.
5. Verify that it works.
6. Learn the normal update, stop, start, and troubleshooting workflow.

---

## 🔥 Why Docker Works Well for a Homelab

:::tip[ELI5]
This section explains how the Docker part of the setup should be configured or operated.
:::

You *can* use Proxmox. Many people do.

For this Docker host, I prefer bare metal because it reduces the number of layers to maintain. A dedicated hypervisor remains useful for OS testing, snapshots, and stronger workload isolation—as in [my setup](/privacy/my-setup/).

### When a VM Platform Adds More Than You Need

- VM overhead (CPU + RAM waste)
- More layers to debug
- Backup complexity
- Networking becomes harder than it should be
- Encourages fragmentation (many small VMs instead of a unified system)

---

### Why I Prefer Docker on a Dedicated Linux Host

- **Lightweight** → no virtualization overhead  
- **Simple** → one OS, one system to manage  
- **Fast deployments** → spin up services in seconds  
- **Reproducible** → everything defined in Compose  
- **Portable** → move configuration with Git, then restore secrets and application data separately  

> 💡 Choose the isolation model for the workload. Containers share the host kernel; a VM provides a different boundary.

---

## ⚙️ Requirements

:::tip[ELI5]
You do not need server-class hardware to start. A small used PC, mini PC, or spare desktop with adequate RAM and storage is enough for a first Docker host. If you do not have Linux installed yet.
:::

- PC or Laptop
- Internet access
- Debian 13 or another currently supported Debian release

You do not need server-class hardware to start. A small used PC, mini PC, or spare desktop with adequate RAM and storage is enough for a first Docker host.

If you do not have Linux installed yet, you can start with the [Debian server installation guide](/linux/debian-server-install/), then return here after the base system is updated and reachable over SSH.

---

## 📦 Install Dependencies

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

From the Debian terminal:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git
```

---

## 🔑 Add Docker's Official Repository

:::tip[ELI5]
This tells Debian where to download the official Docker packages and how to verify that they are signed by Docker.
:::

Docker officially supports Debian 13 (Trixie). Use Docker's own APT repository rather than an unrelated distribution package so the Engine, CLI, Buildx, and Compose plugin are maintained together.

```bash
sudo apt update
sudo apt install -y ca-certificates curl

sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

:::note
If you are adapting this guide to a Debian derivative, confirm the corresponding Debian codename before using the repository. On Debian 13 itself, `VERSION_CODENAME` should resolve to `trixie`.
:::

## 🐳 Install Docker + Compose

:::tip[ELI5]
This section explains the saved configuration Docker uses to recreate the stack consistently.
:::

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

## 🚀 Verify Docker Is Running

:::tip[ELI5]
This section explains how the Docker part of the setup should be configured or operated.
:::

Docker normally starts automatically after installation on Debian. Confirm the service and CLI are available:

```bash
sudo systemctl status docker --no-pager
docker --version
docker compose version
```

If the service is not running:

```bash
sudo systemctl enable --now docker
```


---

## 🔐 Add User to Docker Group

:::tip[ELI5]
This section explains how the Docker part of the setup should be configured or operated.
:::

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

:::tip[ELI5]
This section is about where files should live so you can find, back up, and rebuild them consistently.
:::

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

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

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

:::tip[ELI5]
Some stacks ship extra files (e.g.
:::

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

:::tip[ELI5]
Everything is defined in YAML.
:::

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

:::tip[ELI5]
This section explains how one front-end service can route friendly web names to the correct internal application.
:::

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

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

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

:::tip[ELI5]
Containers are replaceable application instances; this section explains how to operate them without losing persistent state.
:::

Read release notes, confirm a current application-consistent backup, and record the old image version before updating. Validate the application afterward. See [Docker Infrastructure Standards](/homelab/docker-infrastructure-standards/).

```bash
docker compose pull
docker compose up -d
```

## 🔄 Stopping and Starting Containers

:::tip[ELI5]
Containers are replaceable application instances; this section explains how to operate them without losing persistent state.
:::

```bash
docker compose down
docker compose up -d
```

## 🔄 Re-starting Containers

:::tip[ELI5]
Containers are replaceable application instances; this section explains how to operate them without losing persistent state.
:::

```bash
docker compose restart [service_name]
```

💡 Download the Ultimate Docker Compose Cheat Sheet from DevOps Cycle: [Docker Compose Cheat Sheet](https://devopscycle.com/pdfs/the-ultimate-docker-compose-cheat-sheet.pdf)

---

## 🧼 Cleanup

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

Inspect resource usage first with `docker system df`. The following removes unused images, stopped containers, networks, and build cache; it can remove rollback images. Use it only after successful validation and after deciding what recovery artifacts to retain:

```bash
docker system prune -a
```

---

## ⚠️ Common Pitfalls

:::tip[ELI5]
These are recurring mistakes worth checking before assuming the underlying tool is broken.
:::

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

## ✅ What to Remembers

:::tip[ELI5]
This is the short version to keep in mind after you finish the page.
:::

This setup is built around a few principles:

- **Keep it simple**
- **Define everything in code**
- **Own your infrastructure**
- **Avoid unnecessary layers**

Just Docker + Compose + discipline.

---

## 🔗 Suggested Next Steps

:::tip[ELI5]
This section explains suggested next steps in practical terms and what it changes in the homelab.
:::

- Add more stacks from the RebelRx repo
- Set up the reverse proxy with the `npm` stack (Nginx Proxy Manager)
- Implement backups with the `backup` stack (Kopia)
- Use a Docker Compose stack manager with the `dockge` stack (Dockge)
- Add a file browser with the `filebrowser` stack (Filebrowser Quantum)

---

## ⚠️ Disclaimer

:::tip[ELI5]
Here, you is for educational purposes.
:::

This guide is for educational purposes.

You are responsible for securing and maintaining your system.
