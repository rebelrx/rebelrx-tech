---
title: "Devuan Server Installation Guide"
description: >-
  Step-by-step Devuan Linux server installation with sysvinit, ext4, and a terminal/SSH-only setup — no systemd.
---
**Target Machine:** PC / Workstation (AMD CPU and NVIDIA GPU)

**Filesystem:** ext4

**Desktop:** None. Terminal / SSH

**Init:** sysvinit

**Drive:** NVMe SSD (`/dev/nvme0n1`)

The Devuan Wiki requires sign-up, however, official installation instructions are available at: [devuan.org/os/documentation/install-guides/excalibur/install-devuan](https://www.devuan.org/os/documentation/install-guides/excalibur/install-devuan)

Installation is straightforward using the netinstall option.

Before you begin:

- Ensure BIOS is set to UEFI (not legacy)
- Enable virtualization (SVM/VT-x)
- Check Devuan's current Secure Boot support before installation; NVIDIA module signing is a separate consideration

* * *

<a id="1-download-devuan-and-create-a-bootable-iso"></a>

## 📥 1\. Download Devuan and Create a Bootable ISO

Download Devuan Excalibur from [files.devuan.org/](https://files.devuan.org/)

- Choose devuan_excalibur (latest stable release)
- Choose installer_iso
- Download the \_netinstall ISO

Create a bootable ISO with USB. PulsarTECH has a great Ventoy + Linux multi-boot USB guide available at: [youtube.com/watch?v=BfjLJ0CqWsY](https://www.youtube.com/watch?v=BfjLJ0CqWsY)

Verify the ISO using the release's published checksums/signatures. Replace `devuan-netinstall.iso` with the exact filename. Identify the USB with `lsblk`; writing the ISO erases that device.

On Linux:

```bash
sudo dd if=devuan-netinstall.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

<a id="2-boot-the-installer-iso"></a>

## 📦 2\. Boot the Installer ISO

Boot the PC from USB. Here's a reference list of Boot Menu keys for various manufacturers:

| Manufacturer | Boot Menu Key | BIOS/UEFI Key |
| :--- | :--- | :--- |
| **Acer** | F12, Esc, F9 | F2, Delete |
| **Asus** | F8, Esc | F2, Delete |
| **Dell** | F12 | F2  |
| **HP** | F9, Esc | F10 |
| **Lenovo** | F12, F10, F8 (or Novo Button) | F2, F1 |
| **MSI** | F11 | Delete |
| **Toshiba** | F12 | F2, F1, Esc |
| **Samsung** | F12, F2, Esc | F2  |
| **Sony VAIO** | F11, F10, Esc (or Assist Button) | F2, F1, F3 |
| **Gigabyte** | F12 | Delete, F2 |
| **Intel NUC** | F10 | F2  |

* * *

<a id="3-install-devuan"></a>

## 📦 3\. Install Devuan

Once at the Devuan GUI screen, choose the `Install` option:

1. **Language, Location, Keyboard**
    - Select your system language, location, and keyboard layout.
2. **Network Configuration**
    - The installer will automatically configure the network if connected via ethernet. If using WiFi, provide the SSID and passphrase for your network.
    - Enter a Hostname. Example: `devuanserver` (any name is fine, as long as there are no spaces or special characters)
    - Leave the Domain name blank (unless you want to add)
3. **Root Password and User Account**
    - Set a Root password
    - Add a user account. Example: `firstname`
    - Set a password for the user
4. **Clock and Timezone**
    - Enter your time zone. Example: Eastern
5. **Disk Partitioning**
    - If setting up encryption (optional), follow these instructions for partitioning disks: [devuan.org/os/documentation/install-guides/excalibur/full-disk-encryption.html](https://www.devuan.org/os/documentation/install-guides/excalibur/full-disk-encryption.html)
    - If not setting up encryption (recommended for a simplified install), you can select `Guided - use entire disk` or `Manual`
    - If you select `Manual`, Partition Layouts are provided below based on preference (Simple Partition Layout recommended)
    - After creating the partitions, write the changes to disks - select `<Yes>`
6. **Package Manager Configuration**
    - Select a Devuan archive mirror. Preferred choice is `deb.devuan.org`
    - If you need to use a HTTP proxy, you can enter the proxy info. Otherwise, just leave blank and select `<Continue>`
7. **Popularity-Contest Configuration**
    - Participating in the package usage survey is optional. Select `<Yes>` or `<No>` based on preference (`<No>` recommended)
8. **Software Selection**
    1. Use the spacebar key to deselect everything then select only `SSH server` and `standard system utilities`. Do not select any desktop environment. This produces a minimal headless server install
9. Init System Selection
    - Options for init are:
        - `sysvinit` (default, classic, well-documented)
        - `OpenRC` (modern, dependency-based, popular in Gentoo)
        - `runit` (minimalist, fast boot)
    - For default init (most stable and compatible), select `sysvinit`
    - If you prefer a more modern and dependency-based init system (that's closer to systemd in usage), choose `openrc`
10. Boot Loader
    - Install GRUB to the EFI partition. When asked to install GRUB boot loader to primary drive, select `<Yes>`
    - Select `/dev/nvme0n1` as the device for the boot loader installation
11. **Finish and Reboot**
    - The installation is now complete. Select &lt;Continue&gt; to reboot
    - Remove the USB drive immediately after rebooting

* * *

### Simple Partition Layout (Recommended)

| #   | Mount | Size | Filesystem | Purpose |
| --- | --- | --- | --- | --- |
| 1   | /boot/efi | 1GB | FAT32 | Required for UEFI booting |
| 2   | /boot   | 2GB | ext4 | OS partition to simplify recovery|
| 3   | / | Remaining | ext4 | Data storage  |

**Design Rationale**

- Keep the server simple
- Reduce fragmentation and issues with partition sizes
- Optimize for running Docker and containerized apps
- Using NAS for bulk storage to offload media

If you prefer an enterprise-level and isolated partition style, you can opt for:

### Enterprise Partition Layout

| #   | Mount Point | Size | Filesystem | Purpose |
| --- | --- | --- | --- | --- |
| 1   | `/boot/efi` | 512 MiB | FAT32 (EFI System Partition) | UEFI bootloader |
| 2   | `/boot` | 2 GiB | ext4 | Kernel and initramfs images |
| 3   | `/` | 50 GiB | ext4 | Root filesystem |
| 4   | `/var` | 100 GiB | ext4 | Logs, databases, container layers, package cache |
| 5   | `/tmp` | 10 GiB | ext4 (mounted noexec,nosuid,nodev) | Temporary files |
| 6   | `swap` | 32 GiB | Linux swap | Swap space (roughly 1/3 of max RAM) |
| 7   | `/home` | 50 GiB | ext4 | User home directories |
| 8   | `/srv` | Remainder | ext4 or XFS | Server data, VMs, containers, datasets |

### Design Rationale

- **Separate `/var`**: Runaway logs or container image accumulation cannot fill the root filesystem and crash the system.
- **Separate `/tmp`**: Mounted with `noexec,nosuid,nodev` for hardening; prevents it from impacting other partitions.
- **32 GiB swap**: With up to 96 GB RAM and potential GPU/CUDA workloads, 32 GiB provides comfortable headroom for memory pressure without being wasteful. If you run memory-intensive AI/ML inference, consider increasing this.
- **Large `/srv`**: The bulk of a headless server's storage goes here — VM disk images, container volumes, datasets, NFS exports, and similar.
- **Separate `/boot`**: Ensures the bootloader and kernel images are always accessible regardless of root filesystem issues.

* * *

<a id="4-post-install-first-boot-setup"></a>

## 📦 4\. Post-Install: First Boot Setup

Log in as root at the terminal (using password set from prior steps).

- **Verify network connectivity:**

```bash
ip addr show
ping -c 3 devuan.org
```

- **Update the system:**

```bash
apt update && apt upgrade -y
```

- **Configure APT sources:**

```bash
nano /etc/apt/sources.list
# Ensure contrib, non-free, and non-free-firmware are enabled

deb http://deb.devuan.org/merged excalibur main contrib non-free non-free-firmware
deb http://deb.devuan.org/merged excalibur-updates main contrib non-free non-free-firmware
deb http://deb.devuan.org/merged excalibur-security main contrib non-free non-free-firmware
```

- **Update again:**

```bash
apt update
```

- **Install essential server packages:**

```bash
apt install -y \
  sudo vim neovim htop tmux curl wget git \
  lm-sensors smartmontools nvme-cli \
  unattended-upgrades apt-listchanges \
  ufw \
  build-essential dkms linux-headers-amd64
```

- **Add user to sudo:**

```bash
usermod -aG sudo yourusername
```

- **Create a Swap File (if you created the Simple Partition Layout)**

Swap provides a safety buffer when system memory is exhausted. While modern systems with high RAM can run without swap, it is still recommended for stability especially when running Docker containers, databases, or GPU workloads.

Instead of creating a dedicated swap partition with the Simple Partition layout, using a **swap file** is preferred. It is easier to manage, resize, and remove without repartitioning disks.

The example below creates a 16 GB swap file. Adjust the size based on your system:

```bash
fallocate -l 16G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

Add the following line to `/etc/fstab` so the swap file is enabled on boot:

```bash
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Verify Swap

```bash
swapon --show
free -h
```

### Sizing Guidance

- **16 GB RAM or less:** 8–16 GB swap recommended
- **32–64 GB RAM:** 8–16 GB swap sufficient
- **64 GB+ RAM:** 4–16 GB swap for safety buffer
- **Heavy GPU / AI workloads:** Consider 16–32 GB swap

* * *

<a id="5-install-and-configure-tailscale"></a>

## 🌐 5\. Install and Configure Tailscale

Tailscale provides secure, zero-config WireGuard-based mesh networking. All SSH access will go through the Tailscale network, meaning no SSH port is exposed to the public internet.

- **Devuan Excalibur is based on Debian Trixie, so use the Trixie repository:**

```bash
mkdir -p --mode=0755 /usr/share/keyrings

curl -fsSL https://pkgs.tailscale.com/stable/debian/trixie.noarmor.gpg \
  | tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null

curl -fsSL https://pkgs.tailscale.com/stable/debian/trixie.tailscale-keyring.list \
  | tee /etc/apt/sources.list.d/tailscale.list

apt update
```

- **Install Tailscale:**

```bash
apt install -y tailscale
```

**Important:** Tailscale's official packages ship with a systemd service file but no sysvinit script. Since Devuan uses sysvinit, you need to create one manually after installing.

- **The package only includes a systemd unit, so you must create an init script manually:**

```bash
cat > /etc/init.d/tailscaled << 'INITEOF'
#!/bin/sh
### BEGIN INIT INFO
# Provides:          tailscale
# Required-Start:    $local_fs $network $all
# Required-Stop:     $local_fs $network
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Tailscale daemon
# Description:       Runs the tailscaled mesh VPN daemon.
### END INIT INFO

. /lib/lsb/init-functions

PIDFILE=/var/run/tailscale.pid
LOGFILE=/var/log/tailscale.log
TAILSCALED=/usr/sbin/tailscaled

fail_unless_root() {
    if [ "$(id -u)" != '0' ]; then
        log_failure_msg "must be run as root"
        exit 1
    fi
}

case "$1" in
    start)
        fail_unless_root
        log_daemon_msg "Starting Tailscale daemon" "tailscaled"
        install -d -m 0700 /var/lib/tailscale
        install -d -m 0755 /run/tailscale
        $TAILSCALED --cleanup
        start-stop-daemon --start --background --no-close \
            --exec $TAILSCALED \
            --pidfile "$PIDFILE" \
            --make-pidfile \
            -- \
            --state=/var/lib/tailscale/tailscaled.state \
            --socket=/run/tailscale/tailscaled.sock >> $LOGFILE 2>&1
        status=$?
        log_end_msg $status
        ;;

    stop)
        fail_unless_root
        log_daemon_msg "Stopping Tailscale daemon" "tailscaled"
        start-stop-daemon --stop --pidfile "$PIDFILE" \
            --remove-pidfile --retry 10
        status=$?
        log_end_msg $status
        ;;

    restart)
        $0 stop
        sleep 1
        $0 start
        ;;

    status)
        status_of_proc -p "$PIDFILE" "$TAILSCALED" "tailscaled"
        ;;

    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
