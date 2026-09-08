---
title: "Fedora KDE Plasma Desktop Installation Guide"
description: >-
  Step-by-step Fedora 44 KDE Plasma Desktop installation with Fedora's graphical installer, Btrfs defaults, RPM Fusion, AMD/NVIDIA notes, privacy cleanup, and practical post-install configuration.
---
**Target Machine:** PC / Laptop (hardware-neutral; AMD and NVIDIA sections included)

**Filesystem:** Fedora default Btrfs layout

**Swap:** zram (Fedora default; no dedicated swap partition required)

**Desktop:** KDE Plasma / Wayland

**Init:** systemd

**Boot:** UEFI

Fedora KDE Plasma Desktop is one of the best mainstream Linux desktop choices when you want a modern kernel, current hardware support, a polished KDE experience, and strong upstream defaults without building the system manually.

Non-systemd Linux are generally recommended where practical. Fedora is included because it is a major upstream distribution, an important reference platform for modern Linux, and an excellent choice for newer desktop/workstation hardware.

Official downloads and documentation:

- Fedora KDE Plasma Desktop: <https://fedoraproject.org/kde/download/>
- Fedora Docs: <https://docs.fedoraproject.org/>
- RPM Fusion: <https://rpmfusion.org/>

---

<a id="1-before-you-begin"></a>

## 🧭 1. Before You Begin

Recommended firmware/BIOS settings:

- Use **UEFI**, not Legacy/CSM mode
- Enable **SVM/AMD-V** or **Intel VT-x** if you use virtualization
- Enable **IOMMU** if you expect to use PCIe passthrough later
- Leave **Secure Boot enabled** unless you have a specific reason to disable it
- Update the motherboard/laptop firmware before installing when practical

Back up anything important before repartitioning or replacing an existing OS.

For an NVIDIA server, whether Secure Boot remains enabled depends on how the proprietary kernel module will be installed and signed. Do not disable it reflexively; decide based on the actual driver workflow.

:::tip[Keep Fedora simple]
Unlike the Artix manual installation, the point of this guide is not to rebuild Fedora's defaults by hand. Fedora's installer, Btrfs layout, zram configuration, SELinux policy, and firewall defaults are all sensible. Start with those defaults and customize only where there is a clear benefit.
:::

---

<a id="2-download-fedora-44-kde-plasma-desktop"></a>

## 📥 2. Download Fedora 44 KDE Plasma Desktop

Download the x86_64 Live ISO from:

<https://fedoraproject.org/kde/download/>

Fedora publishes signed checksums. Verifying the ISO before writing it is good practice.

Fedora's download page provides the current verification commands for the exact ISO build. Follow those rather than copying an old checksum from a guide.

---

<a id="3-create-a-bootable-usb"></a>

## 📥 3. Create a Bootable USB

### Fedora Media Writer

Fedora Media Writer is the easiest supported option and is available for Linux, Windows, and macOS.

### Ventoy

Ventoy is useful if you maintain a multi-ISO USB drive.

### Linux `dd`

First identify the USB device:

```bash
lsblk
```

Then write the ISO to the whole USB device — **not a partition**:

```bash
sudo dd if=fedora-kde.iso \
  of=/dev/sdX bs=4M status=progress oflag=sync
```

:::danger
Replace `fedora-kde.iso` with the exact verified download filename. Do not put a wildcard inside `if=...`. Double-check `/dev/sdX`. `dd` will overwrite the target without asking.
:::

---

<a id="4-boot-the-fedora-live-environment"></a>

## 🧭 4. Boot the Fedora Live Environment

Boot from the USB drive using your system's boot menu.

| Manufacturer | Boot Menu Key | BIOS/UEFI Key |
| :--- | :--- | :--- |
| Acer | F12, Esc, F9 | F2, Delete |
| Asus | F8, Esc | F2, Delete |
| Dell | F12 | F2 |
| HP | F9, Esc | F10 |
| Lenovo | F12, F10, F8 / Novo | F2, F1 |
| MSI | F11 | Delete |
| Gigabyte | F12 | Delete, F2 |

