---
title: "Debian 13 Server Installation Guide"
description: >-
  Step-by-step Debian 13 Trixie server installation with systemd, ext4, SSH, automatic security updates, Tailscale, Docker Engine, NAS mounts, and optional NVIDIA support.
---
**Target Machine:** PC / Workstation / Server (AMD CPU; optional NVIDIA GPU)

**Filesystem:** ext4

**Desktop:** None. Terminal / SSH

**Init:** systemd

**Release:** Debian 13 "Trixie"

**Boot:** UEFI

This guide is the mainstream systemd counterpart to the [Devuan Server Installation Guide](/linux/devuan-server-install/).

Devuan is recommended where avoiding systemd is the priority. Debian is included because it remains one of the most important Linux server standards, has an enormous software ecosystem, and is a sensible reference platform for self-hosted infrastructure. Debian is the distro you'll find most often in smaller enterprise server systems not requiring commercial support.

Official installation documentation:

<https://www.debian.org/releases/trixie/installmanual>

---

<a id="1-before-you-begin"></a>

## 🧭 1. Before You Begin

Recommended firmware settings:

- **UEFI** enabled
- **Legacy/CSM** disabled unless specifically required
- **SVM/AMD-V** or **Intel VT-x** enabled
- **IOMMU** enabled if PCIe passthrough may be used
- **Secure Boot** may remain enabled for a normal Debian install, but you can disable it if needed
- Update BIOS/UEFI firmware before installation when practical

For an NVIDIA server, whether Secure Boot remains enabled depends on how the proprietary kernel module will be installed and signed. Do not disable it reflexively; decide based on the actual driver workflow.

---

<a id="2-download-debian-13-netinst"></a>

## 📥 2. Download Debian 13 Netinst

Download the current Debian 13 amd64 netinst image from:

<https://www.debian.org/distrib/netinst>

Verify the downloaded image using Debian's published checksums/signatures before installation.

---

<a id="3-create-a-bootable-usb"></a>

## 📥 3. Create a Bootable USB

Using Linux:

```bash
lsblk
```

Identify the USB device, then write the ISO to the whole device:

```bash
sudo dd if=debian-netinst.iso \
  of=/dev/sdX bs=4M status=progress conv=fsync
```

Ventoy is also a good option for a reusable multi-ISO USB drive.

Replace `debian-netinst.iso` with the exact verified download filename. Shell wildcards embedded in `if=...` do not reliably expand as intended. The command erases the whole target USB device; confirm its identity with `lsblk` first.

---

<a id="4-boot-the-debian-installer"></a>

## 📦 4. Boot the Debian Installer

Boot the server from USB and select **Install** or **Graphical install**.

For servers, either is fine. The graphical installer changes the presentation, not the underlying result.

---

<a id="5-language-location-and-keyboard"></a>

## 🌍 5. Language, Location, and Keyboard

Select:

- Language
- Country / region
- Keyboard layout

The installer will use these settings to initialize locale defaults.

---

<a id="6-network-configuration"></a>

## 🌐 6. Network Configuration

Ethernet is strongly preferred during a server installation.

Choose a hostname such as:

```text
server01
```

Use lowercase letters, numbers, and hyphens.

Leave the domain blank unless you actually maintain a local DNS domain.

DHCP is fine during installation. A stable server address can later be provided through:

- DHCP reservation on the router, or
- Static network configuration on the host

For most home networks, a DHCP reservation is simpler and easier to manage centrally.

---

<a id="7-root-and-user-accounts"></a>

## 🔒 7. Root and User Accounts

Debian's installer behavior depends on whether a root password is configured.

For a normal sudo-based administration model:

- Leave direct root login disabled when offered
- Create a normal administrative user
- Use `sudo` for privileged commands

Use a strong, unique password even if SSH will later be key-only.

---

<a id="8-partition-the-disk"></a>

## 🗂️ 8. Partition the Disk

For a normal single-drive server, choose guided partitioning.

Recommended baseline:

- GPT partition table
- EFI System Partition
- ext4 root filesystem
- swap as recommended by the installer or omitted/adjusted based on RAM and workload

For a Docker server with plenty of RAM, an enormous swap partition is unnecessary.

### Simple layout

For most systems:

```text
/boot/efi   EFI/FAT32
/           ext4
swap        optional / modest
```

### When to separate filesystems

Consider dedicated filesystems only when there is a concrete operational reason, such as:

- `/var` growth must be isolated
- Docker data lives on a dedicated SSD
- Large application data lives on another volume
- Compliance or quota requirements demand separation

:::tip
A simple ext4 root filesystem is easier to recover than a complicated layout created without a reason.
:::

---

<a id="9-package-mirror"></a>

## 📦 9. Package Mirror

Allow the installer to configure a nearby Debian mirror.

A proxy is normally left blank on a home network.

---

<a id="10-software-selection"></a>

## 📦 10. Software Selection

At the task selection screen:

**Keep:**

- SSH server
- Standard system utilities

**Remove:**

- Debian desktop environment
- GNOME
- KDE Plasma
- Xfce
- Any other desktop task