INITEOF

chmod +x /etc/init.d/tailscaled
```

- **Enable and start Tailscale:**

```bash
update-rc.d tailscaled defaults
mkdir -p /run/tailscale
service tailscaled start
service tailscaled status
```

- **Authenticate to your Tailnet:**

```bash
tailscale up
```

This will print a URL. Open it in a browser on another device, sign in to your Tailscale account, and authorize the machine. Once authenticated, verify connectivity:

```bash
tailscale status
tailscale ip -4
```

Note the Tailscale IP (typically `100.x.y.z`). This is the address you will use for SSH.

- **Enable Tailscale SSH:**

Tailscale SSH lets you authenticate SSH sessions through your Tailscale identity provider, eliminating the need for SSH keys or passwords entirely:

```bash
tailscale set --ssh
```

When using Tailscale SSH, connections are authenticated by your Tailscale ACLs instead of local SSH keys. You can configure who has access in the Tailscale admin console under **Access Controls**.

**Note:** Only after a second Tailscale SSH session and console recovery have been tested, you can optionally disable OpenSSH. Keep OpenSSH if you need its forwarding features for the NPM admin tunnel; restrict it to the intended private access path:

```bash
service ssh stop
update-rc.d ssh disable
```

- **Test SSH over Tailscale from your other machine before disconnecting the monitor:**

```bash
ssh yourusername@100.x.y.z
```

You can also use the name of your machine on your Tailnet instead of the Tailscale IP, if you have Tailscale MagicDNS enabled.

- **Configure the Firewall:**

Since SSH is only accessible via Tailscale, the firewall should block SSH from the public interfaces entirely. Only open ports for services you explicitly need on the LAN.

```bash
ufw default deny incoming
ufw default allow outgoing

