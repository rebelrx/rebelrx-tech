---
title: "Artix Linux Manual Installation Guide"
description: >-
  Step-by-step manual installation of Artix Linux with OpenRC, Btrfs subvolumes, zram, and KDE Plasma on AMD hardware.
---
**Target Machine:** PC / Laptop (assuming AMD CPU and AMD GPU)

**Filesystem:** Btrfs with subvolumes

**Swap:** zram (no swap partition)

**Desktop:** KDE Plasma (bare minimum)

**Init:** OpenRC

**Drive:** NVMe SSD (`/dev/nvme0n1`)

The Artix Wiki is a great resource as well for additional reference and troubleshooting: [wiki.artixlinux.org/](https://wiki.artixlinux.org/)

The general steps for installing Artix (similar to most Linux distributions) includes connecting to the internet, partitioning the disk, formatting the partitions, mounting the partitions, installing the linux kernel and base system packages, configuring localization, installing the boot loader, adding users and setting passwords, configuring the network, installing the desktop environment and display login manager, activating core services, and post-installation configuration.

* * *

<a id="1-boot-the-live-iso"></a>

## 🧭 1\. Boot the Live ISO

Download the base OpenRC ISO from [artixlinux.org/download.php](https://artixlinux.org/download.php). Flash it to a USB drive

- PulsarTECH has a great Ventoy + Linux multi-boot USB guide available at: [youtube.com/watch?v=BfjLJ0CqWsY](https://www.youtube.com/watch?v=BfjLJ0CqWsY)

Linux command for USB:

```bash
sudo dd bs=4M if=artix-base-openrc-YYYYMMDD-x86_64.iso of=/dev/sdX status=progress oflag=sync
```

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

Once at the terminal, the default login is `root` and password is `artix`.

* * *

<a id="2-connect-to-the-internet"></a>

## 🌐 2\. Connect to the Internet

**Ethernet**:

If using ethernet (recommended), go direct to "Verify connectivity" step below.

**Wi-Fi**:

The wireless interface may be soft-blocked by default. Unblock it first:

```bash
rfkill unblock wifi
ip link set wlan0 up
```

Then connect with `wpa_supplicant`:

```bash
wpa_supplicant -B -i wlan0 -c <(wpa_passphrase "YourSSID" "YourPassword")

dhcpcd wlan0
```

Alternatively, can use the connection manager (ConnMan) utility that's included in the Artix ISO:

```bash
connmanctl
> enable wifi
> scan wifi
> agent on
> connect wifi_<tab-complete>

> quit
```

Verify connectivity:

```bash
ping -c 3 artixlinux.org
```

* * *

<a id="3-set-keyboard-and-time"></a>

## 🌍 3\. Set Keyboard and Time

Set keyboard layout:

```bash
loadkeys us
```

* * *

<a id="4-partition-the-nvme-drive"></a>

## 🗂️ 4\. Partition the NVMe Drive

The examples use `/dev/nvme0n1`; actual numbering can differ. Match capacity/model and confirm backups before continuing. Partitioning and formatting erase the selected disk.

Verify your drive:

```bash
lsblk
```

If the drive has an old swap signature, disable it first:

```bash
swapoff /dev/nvme0n1p2 2>/dev/null
```

Only for an intentional whole-disk replacement, after unmounting its filesystems and verifying the target:

```bash
wipefs -af /dev/nvme0n1
```

Launch cfdisk to partition the drive:

```bash
cfdisk /dev/nvme0n1
```

**When cfdisk opens:**

1. If prompted for a label type, select **gpt**. If the drive already has an MBR/DOS table, delete all existing partitions first, then go to the bottom menu and select **\[ Write \]** to apply, then quit and re-run `cfdisk /dev/nvme0n1` — it will prompt for a new label type and you can pick **gpt**.
2. Select **\[ New \]** on the free space, type **1G**, press Enter. This creates the EFI partition.
3. With that partition highlighted, select **\[ Type \]** and choose **EFI System**.
4. Arrow down to the remaining free space, select **\[ New \]**, press Enter to accept the full remaining size. This creates the root partition (type defaults to **Linux filesystem**, which is correct).
5. Select **\[ Write \]**, type **yes** to confirm, then **\[ Quit \]**.

**Final layout:**

| Partition | Size | Type | Purpose |
| --- | --- | --- | --- |
| `/dev/nvme0n1p1` | 1 GB | EFI System | EFI boot |
| `/dev/nvme0n1p2` | Remainder | Linux filesystem | Btrfs root |

* * *

<a id="5-format-partitions"></a>

## 🗂️ 5\. Format Partitions

Format EFI partition as FAT32:

```bash
mkfs.fat -F32 -n EFI /dev/nvme0n1p1
```

Format root partition as Btrfs:

```bash
mkfs.btrfs -L ARTIX /dev/nvme0n1p2
```

* * *

<a id="6-create-btrfs-subvolumes"></a>

## 🗂️ 6\. Create Btrfs Subvolumes

Mount the top-level subvolume:

```bash
mount /dev/nvme0n1p2 /mnt
```

Create subvolumes:

```bash
btrfs subvolume create /mnt/@
btrfs subvolume create /mnt/@home
btrfs subvolume create /mnt/@log
btrfs subvolume create /mnt/@cache
btrfs subvolume create /mnt/@snapshots
```

Unmount the top-level:

```bash
umount /mnt
```

* * *

<a id="7-mount-subvolumes"></a>

## 🗂️ 7\. Mount Subvolumes

Use SSD-optimized mount options.

Define mount options once:

```bash
BTRFS_OPTS="noatime,ssd,compress=zstd,space_cache=v2,discard=async"
```

Mount root subvolume:

```bash
mount -o ${BTRFS_OPTS},subvol=@ /dev/nvme0n1p2 /mnt
```

Create mount point directories:

```bash
mkdir -p /mnt/boot/efi
mkdir -p /mnt/home
mkdir -p /mnt/var
mkdir -p /mnt/var/log
mkdir -p /mnt/var/cache
mkdir -p /mnt/.snapshots
```

Mount remaining subvolumes:

```bash
mount -o ${BTRFS_OPTS},subvol=@home     /dev/nvme0n1p2 /mnt/home
mount -o ${BTRFS_OPTS},subvol=@log      /dev/nvme0n1p2 /mnt/var/log
mount -o ${BTRFS_OPTS},subvol=@cache    /dev/nvme0n1p2 /mnt/var/cache
mount -o ${BTRFS_OPTS},subvol=@snapshots /dev/nvme0n1p2 /mnt/.snapshots
```

If receiving an error that mount point doesn't exist, just go back and create the mount point directory again.

Mount EFI partition:

```bash
mount /dev/nvme0n1p1 /mnt/boot/efi
```

**Note: why zram instead of a swap partition?** On btrfs, swap files require special handling \[no compression, no copy-on-write (COW)\]. Zram is simpler, faster (compressed RAM), and avoids SSD wear. With 16–96GB of DDR5 on a PC, zram is the better choice. Note: this means hibernation (suspend-to-disk) is not available (hibernation requires swap). Regular suspend (lid close, sleep to RAM) works fine.

* * *

<a id="8-install-the-base-system"></a>

## 📦 8\. Install the Base System

Refresh package mirrors:

```bash
pacman -Sy artix-keyring
```

Install base packages:

```bash
basestrap /mnt base base-devel openrc elogind-openrc \
  linux linux-headers linux-firmware \
  amd-ucode \
  btrfs-progs \
  grub efibootmgr \
  dbus dbus-openrc \
  sudo \
  networkmanager networkmanager-openrc \
  zramen zramen-openrc \
  os-prober \
  pipewire pipewire-openrc pipewire-alsa pipewire-pulse pipewire-pulse-openrc pipewire-jack wireplumber wireplumber-openrc alsa-utils sof-firmware \
  nano vim neovim \
  git wget curl
```

Use the Artix mirror list supplied by `artix-mirrorlist`. Do not overwrite it with Arch mirrors generated by Reflector; Artix and Arch repositories are different. Consult the [Artix mirror guidance](https://wiki.artixlinux.org/Main/Mirrors).

**A few package notes:**

- `linux` — linux base kernel, headers, and firmware
- `amd-ucode` — microcode updates for AMD processors; NOTE: if you are running an Intel-based processor, replace with`intel-ucode` instead
- `btrfs-progs` — Btrfs management tools
- `elogind-openrc` — seat management (required for desktop sessions without systemd)
- `networkmanager-openrc` — OpenRC service script for NetworkManager (KDE Plasma's network widget requires NetworkManager)
- `zramen-openrc` — OpenRC service script for zram (RAM compression)
- `os-prober`— utility to scan for other OS bootable partitions (if dual booting in the future)
- `pipewire-openrc` — OpenRC service scripts for pipewire audio (required for PC audio)
- `nano` — text editors (nano, VIM, and NeoVIM)
- `git` — essential utilities (git, wget, curl) for installation of other packages and scripts

* * *

<a id="9-generate-fstab"></a>

## 🗂️ 9\. Generate fstab

```bash
fstabgen -U /mnt > /mnt/etc/fstab
```

Verify each mount looks correct:

```bash
cat /mnt/etc/fstab
```

You should see five Btrfs entries (one per subvolume) plus the EFI FAT32 entry.

* * *

<a id="10-chroot-into-the-new-system"></a>

## 🧭 10\. Chroot into the New System

```bash
artix-chroot /mnt
```

* * *

<a id="11-time-zone-and-locale"></a>

## 🌍 11\. Time Zone and Locale

Set Time Zone (/usr/share/Region/City selected as America/New_York):

```bash
ln -sf /usr/share/zoneinfo/America/New_York /etc/localtime
hwclock --systohc
```

Set Locale:

```bash
nano /etc/locale.gen
# Uncomment: en_US.UTF-8 UTF-8

locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
```

* * *

<a id="12-hostname-and-hosts"></a>

## 🌐 12\. Hostname and Hosts

Set hostname (Linux system name):

```bash
# Set hostname to whatever you want to name the system
echo "hostname" > /etc/hostname
printf '%s\n' 'hostname="hostname"' > /etc/conf.d/hostname
```

Edit `/etc/hosts`:

```
127.0.0.1   localhost
::1         localhost
127.0.1.1   hostname.localdomain hostname
```

* * *

<a id="13-console-keymap-optional"></a>

## 🧭 13\. Console Keymap (optional)

```bash
# Only if using a non-US layout
nano /etc/conf.d/keymaps
# Set keymap="us" (or your layout) in the OpenRC configuration.
```

* * *

<a id="14-set-root-password-and-create-user"></a>

## 🔒 14\. Set Root Password and Create User

Set root password:

```bash
passwd
```

Create your user and user password:

```bash
useradd -m -G wheel -s /bin/bash yourusername
passwd yourusername
```

Add user to the sudo group:

```bash
EDITOR=nano visudo
# Uncomment (in wheel section): %wheel ALL=(ALL:ALL) ALL
```

* * *

<a id="15-configure-mkinitcpio"></a>

## 🧭 15\. Configure mkinitcpio

Check `/etc/mkinitcpio.conf` to include the Btrfs module:

```bash
cat /etc/mkinitcpio.conf | grep "^HOOKS"
```

Check that modules are outputted. Ensure:

```bash
MODULES=(btrfs)
HOOKS=(base udev autodetect modconf block filesystems keyboard fsck)
```

Then regenerate the initramfs:

```bash
mkinitcpio -P
```

* * *

<a id="16-install-and-configure-grub"></a>

## 📦 16\. Install and Configure GRUB

Install GRUB:

```bash
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=Artix
```

Generate the config:

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

* * *

<a id="17-enable-core-services"></a>

## 🧭 17\. Enable Core Services

Enable network, boot login, and zram:

```bash
rc-update add NetworkManager default
rc-update add elogind boot
rc-update add dbus default
rc-update add zramen default
```

* * *

<a id="18-configure-zram-instead-of-swap"></a>

## 🧭 18\. Configure zram (Instead of Swap)

Configure zram by editing `/etc/conf.d/zramen`:

```bash
nano /etc/conf.d/zramen
```

Keep the package-supplied configuration and follow its documented option names and units. Do not replace the whole file with settings copied from a different zram implementation. A useful starting target is a compressed swap device around 50% of RAM, using a supported compression algorithm; verify the effective result with `zramctl` and `swapon --show` after starting the service.

* * *

<a id="19-install-kde-plasma-minimal-install"></a>

## 📦 19\. Install KDE Plasma (Minimal Install)

Install only the minimal Plasma desktop — no KDE application suite:

```bash
pacman -S plasma-desktop sddm sddm-openrc
# Choose all defaults (1)
```

This gives you the Plasma shell, System Settings, and the SDDM login manager — nothing more. This matches the bare-minimum approach of the Artix KDE ISO which ships only a file manager, media player, a browser, and a document viewer.

**Add essential apps**:

```bash
pacman -S dolphin          # File manager
pacman -S konsole          # Terminal
pacman -S firefox          # Web browser
pacman -S okular           # Document viewer
pacman -S vlc              # Media player
```

**For Plasma's widgets to work**:

```bash
pacman -S \
  plasma-pa \
  plasma-nm \
  kscreen \
  powerdevil \
  bluedevil \
  kio-extras \
  udisks2 udisks2-openrc \
  polkit-kde-agent \
  kde-cli-tools \
  kde-gtk-config \
  xdg-user-dirs
```

**Enable SDDM:**

```bash
rc-update add sddm default
```

* * *

<a id="20-amd-gpu-driver"></a>

## 🖥️ 20\. AMD GPU Driver

For AMD GPUs, install the Mesa drivers:

```bash
pacman -S mesa vulkan-radeon libva-mesa-driver mesa-utils
```

For NVIDIA hardware, use the current Artix packages appropriate to your GPU generation and kernel. The 32-bit libraries are optional for 32-bit applications such as Steam, not a prerequisite for the base driver. This AMD-focused install does not validate every NVIDIA driver branch. Additional steps may be required so look up instructions specific to your NVIDIA GPU.

NVIDIA packages on most modern systems: 

```bash
pacman -S nvidia-open-dkms nvidia-utils nvidia-settings lib32-nvidia-utils   
```

* * *

<a id="21-bluetooth"></a>

## 🧭 21\. Bluetooth

Install Bluetooth utilities (bluez) and then enable.

```bash
pacman -S bluez bluez-utils bluez-openrc
rc-update add bluetoothd default
```

* * *

<a id="22-power-management-for-laptops"></a>

## 🧭 22\. Power Management (for Laptops)

Optionally use TLP for laptop power management. Do not run competing power-policy daemons at the same time.

```bash
pacman -S tlp tlp-openrc
rc-update add tlp default
```

* * *

<a id="23-device-firmware-updates"></a>

## 🔄 23\. Device Firmware Updates

Install device firmware update manager. See **Post-Install Checklist** for commands to run after reboot to update device firmware.

```bash
pacman -S fwupd
```

* * *

<a id="24-exit-unmount-and-reboot"></a>

## 🗂️ 24\. Exit, Unmount, and Reboot

```bash
exit                      # Leave chroot
umount -R /mnt            # Recursive unmount
reboot
```

Remove the USB drive when the system restarts. You should be greeted by GRUB, then the SDDM login screen.

* * *

<a id="post-install-checklist"></a>

## ✅ Post-Install Checklist

After logging in to Plasma, open terminal (Konsole):

**Verify WiFi**

```bash
ping -c 3 artixlinux.org
```

If any errors and not connected to internet:

```bash
nmcli device wifi list
```

That should scan and show available networks. Then connect:

```bash
nmcli device wifi connect "YourSSID" password "YourPassword"
```

**Verify zram is active:**

```bash
swapon --show
# Should show /dev/zram0 with your configured size
```

**Verify Btrfs subvolumes:**

```bash
btrfs subvolume list /
```

```
/dev/nvme0n1
├── nvme0n1p1   1 GB    FAT32   /boot/efi     (EFI System Partition)
└── nvme0n1p2   Rest    Btrfs   (subvolumes)
    ├── @                       /
    ├── @home                   /home
    ├── @log                    /var/log
    ├── @cache                  /var/cache
    └── @snapshots              /.snapshots
```

**No swap partition** — zram handles memory compression in RAM.

**Verify GPU driver:**

```bash
glxinfo | grep "OpenGL renderer"
# Should show AMD Radeon / RDNA
```

**Check and run firmware updates:**

```bash
fwupdmgr refresh
fwupdmgr get-updates
fwupdmgr update
# then reboot to install firmware updates
```

**Start audio devices:**

Add and run PipeWire (audio) services for openrc.

```bash
rc-update add -U pipewire default
rc-update add -U pipewire-pulse default
rc-update add -U wireplumber default
rc-service -U pipewire start
rc-service -U pipewire-pulse start
rc-service -U wireplumber start
```

**Enable additional repositories (for wider package access):**

Edit `/etc/pacman.conf` and add additional mirrors:

```bash
sudo nano /etc/pacman.conf
```

Add the lib32 library so you can install Steam:

```bash
[lib32]
Include = /etc/pacman.d/mirrorlist
# Uncomment this section
```

**Update all packages:**

```bash
sudo pacman -Syu
```

Run this once after fresh install and at least once a week to update all packages to maintain system.

* * *

<a id="additional-packages-and-updates"></a>

## 🔄 Additional Packages and Updates

**Recommended additional packages (some already installed from initial instructions, but are included again just in case):**

Local snapshots

```bash
sudo pacman -S timeshift snapper
```

- **Timeshift** local system snapshots (not an independent backup)
- **Snapper** alternative snapshot manager; choose and configure one deliberately

Core Services

```bash
sudo pacman -S \
  networkmanager networkmanager-openrc \
  elogind elogind-openrc \
  acpid acpid-openrc \
  cronie cronie-openrc \
  bluez bluez-openrc bluez-utils \
  cups cups-openrc system-config-printer \
  ntp ntp-openrc \
  pipewire-pulse pipewire-pulse-openrc pipewire-jack wireplumber wireplumber-openrc alsa-utils sof-firmware \
  pavucontrol \
  sof-firmware alsa-firmware \
  fwupd bolt upower \
  sudo nano vim git curl wget rsync unzip zip \
  pacman-contrib pkgfile \
  bash-completion man-db man-pages \
  ufw ufw-openrc
```

- **NetworkManager**: easiest desktop networking
- **elogind**: session/power integration
- **acpid / upower**: lid, battery, suspend behavior
- **cronie** time-based job scheduler used to run specified programs or scripts at scheduled times
- **bluez**: Bluetooth
- **cups**: only if you print
- **fwupd**: important on Framework for firmware updates
- **bolt**: useful for Thunderbolt/USB4 device authorization
- **SOF / ALSA firmware**: helps with modern laptop audio hardware
- **ufw**: Uncomplicated Firewall for managing firewall

ufw requires adding to openrc:

```bash
sudo rc-update add ufw default
sudo ufw default deny incoming
sudo ufw default allow outgoing
# Add required access rules before enabling on a remotely managed machine.
sudo ufw enable
sudo rc-service ufw start
```

KDE and Utilities:

```bash
sudo pacman -S \
  ark filelight gwenview okular \
  kate konsole \
  spectacle flameshot \
  partitionmanager \
  kdeconnect
```

- **Okular** for PDFs
- **Kate** as the default GUI editor
- **Spectacle** or **Flameshot** (preferred) for screenshots
- **Filelight** for storage cleanup
- **KDE Connect** if want to hookup Linux system to phone

Dev / Coding:

```bash
sudo pacman -S \
  base-devel \
  github-cli \
  openssh openssh-openrc \
  jq yq \
  python python-pip \
  nodejs npm \
  docker docker-openrc docker-compose \
  podman podman-compose
```

AUR utility:

```bash
sudo pacman -S --needed base-devel git
git clone https://aur.archlinux.org/paru.git
cd paru
makepkg -si
```

- **Paru** recommended AUR helper

AUR apps / packages:

```bash
paru -S brave-bin \
  signal-desktop \
  vscodium-bin \
  onlyoffice-bin \
  timeshift-autosnap
```

- **Brave** browser (preferred over Firefox)
- **Signal** messenger (preferred vs WhatsApp, Telegram, etc)
- **VSCodium** open-source text editor (preferred over Microsoft's Visual Studio Code)
- **ONLYOFFICE** open-source office suite (preferred for greatest compatibility with Microsoft Office)
- **Timeshift Autosnapper** installs a hook so Timeshift automatically creates a backup every time packages are updated through pacman

Flatpak:

```bash
pacman -S flatpak
```

- Flatpak if you want to install GUI apps easily

Media apps:

```bash
sudo pacman -S \
  vlc mpv \
  ffmpeg \
  libreoffice-fresh \
  obs-studio
```

- **VLC** (preferred) **or MPV** media player
- **FFmpeg** media conversion tools
- **OBS Studio** open-source recording / screencasting

Office apps:

```bash
sudo pacman -S \
  libreoffice-fresh \
  thunderbird \
  okular \
  evince
```

- **LibreOffice** office suite (alternative to ONLYOFFICE)
- **Thunderbird** open-source email client (Microsoft Outlook replacement)
- **Okular** document viewer (default for KDE)
- **Evince** document viewer (alternative to Okular that's packaged with GNOME)

Gaming:

```bash
sudo pacman -S \
  steam \
  gamemode \
  mangohud \
  vulkan-radeon \
  lib32-mesa \
  lib32-vulkan-radeon \
  mesa vulkan-tools
```

- **Steam** video game store and distribution service, including additional required tools / drivers (AMD GPU)
- Steam requires 32-bit application support - requires lib32 library

Tailscale:

```bash
sudo pacman -S tailscale tailscale-openrc
sudo rc-update add tailscaled default
sudo rc-service tailscaled start
```

- **Tailscale** open-source mesh VPN service

Fonts:

```bash
sudo pacman -S ttf-jetbrains-mono
paru -S ttf-jetbrains-mono-nerd
```

- **Jet Brains** fonts and nerd fonts

Monitoring utilities:

```bash
sudo pacman -S \
  btop fastfetch \
  ncdu \
  ripgrep fd fzf \
  htop \
  usbutils pciutils \
  smartmontools lm_sensors
```

- **Btop** system overview
- **Fastfetch** (obligatory "neofetch")
- `ripgrep`, `fd`, `fzf` for terminal quality of life
- `smartmontools` for SSD health
- `lm_sensors` for temperatures

Cloud storage:

```bash
paru -S \
  nextcloud-client-git \
  pcloud-drive
```

- **Nextcloud** self-hosted cloud storage client (requires Nextcloud server)
- **pCloud** privacy-oriented cloud storage client (requires pCloud account)

* * *

<a id="notes"></a>

## 🧭 Notes

- **Kernel:** This guide uses the `linux` kernel. Artix also offers `linux-lts` and `linux-zen`.
- **Snapshots:** With this subvolume layout, you can use `snapper` or `timeshift` to snapshot `@` without capturing `/home`, logs, or caches. Keep `/var/lib/pacman` in the root snapshot so package metadata rolls back with installed files. Snapshots on the same disk are not independent backups.