At the Fedora menu, start the live environment.

Before installing, verify:

- Ethernet or Wi-Fi works
- Keyboard and mouse work
- Display resolution is usable
- Storage devices are visible
- Audio works if important to the system

Testing hardware in the Live environment catches problems before committing the disk.

---

<a id="5-launch-the-graphical-installer"></a>

## 📦 5. Launch the Graphical Installer

Open **Install Fedora** from the KDE desktop.

The exact installer layout can change between Fedora releases, but the required decisions remain the same.

### Language and Region

Choose your preferred:

- Language
- Keyboard layout
- Timezone

### Installation Destination

Select the target disk.

For a normal single-drive desktop or laptop, use **automatic/default storage configuration**.

Fedora will create the required EFI and Btrfs layout automatically.

:::tip[Why use Fedora's default partitioning?]
Fedora's defaults are well integrated with the distribution and reduce future maintenance. Custom partitioning is worthwhile for dual boot, unusual encryption requirements, multi-drive workstations, or deliberately separated data volumes — not simply because manual partitioning feels more advanced.
:::

### Encryption

Full-disk encryption is strongly recommended for laptops and any machine containing sensitive data.

Enable disk encryption in the installer if appropriate for the system.

### User Account

Create your normal user account and use a strong password.

Do not make routine desktop work a root-user workflow.

---

<a id="6-install-and-reboot"></a>

## 📦 6. Install and Reboot

Start the installation.

After completion:

1. Shut down or reboot
2. Remove the USB drive
3. Boot Fedora from the internal disk
4. Complete any first-login prompts

---

<a id="7-update-the-system-first"></a>

## 🔄 7. Update the System First

Before installing third-party software:

```bash
sudo dnf upgrade --refresh
```

Reboot if a new kernel, firmware-related package, or major system component was installed:

```bash
sudo reboot
```

Verify the release:

```bash
cat /etc/fedora-release
```

---

<a id="8-firmware-updates"></a>

## 🔄 8. Firmware Updates

Fedora integrates well with LVFS through `fwupd`.

Check for supported firmware updates:

```bash
sudo fwupdmgr refresh --force
sudo fwupdmgr get-updates
```

Apply available updates:

```bash
sudo fwupdmgr update
```

Not every motherboard or peripheral publishes firmware through LVFS, so also check the hardware vendor when appropriate.

---

<a id="9-enable-rpm-fusion"></a>

## 🧭 9. Enable RPM Fusion

Fedora intentionally ships only software that meets its licensing and distribution requirements. RPM Fusion provides many commonly needed multimedia and proprietary packages.

Enable both Free and Nonfree repositories using the commands published by RPM Fusion for your Fedora release:

```bash
sudo dnf install \
  https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm \
  https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
```

Refresh metadata:

```bash
sudo dnf upgrade --refresh
```

Verify:

```bash
dnf repolist | grep rpmfusion
```

---

<a id="10-multimedia-support"></a>

## 🌍 10. Multimedia Support

After RPM Fusion is enabled, Fedora users commonly switch the limited Fedora multimedia packages to the fuller RPM Fusion variants.

Because package groups can change between releases, check RPM Fusion's current multimedia guidance before blindly pasting old commands.

A useful starting point is:

<https://rpmfusion.org/Howto/Multimedia>

---

<a id="11-amd-cpu-and-gpu-systems"></a>

## 🖥️ 11. AMD CPU and GPU Systems

AMD graphics support is built into the Linux kernel and Mesa stack. For normal desktop use, **do not install AMDGPU-PRO**.

Update the system and ensure useful Mesa/Vulkan tooling is available:

```bash
sudo dnf install -y \
  mesa-dri-drivers \
  mesa-vulkan-drivers \
  vulkan-tools
```

Verify Vulkan:

```bash
vulkaninfo --summary
```

For AMD CPUs, Fedora normally installs the appropriate microcode through the standard firmware stack. Keep the OS and system firmware current rather than manually downloading CPU microcode.

---

<a id="12-nvidia-gpu-systems-rpm-fusion"></a>

## 🖥️ 12. NVIDIA GPU Systems (RPM Fusion)

Do **not** use NVIDIA's standalone `.run` installer on a normal Fedora system. It bypasses Fedora's package management and creates avoidable maintenance problems during kernel updates.

Use RPM Fusion's NVIDIA packages instead.

First enable RPM Fusion as shown above, then follow the current RPM Fusion NVIDIA guide:

<https://rpmfusion.org/Howto/NVIDIA>

For current supported NVIDIA hardware, the package is typically built around `akmod-nvidia` or the appropriate current open-kernel-module package where recommended by RPM Fusion.

The important pattern is:

1. Install through RPM Fusion
2. Allow the akmod package time to build the kernel module
3. Reboot only after the module build completes
4. Verify with `nvidia-smi`

Example verification:

```bash
nvidia-smi
```

### Secure Boot

Secure Boot can remain enabled, but third-party kernel modules must be signed with a trusted Machine Owner Key (MOK).

RPM Fusion documents the supported signing/enrollment process. Follow its current Secure Boot instructions rather than disabling Secure Boot by default.

:::caution
After installing or upgrading NVIDIA kernel modules, do not immediately power off while akmods is still compiling. Check the build state first if you are unsure.
:::

Useful checks:

```bash
modinfo -F version nvidia 2>/dev/null
nvidia-smi
```

---

<a id="13-flatpak-and-flathub"></a>

## 🧭 13. Flatpak and Flathub

KDE Discover supports Flatpak well and is useful for desktop applications that you do not want tightly coupled to the base OS.

Check whether Flathub is already configured:

```bash
flatpak remotes
```

If needed:

```bash
flatpak remote-add --if-not-exists flathub \
  https://flathub.org/repo/flathub.flatpakrepo
```

Use RPM packages for core system software and drivers. Flatpak is excellent for sandboxed GUI applications.

---

<a id="14-basic-command-line-tools"></a>

## 🧭 14. Basic Command-Line Tools

Install a useful baseline:

```bash
sudo dnf install -y \
  git \
  curl \
  wget \
  vim-enhanced \
  nano \
  htop \
  btop \
  fastfetch \
  rsync \
  unzip \
  7zip \
  openssh-clients
```

Use whichever subset you actually need.

---

<a id="15-firewall"></a>

## 🔒 15. Firewall

Fedora uses `firewalld` by default.

Verify it is active:

```bash
sudo systemctl status firewalld
```

List the active zone and rules:

```bash
sudo firewall-cmd --get-active-zones
sudo firewall-cmd --list-all
```

Do not disable the firewall just because the computer sits behind a home router.

---

<a id="16-selinux"></a>

## 🔒 16. SELinux

Fedora ships with SELinux enabled and enforcing. Keep it that way.

Verify:

```bash
getenforce
```

Expected:

```text
Enforcing
```

If an application fails because of SELinux, troubleshoot the policy or labeling problem rather than globally disabling SELinux.

:::caution
`setenforce 0` can be useful as a temporary diagnostic test. It is not a permanent fix.
:::

---

<a id="17-privacy-and-desktop-cleanup"></a>

## 🧭 17. Privacy and Desktop Cleanup

A privacy-conscious Fedora desktop does not require disabling every integration. The goal is to deliberately choose what communicates externally.

Review KDE **System Settings** for:

- Online Accounts you do not use
- Location-related services
- Search/indexing behavior
- Bluetooth if unused
- Remote Desktop / sharing features
- KDE Connect if you do not use it

Also review installed applications and remove software you do not need.

List installed packages:

```bash
dnf list --installed
```

List Flatpaks:

```bash
flatpak list
```

:::tip
The strongest privacy improvement is usually not a hidden tweak. It is reducing unnecessary accounts, browser tracking, cloud synchronization, exposed services, and software you do not use.
:::

---

<a id="18-browser"></a>

## 🧭 18. Browser

For a privacy-oriented daily browser, you can use **Brave**.

Install from Brave's current official Linux repository instructions:

<https://brave.com/linux/>

After installation, review:

- Shields defaults
- Search engine
- Sync settings
- Web3 features if unused
- Password-manager behavior
- Browser telemetry/rewards features you do not use

Avoid piling on dozens of extensions; every extension increases browser attack surface and fingerprint complexity.

---

<a id="19-proton-apps"></a>

## 🧭 19. Proton Apps

Depending on your workflow, useful Proton services include:

- Proton Mail
- Proton Pass
- Proton VPN
- Proton Drive

Prefer official packages or supported installation methods where available. Browser-based access is often preferable to unofficial wrappers.

---

<a id="20-tailscale"></a>

## 🌐 20. Tailscale

For private remote administration and access to homelab services, install Tailscale from its official Fedora instructions:

<https://tailscale.com/download/linux/fedora>

After installation:

```bash
sudo tailscale up
```

Verify:

```bash
tailscale status
```

For detailed design and access-control guidance, see the [Tailscale guide](/homelab/tailscale/).

---

<a id="21-vscodium"></a>

## 🧭 21. VSCodium

For a VS Code-compatible editor without Microsoft's telemetry defaults, you can use **VSCodium**.

Use the project's current Fedora/RPM repository instructions:

<https://vscodium.com/>

---

<a id="22-docker-optional"></a>

## 🐳 22. Docker (Optional)

A desktop workstation does not automatically need Docker. Install it only if you plan to self-host or actually develop, test, or run containers locally.

Use Docker's official Fedora repository:

<https://docs.docker.com/engine/install/fedora/>

After installation:

```bash
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

Log out and back in before testing non-root Docker access.

```bash
docker run hello-world
```

:::caution[Docker group = root-equivalent access]
Membership in the `docker` group effectively grants administrative control over the host. Treat it accordingly.
:::

---

<a id="23-check-zram"></a>

## ✅ 23. Check zram

Fedora configures compressed RAM-backed swap by default.

Verify:

```bash
swapon --show
zramctl
```

For most desktop systems there is no reason to add a traditional swap partition unless you specifically need hibernation or have another workload-driven requirement.

---

<a id="24-useful-system-checks"></a>

## ✅ 24. Useful System Checks

```bash
# Kernel
uname -r

# Hardware
lscpu
lsblk -f

# Graphics
lspci -k | grep -A3 -E 'VGA|3D|Display'

# Memory
free -h

# Filesystem
df -hT

# Network
ip addr

# Failed services
systemctl --failed

# SELinux
getenforce
```

---

<a id="25-update-routine"></a>

## 🔄 25. Update Routine

Keep the system simple:

```bash
sudo dnf upgrade --refresh
flatpak update
```

Reboot when kernel, graphics-driver, firmware, or core system changes justify it.

Do not turn Fedora into a rolling-release experiment by stacking third-party repositories indiscriminately.

---

<a id="26-recommended-final-state"></a>

## ✅ 26. Recommended Final State

A clean Fedora KDE workstation should end up with:

- Fedora 44 KDE Plasma Desktop
- UEFI boot
- Fedora's default Btrfs layout
- zram
- Secure Boot retained where practical
- SELinux enforcing
- firewalld active
- RPM Fusion enabled only where needed
- AMD Mesa stack or RPM Fusion NVIDIA driver
- Flathub for selected GUI applications
- Tailscale for private remote access
- A small, intentional application set

---

<a id="final-thought"></a>

## 🧠 Final Thought

Fedora is not the choice for maximum init-system independence. It **is** one of the best mainstream reference Linux desktops though: modern, stable, secure, well maintained, close to upstream, and exceptionally good for current workstation hardware. Linus Torvalds himself (the creator of Linux) has joked if he were emperor, everyone would be forced to use Fedora.