# Allow all traffic on the Tailscale interface (trusted mesh network)
ufw allow in on tailscale0

# Do NOT allow SSH on public interfaces — it is Tailscale-only
# ufw allow ssh  <-- intentionally omitted

ufw enable
```

Docker-published ports may bypass UFW's ordinary host-service rules. Use narrow bind addresses and validate reachability from each network; see [Docker firewall guidance](https://docs.docker.com/engine/network/packet-filtering-firewalls/).

If you later run services that need LAN access (e.g., NFS, a web server, Samba), add rules for those specific ports on the specific LAN interfaces:

```bash
# Example: allow HTTP on the 2.5G LAN interface only
ufw allow in on enp2s0 to any port 80 proto tcp
```

* * *

<a id="6-install-nvidia-gpu-drivers"></a>

## 🖥️ 6\. Install NVIDIA GPU Drivers

The open-source Nouveau driver must be disabled before installing the proprietary NVIDIA driver:

```bash
cat > /etc/modprobe.d/blacklist-nouveau.conf << 'EOF'
blacklist nouveau
options nouveau modeset=0
EOF

update-initramfs -u
reboot
```

After rebooting, log back in and install:

```bash
sudo apt update
sudo apt install linux-headers-$(uname -r) build-essential libglvnd-dev pkg-config dkms
```

Detect and install driver:

```bash
sudo apt install nvidia-detect
sudo nvidia-detect
sudo apt install nvidia-driver nvidia-kernel-dkms nvidia-smi nvidia-settings
```

The following is an ordinary repository install, not a backports command. Check GPU support and the enabled repository before selecting a newer driver:

```bash
sudo apt install nvidia-driver firmware-misc-nonfree
```

Verify DKMS build:

```bash
dkms status
```

You should see a line like:

```
nvidia/550.163.01, 6.12.x-amd64, x86_64: installed
```

Required reboot and verify:

```bash
reboot
```

After reboot, confirm the driver is loaded:

```bash
nvidia-smi
```

Expected output will show the GPU with driver version, CUDA version, temperature, and memory usage. For a headless server with no display attached, nvidia-smi is the primary way to verify the GPU is operational.

- **Enable Persistence Mode (Headless):**

Without an X server running, the NVIDIA driver may unload between GPU tasks, adding latency. Enable persistence mode:

```bash
nvidia-smi -pm 1
```

Prefer the persistence service supplied by your installed NVIDIA package, if available. Do not overwrite its init script. If you deliberately use the legacy persistence-mode command instead, this separately named sysvinit example enables it across reboots:

```bash
cat > /etc/init.d/nvidia-persistence-mode << 'INITEOF'
#!/bin/sh
### BEGIN INIT INFO
# Provides:          nvidia-persistence-mode
# Required-Start:    $local_fs
# Required-Stop:     $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Enable NVIDIA legacy persistence mode
### END INIT INFO