The goal is a headless server.

---

<a id="11-finish-installation-and-reboot"></a>

## 📦 11. Finish Installation and Reboot

Complete the installer, remove the USB drive, and boot from the internal disk.

Log in locally for the first round of updates and SSH configuration.

---

<a id="12-update-the-system"></a>

## 🔄 12. Update the System

```bash
sudo apt update
sudo apt full-upgrade -y
```

Install a useful baseline:

```bash
sudo apt install -y \
  ca-certificates \
  curl \
  wget \
  git \
  gnupg \
  sudo \
  vim \
  nano \
  htop \
  rsync \
  unzip \
  nfs-common \
  smartmontools \
  lm-sensors
```

Reboot after kernel or important low-level upgrades:

```bash
sudo reboot
```

---

<a id="13-verify-the-system"></a>

## ✅ 13. Verify the System

```bash
cat /etc/debian_version
uname -r
systemctl --failed
lsblk -f
ip addr
```

Confirm there are no unexpected failed units before layering services onto the machine.

---

<a id="14-configure-ssh"></a>

## 🔒 14. Configure SSH

If `openssh-server` was selected during installation, verify:

```bash
sudo systemctl status ssh
```

If needed:

```bash
sudo apt install -y openssh-server
sudo systemctl enable --now ssh
```

### Use SSH keys

On your client machine:

```bash
ssh-keygen -t ed25519
ssh-copy-id user@server-ip
```

Test key-based login **before** disabling passwords.

### Harden SSH

Create a small drop-in instead of heavily editing the vendor file:

```bash
sudo nano /etc/ssh/sshd_config.d/00-hostname.conf
```

Example:

```text
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
KbdInteractiveAuthentication no
```

Validate syntax:

```bash
sudo sshd -t
```

OpenSSH generally uses the first value it reads. Check existing configuration and `Match` blocks, then verify effective settings rather than relying on filename ordering alone:

```bash
sudo sshd -T | grep -E 'permitrootlogin|pubkeyauthentication|passwordauthentication|kbdinteractiveauthentication'
```

For connection-specific rules, also use `sshd -T -C` with the intended user's connection details. See the [OpenSSH configuration manual](https://man.openbsd.org/sshd_config).

Reload:

```bash
sudo systemctl reload ssh
```

:::danger
Keep an existing SSH session open while testing the new configuration. Do not lock yourself out of a remote server.
:::

---

<a id="15-automatic-security-updates"></a>

## 🔒 15. Automatic Security Updates

Install unattended upgrades:

```bash
sudo apt install -y unattended-upgrades apt-listchanges
```

Enable the normal periodic configuration:

```bash
sudo dpkg-reconfigure -plow unattended-upgrades
```

Review:

```bash
cat /etc/apt/apt.conf.d/20auto-upgrades
```

For important servers, automatic **security** updates are useful; indiscriminate automated major application upgrades are a different decision and should be tested.

---

<a id="16-firewall"></a>

## 🔒 16. Firewall

A server should expose only the services it needs.

Debian does not force a single high-level firewall frontend. `nftables` is the native modern Linux packet-filtering framework.

If you want a simple host firewall, install and configure `nftables` deliberately rather than copying a random ruleset.

For Docker hosts, read Docker's firewall behavior carefully: published container ports interact with netfilter rules differently than ordinary host services.

:::caution[Docker changes the firewall picture]
Do not assume that a host firewall rule automatically blocks a Docker-published port. Docker creates its own packet-filtering rules. Avoid publishing services to `0.0.0.0` unless they are intentionally reachable.
:::

---

<a id="17-tailscale"></a>

## 🌐 17. Tailscale

For private remote administration, install Tailscale from the official Debian instructions:

<https://tailscale.com/download/linux/debian>

Then:

```bash
sudo tailscale up
```

Verify:

```bash
tailscale status
tailscale ip -4
```

For a server, Tailscale SSH is an excellent option when it fits your access-control model.

See the full [Tailscale guide](/homelab/tailscale/).

---

<a id="18-install-docker-engine-from-dockers-official-repository"></a>

## 🐳 18. Install Docker Engine from Docker's Official Repository

Do not install the older Debian `docker.io` package for this guide. Use Docker's official repository so Docker Engine, Buildx, and Compose are maintained together.

Remove conflicting packages if present:

```bash
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do
  sudo apt remove -y "$pkg" 2>/dev/null || true
done
```

Add Docker's official key:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

Add the repository:

```bash
sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF2
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF2
```

Install Docker:

```bash
sudo apt update
sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

Verify:

```bash
sudo systemctl status docker
sudo docker run hello-world
```

Add your user to the Docker group if desired:

```bash
sudo usermod -aG docker $USER
```

Log out and back in, then:

```bash
docker version
docker compose version
```

:::caution[Docker group = administrative access]
A user who can control the Docker daemon can effectively gain root-level control over the host. Do not treat the `docker` group as an ordinary low-privilege group.
:::

---

<a id="19-docker-directory-layout"></a>

## 🐳 19. Docker Directory Layout

For cleaner and more organized hosts, keep stack definitions separate from persistent runtime data:

```text
/opt/docker/stacks/<stack>/
/opt/docker/data/<stack>/
```

Create them:

```bash
sudo mkdir -p /opt/docker/stacks /opt/docker/data
sudo chown -R $USER:$USER /opt/docker/stacks
```

Whether `/opt/docker/data` is user-owned depends on how the individual containers run. Do not recursively change ownership of existing application data without understanding its UID/GID requirements.

See [Docker Infrastructure Standards](/homelab/docker-infrastructure-standards/).

---

<a id="20-mount-nas-storage"></a>

## 🗂️ 20. Mount NAS Storage

Install NFS support if not already installed:

```bash
sudo apt install -y nfs-common
```

Create a mount point:

```bash
sudo mkdir -p /mnt/nas/media
```

Test interactively first:

```bash
sudo mount -t nfs -o vers=4.1 NAS-IP:/media /mnt/nas/media
```

Verify read/write behavior, then unmount:

```bash
sudo umount /mnt/nas/media
```

For a persistent systemd-aware NFS mount, add an `/etc/fstab` entry appropriate to your NAS and availability requirements.

Example:

```text
NAS-IP:/media  /mnt/nas/media  nfs  rw,hard,vers=4.1,_netdev,nofail,x-systemd.automount  0  0
```

Apply:

```bash
sudo systemctl daemon-reload
sudo mount -a
```

See the dedicated [NAS mounting guide](/homelab/nas-mounting/) for storage design considerations.

---

<a id="21-optional-nvidia-gpu-support"></a>

## 🖥️ 21. Optional NVIDIA GPU Support

Skip this section on CPU-only or AMD-GPU servers.

Debian can use NVIDIA's proprietary driver from Debian's repositories or NVIDIA's own CUDA repository depending on the workload.

For a general server, prefer Debian-packaged drivers unless a specific CUDA/application requirement calls for NVIDIA's repository.

Identify the GPU:

```bash
lspci | grep -i -E 'vga|3d|nvidia'
```

Before installing a driver, confirm:

- The GPU generation is supported
- The required CUDA version, if any
- Secure Boot signing requirements
- Container runtime requirements if GPUs will be passed to Docker

Do not install CUDA merely because the machine has an NVIDIA GPU. Install it because a workload requires it.

After installation, verify:

```bash
nvidia-smi
```

For GPU-enabled Docker workloads, add the NVIDIA Container Toolkit using NVIDIA's current Debian instructions rather than an old copied repository stanza.

---

<a id="22-cpu-and-hardware-monitoring"></a>

## 🖥️ 22. CPU and Hardware Monitoring

Sensors:

```bash
sudo sensors-detect
sensors
```

Disk health:

```bash
sudo smartctl -a /dev/nvme0
```

NVMe devices may instead be inspected with `nvme-cli`:

```bash
sudo apt install -y nvme-cli
sudo nvme smart-log /dev/nvme0
```

---

<a id="23-fastfetch-optional"></a>

## 🧭 23. Fastfetch (Optional)

If Fastfetch is available in the current Debian repository:

```bash
sudo apt install -y fastfetch
```

Run:

```bash
fastfetch
```

If the packaged version is unavailable or too old for a specific feature, use the upstream project's official release packages rather than an untrusted third-party repository.

---

<a id="24-useful-server-checks"></a>

## ✅ 24. Useful Server Checks

```bash
# Failed services
systemctl --failed

# Running services
systemctl --type=service --state=running

# Listening ports
sudo ss -tulpn

# Storage
lsblk -f
df -hT

# Memory
free -h

# CPU
lscpu

# Network
ip addr
ip route

# Docker
docker info
docker ps
```

---

<a id="25-reboot-and-validate"></a>

## 🧭 25. Reboot and Validate

After the baseline is configured:

```bash
sudo reboot
```

Then verify from another machine:

```bash
ssh user@server-name
```

Check:

```bash
systemctl --failed
tailscale status
docker ps
mount | grep /mnt
```

A configuration that works only before the first reboot is not finished.

---

<a id="26-recommended-final-state"></a>

## ✅ 26. Recommended Final State

A clean Debian 13 server should have:

- Debian 13 Trixie
- UEFI boot
- ext4
- No desktop environment
- systemd
- SSH key-based administration
- Root SSH login disabled
- Automatic security updates
- Tailscale for private remote access
- Docker Engine + Compose from Docker's official repository when containers are needed
- Local application data on local disks
- Bulk NAS storage mounted deliberately
- NVIDIA drivers only when the hardware/workload requires them
- No unnecessary listening services

---

<a id="final-thought"></a>

## 🧠 Final Thought

Debian prioritizes rigorous testing and stability, making it a preferred choice for servers and mission-critical systems.

If the goal is maximum independence from systemd, use Devuan, which is essentially Debian running on sysvinit instead of systemd. If the goal is a mainstream, predictable, exceptionally well-supported Linux server baseline, Debian remains one of the strongest choices available.