case "$1" in
  start)
    /usr/bin/nvidia-smi -pm 1
    ;;
  stop)
    /usr/bin/nvidia-smi -pm 0
    ;;
  *)
    echo "Usage: $0 {start|stop}"
    exit 1
    ;;
esac
exit 0
INITEOF


chmod +x /etc/init.d/nvidia-persistence-mode
update-rc.d nvidia-persistence-mode defaults
```

- **Install CUDA Toolkit:**

If you need CUDA for compute workloads (AI inference, GPU-accelerated applications):

```bash
apt install -y nvidia-cuda-toolkit
```

Verify:

```bash
nvcc --version
```

* * *

<a id="7-install-docker"></a>

## 🐳 7\. Install Docker

Docker CE's official Debian packages include a sysvinit init script (`/etc/init.d/docker`), so Docker runs natively on Devuan without systemd.

- Remove Conflicting Packages

```bash
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do
    apt-get remove -y $pkg 2>/dev/null
done
```

- Add the Docker Repository

Since Devuan Excalibur is based on Debian Trixie, use the Trixie repository:

```bash
apt install -y ca-certificates curl gnupg

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

cat > /etc/apt/sources.list.d/docker.list << EOF
deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian trixie stable
EOF


apt update
```

- Install Docker Engine

```bash
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

- Enable and Start Docker (sysvinit)

The Docker package ships with `/etc/init.d/docker`. Enable it at boot and start it:

```bash
update-rc.d docker defaults
service docker start
```

Verify Docker is running:

```bash
service docker status
docker info
```

- Allow Your User to Run Docker

Add your regular user to the `docker` group so you don't need `sudo` for every Docker command:

```bash
usermod -aG docker yourusername
```

Log out and back in (or `newgrp docker`) for the group change to take effect.

**Security note:** Membership in the `docker` group grants root-equivalent access to the host. Only add trusted users.

- Test the Installation

```bash
docker run --rm hello-world
```

- NVIDIA Container Toolkit (GPU Containers)

To use the NVIDIA GPU inside Docker containers (for CUDA, AI inference, etc.), install the NVIDIA Container Toolkit:

```bash
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey \
  | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

curl -fsSL https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list \
  | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
  | tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

apt update
apt install -y nvidia-container-toolkit
```

Configure the Docker runtime:

```bash
nvidia-ctk runtime configure --runtime=docker
service docker restart
```

Test GPU access from a container:

```bash
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
```

You should see the NVIDIA GPU listed with driver version and CUDA version.

See [Docker Infrastructure Standards](/homelab/docker-infrastructure-standards/) for the canonical `/opt/docker/stacks` and `/opt/docker/data` layout.

### Docker Compose Quick Reference

Docker Compose is installed as a CLI plugin. Use it with:

```bash
docker compose up -d          # Start services in background

docker compose down            # Stop and remove services

docker compose logs -f         # Follow logs

docker compose ps              # List running services
```

* * *

<a id="8-nfs-nas-mounts"></a>

## 🗂️ 8. NFS NAS Mounts

Use the [NAS Mounting guide](/homelab/nas-mounting/) as the canonical reference for export permissions, mount testing, boot behavior, and Docker dependencies.

Install the client and create the mount point:

```bash
sudo apt install -y nfs-common
sudo mkdir -p /mnt/nas/media
sudo mount -t nfs -o hard,vers=4.1 NAS-IP:/media /mnt/nas/media
```

Replace `NAS-IP` and the export path with values from your NAS configuration. Verify the correct remote filesystem and application permissions before adding an fstab entry:

```text
NAS-IP:/media /mnt/nas/media nfs rw,hard,vers=4.1,_netdev,nofail 0 0
```

Use `ro` instead of `rw` for read-only media access. Use `hard` for backups and other data you care about. A soft timeout can cause data corruption; it is not the headless-server default.

`_netdev` provides network ordering, not a guarantee of availability. `nofail` does not guarantee a fixed boot-time limit. Check boot behavior with the NAS unavailable and prevent dependent containers from starting against an empty local directory.

Monitor missing mounts and alert for investigation. Do not schedule automatic forced/lazy unmounts or remounts while applications may still hold files open. Restore NAS/network service first, stop dependent writers, then recover the mount deliberately.

---

<a id="9-fastfetch"></a>

## 🧭 9\. Fastfetch

"Obligatory neofetch" (fastfetch):

```bash
sudo apt update
sudo apt install fastfetch
```

* * *

<a id="result"></a>

## ✅ Result

- No systemd
- Full Docker support
- GPU acceleration working
- NAS mounts
