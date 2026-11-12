---
title: "Create a Bootable Linux USB with Ventoy"
description: >-
  Create and maintain a reusable multiboot USB from Windows or Linux, verify ISO downloads, boot in UEFI mode, and troubleshoot installation media.
---

Ventoy is the RebelRx recommended method for preparing Linux installation media. Install it on a USB once, then keep several installer ISO files on the same drive. Choose an image at startup instead of rewriting the USB whenever you change distributions.

This guide covers **creating the USB on Windows or Linux** for ordinary **64-bit Intel/AMD PCs**, plus carrying a Windows installer alongside Linux images. It does not configure dual boot on an internal disk. ARM devices, Apple Silicon, and PCs with unusual firmware need platform-specific instructions.

## 1. Gather what you need

- A working Windows or Linux computer with administrator/root access and internet access.
- A USB drive: **32 GB or larger recommended** for several images. Check the combined ISO sizes and leave free space.
- A backup of everything on that USB, and backups of important data on the installation target.
- The ISO appropriate to your distribution, release, architecture, and init system.

:::danger[Installing Ventoy erases the selected drive]
The initial installation repartitions the entire USB. Match its model and capacity before confirming. Disconnect other removable storage to reduce mistakes. The USB destination is different from the internal disk you will later install Linux onto.
:::

## 2. Download Ventoy and your images

Start at the [official Ventoy downloads page](https://www.ventoy.net/en/download.html) and follow its release download links. Download the current Windows ZIP or Linux tar.gz package for the computer preparing the USB. Extract it to your computer, outside the USB. Check the package's SHA-256 against the value published by the project before running it, using the hashing commands below with the archive filename.

Get ISO files from the distribution's official site:

| Installation path | Image to choose | Official download |
| :--- | :--- | :--- |
| Artix KDE + OpenRC manual install | Base OpenRC, x86_64 | [Artix](https://artixlinux.org/download.php) |
| Devuan server | Release's amd64 netinstall ISO | [Devuan](https://www.devuan.org/get-devuan) |
| Debian server | Release's amd64 netinst ISO | [Debian](https://www.debian.org/distrib/netinst) |
| Fedora KDE | KDE Plasma Desktop Live ISO, x86_64 | [Fedora KDE](https://fedoraproject.org/kde/download/) |
| Optional Windows installer | Official x64 ISO for your license and target | [Microsoft Windows 11](https://www.microsoft.com/software-download/windows11) |

Follow the release selected by your installation guide. Avoid unofficial repacks. Also download its checksum file and signature, where provided, from the same release directory. Keep the original ISO filenames so that checksum entries are easy to match.

## 3. Verify downloads before using them

A checksum comparison detects corruption. A signature checked against an independently confirmed project signing key also authenticates the checksum list. A hash bundled with an untrusted download does not establish who published it.

### Windows: SHA-256 in PowerShell

Open PowerShell in the folder containing your download. Replace the example filename with the actual file:

```powershell
Get-FileHash -LiteralPath '.\your-distribution.iso' -Algorithm SHA256
```

Compare the **entire** Hash value with the official SHA-256 entry for that exact filename, architecture, and release. Letter case does not matter. For Microsoft's ISO, use the download page's verification information for the selected language/edition. Use `SHA512` instead if the publisher supplies SHA-512.

### Linux: calculate and compare

```bash
sha256sum -- 'your-distribution.iso'
```

Compare all characters against the official SHA-256. For a SHA-512 list, use `sha512sum`. Never compare hashes made with different algorithms.

### Authenticate signed checksums

Use the publisher's current key and verification instructions: [Debian image verification](https://www.debian.org/CD/verify), the **Verify** section on the [Fedora KDE download page](https://fedoraproject.org/kde/download/), or the verification instructions linked with your Artix/Devuan release. Key names and signature formats differ between distributions.

For a Debian-style detached signature, this is the workflow on Linux, or Windows with GnuPG installed. Run it in the directory containing the downloaded key, signature, checksums, and ISO:

```bash
gpg --show-keys --with-fingerprint project-signing-key.asc
# Compare the full fingerprint with the publisher's official key information first.
gpg --import project-signing-key.asc
gpg --verify SHA256SUMS.sign SHA256SUMS
```

These are placeholder filenames: substitute the release's real names. A “Good signature” is useful only after confirming that it comes from the expected project key; a keyserver name or short key ID is insufficient. A warning about personal trust can occur for a correctly fingerprint-checked key. A bad, missing, or unexpected signature must be resolved before proceeding. Fedora commonly uses a signed CHECKSUM file rather than this detached-signature layout; follow its own commands.

After authenticating a GNU-format `SHA256SUMS` list, Linux can verify the files present in that folder:

```bash
sha256sum --ignore-missing -c SHA256SUMS
```

Require an **OK for the exact ISO you will boot**, not merely another file. On Windows, compare `Get-FileHash` with the authenticated list. Stop on any mismatch: check the selected release and re-download before continuing. Do not boot an image that fails verification.

## 4. Prepare firmware: UEFI and Secure Boot

**RebelRx's preferred baseline for these Linux guides is UEFI enabled, Legacy/CSM disabled, and Secure Boot disabled.** This reduces Ventoy compatibility and third-party module-signing steps. It is a workflow preference, not a universal security recommendation.

Secure Boot checks boot software against trusted signatures. Disabling it removes that boot-integrity protection and increases exposure to unauthorized boot software, including bootkits. ISO verification helps establish download integrity; it does not replace Secure Boot. Protect physical access, use trusted media, and keep firmware and operating systems updated.

**An NVIDIA GPU does not inherently require disabling Secure Boot.** Proprietary drivers can work with signed kernel modules and trusted keys. If you need Secure Boot, use your distribution's supported signing/enrollment process; see [Debian's NVIDIA guidance](https://wiki.debian.org/NvidiaGraphicsDrivers/Troubleshooting). Ventoy's own [Secure Boot support](https://www.ventoy.net/en/doc_secure.html) is a separate setup from signing Linux NVIDIA modules.

:::caution[Before changing a Windows computer's firmware]
Save and confirm access to the BitLocker/Device Encryption recovery key somewhere outside that computer. Firmware and boot changes can trigger recovery. Follow [Microsoft's suspend/resume guidance](https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/recovery-process) before making changes and resume protection after the intended boot configuration is stable. Do not clear the TPM or delete Secure Boot keys. Follow your organization's policy on managed devices.
:::

1. Enter firmware setup using the device manufacturer's instructions, or Windows **Settings → System → Recovery → Advanced startup → Restart now → Troubleshoot → Advanced options → UEFI Firmware Settings**, if available.
2. Record existing settings. Keep the target machine in UEFI mode; do not switch an existing Windows installation to Legacy/CSM.
3. Set **Secure Boot → Disabled** for this Linux workflow, save, and restart. Menu names vary. Do not change storage-controller modes or reset firmware keys to achieve this.
4. If USB boot is skipped, temporarily disable firmware Fast Boot and enable USB boot. This is separate from Windows Fast Startup; for dual boot, also follow the distro's advice about Windows Fast Startup/hibernation before accessing Windows filesystems.

For an existing Linux system, `mokutil --sb-state` reports Secure Boot state if the utility is installed. On Windows, `msinfo32` shows **BIOS Mode** and **Secure Boot State**.

**Windows caveat:** keeping a Windows ISO on Ventoy does not waive Windows requirements. [Windows 11 requires UEFI with Secure Boot capability](https://www.microsoft.com/en-us/windows/windows-11-specifications) and other supported hardware. Some security features, organizational policies, or games require Secure Boot enabled. Plan a supported boot configuration for every installed OS; this Linux baseline is not a Windows security recommendation. Before re-enabling Secure Boot later, confirm that every bootloader and required kernel module is trusted, have recovery media ready, and test each OS.

## 5. Install Ventoy from Windows

1. Insert the backed-up USB. In File Explorer or Disk Management, note its capacity and model.
2. In the extracted Windows package, run **Ventoy2Disk.exe** as administrator.
3. Select that USB in **Device**. Leave **Show all devices** off so internal disks are not unnecessarily exposed.
4. Under **Option → Partition Style**, choose **GPT** for this UEFI-focused workflow. MBR also supports UEFI in Ventoy and may suit older machines; see the [partition-style notes](https://www.ventoy.net/en/doc_mbr_vs_gpt.html). This choice concerns the USB, not the install target's partition table.
5. Ventoy's **Secure Boot Support** option is separate from the computer's firmware switch. It can be left off for this baseline; changing it does not disable firmware Secure Boot.
6. Recheck the selected device, click **Install**, and confirm the erase prompts only when the target is correct.
7. Wait for success. Reconnect the drive if Windows has not refreshed its volumes.

## 6. Install Ventoy from Linux

Use either the graphical tool or the terminal, not both.

### Graphical option

Extract the Linux package and run the GUI matching the preparation computer, such as `VentoyGUI.x86_64` on an Intel/AMD 64-bit system. Authenticate when prompted. Select the USB by model/capacity, choose GPT under the partition-style option, then **Install** and confirm the erase prompts. The [official Linux GUI instructions](https://www.ventoy.net/en/doc_linux_gui.html) describe the available interfaces.

### Terminal option

Compare the device list before and after inserting the USB:

```bash
lsblk -o NAME,PATH,SIZE,MODEL,TRAN,TYPE,MOUNTPOINTS
```

Identify the **whole USB disk**, such as `/dev/sdb`, by capacity, model, and USB transport. `/dev/sdb1` is a partition. `/dev/sdX` below is a placeholder; never guess the letter or use your internal system drive. Device names can change after reconnecting.

Close file-manager windows using the USB and unmount each mounted USB partition individually. For example, only if `/dev/sdb1` was confirmed as a mounted partition of your USB:

```bash
sudo umount /dev/sdb1
```

Open a terminal in the extracted Ventoy directory. Replace `/dev/sdX` with the verified whole-disk path:

```bash
sudo sh Ventoy2Disk.sh -i -g /dev/sdX
```

`-i` installs; `-g` selects GPT. Read the displayed disk identity and erase warnings before answering the prompts. Avoid `-I`, which forces reinstallation. Secure Boot option defaults have differed between packages/documentation; consult the included README if changing that option. For this baseline, the firmware switch must be disabled regardless of Ventoy's support setting. See the [upstream command reference](https://github.com/ventoy/Ventoy/blob/master/INSTALL/README).

## 7. Copy the verified ISOs

Open the large data partition, normally labeled **Ventoy**. Leave the small **VTOYEFI** boot partition alone. Keep the default exFAT data filesystem, which works across Windows/Linux and accepts files over FAT32's 4 GiB limit.

Copy the **ISO files themselves** onto the large partition. Do not extract their contents or flash an ISO over the Ventoy drive. A simple optional folder layout is:

```text
Ventoy/
  ISO/
    Linux/
      artix-base-openrc-<release>-x86_64.iso
      devuan-<release>-amd64-netinstall.iso
      debian-<release>-amd64-netinst.iso
      Fedora-KDE-<release>-x86_64.iso
    Windows/
      Windows11-<release>-x64.iso
  Checksums/
```

Names above illustrate organization; keep the actual downloaded filenames. Ventoy discovers images in subdirectories. Copy only what you need; a netinstall image still needs network access during installation.

Hash the copied ISO on the USB again and compare with the verified original. On Windows, for example (replace the drive letter and filename):

```powershell
Get-FileHash -LiteralPath 'E:\ISO\Linux\your-distribution.iso' -Algorithm SHA256
```

On Linux, use `sha256sum` with the actual mounted USB file path. Wait for all copying to finish. Use **Eject/Safely Remove** on Windows; on Linux run `sync`, then eject/unmount through the file manager before unplugging.

## 8. Boot and test in UEFI mode

1. Connect the USB directly to the installation target and open its one-time boot menu. Common keys include F12, F11, Esc, or F9; check the manufacturer's instructions for your model.
2. Choose **UEFI: <USB name>**, if two entries appear. Do not select the Legacy entry for these guides.
3. At the Ventoy menu, select the desired ISO and choose **Boot in normal mode** first.
4. Confirm the distribution's installer or live environment starts. Use its media-test option when offered, especially Fedora's **Test this media & start** entry.
5. Before partitioning, confirm Linux actually booted with UEFI:

```bash
test -d /sys/firmware/efi && echo "UEFI boot confirmed" || echo "STOP: reboot in UEFI mode"
```

If the directory is missing, reboot through the UEFI USB entry before proceeding. Test the images you intend to use on the actual target; reaching the Ventoy menu alone does not prove an ISO works. A live session does not persist changes unless you separately configure persistence.

Return to your installation guide below. The installer can erase internal disks once you authorize partitioning: check the destination again. After installation, remove the USB when instructed and boot the internal disk.

## 9. Maintain the multiboot USB

Adding or replacing a distribution only requires copying a new **verified** ISO and removing the obsolete file. This does not update Ventoy itself or any installed OS.

To update Ventoy, back up the USB's ISOs and configuration, download and verify the new package, and select the **same USB** in Ventoy2Disk. Use **Update**, not Install. On Linux, after identifying the device again:

```bash
sudo sh Ventoy2Disk.sh -u /dev/sdX
```

Updates are designed to preserve data on the large partition; backups still protect against device failure or selecting the wrong operation. Changing MBR/GPT requires a fresh installation rather than an update. Recheck copied-file hashes and test boot after maintenance. See [Ventoy's update instructions](https://www.ventoy.net/en/doc_start.html).

## 10. Troubleshooting

| Symptom | What to check |
| :--- | :--- |
| USB absent from the boot menu | Use a direct USB port, try another port (including USB 2), enable USB boot, temporarily turn off firmware Fast Boot, and confirm Ventoy installation completed. For UEFI firmware that rejects an MBR USB, back up and reinstall Ventoy using GPT. |
| Security violation, signature error, or key-enrollment screen | Check that firmware **Secure Boot is actually disabled** for this baseline. Ventoy's support checkbox is not the firmware setting. If you require Secure Boot, follow its official enrollment instructions instead of enrolling an unknown key. |
| Ventoy menu appears but no ISOs | Copy intact `.iso` files to the large data partition, check space and completed transfers, and remove any custom search/filter configuration while diagnosing. |
| ISO starts then fails or reports corruption | Recheck the USB copy's hash, try another port/drive, update Ventoy, and check the exact image against [Ventoy's tested images](https://www.ventoy.net/en/isolist.html). A listed image is not a guarantee for every firmware. |
| A Linux ISO fails in normal mode | Try **GRUB2 mode** if offered for that image. It is an alternative for compatible Linux images, not a universal fix. |
| A Windows ISO fails in normal mode | Try **WIMBOOT mode** if offered, then try Microsoft's own installation media. Check the target's supported hardware requirements. |
| Black screen after Linux begins loading | Use the ISO's safe/basic graphics entry if available. Follow the distribution's graphics guidance; disabling Secure Boot alone does not fix every GPU issue. |
| ISO is too large to copy | Check free space and filesystem. FAT32 cannot hold a file of 4 GiB or more; keep Ventoy's default exFAT. Do not format the small EFI partition. |
| Linux installer booted in Legacy mode | Reboot using the UEFI USB entry; check `/sys/firmware/efi` before partitioning. |
| Windows asks for a recovery key | Use the saved BitLocker key. Restore the intended firmware configuration if necessary; do not erase the encrypted volume to bypass recovery. |
| Ventoy install/update fails | Close programs accessing the USB, unmount mounted partitions on Linux, and try another port. Consult the [official FAQ](https://www.ventoy.net/en/faq.html) before retrying. Do not switch from Update to Install without a backup. |

Alternative modes are described in [Ventoy's secondary boot menu documentation](https://www.ventoy.net/en/doc_secondary_boot_menu.html). If a verified image consistently fails through Ventoy, test dedicated media below to distinguish a Ventoy issue from an image/hardware issue.

## 11. Alternatives: a dedicated single-image USB

Use a **separate USB** for alternatives if you want to keep the multiboot drive. Writing dedicated media replaces the selected USB's contents, including any Ventoy installation.

- **Fedora Media Writer:** Fedora's supported graphical path for Fedora installation media. Follow the [Fedora download page](https://fedoraproject.org/kde/download/) for the tool and instructions.
- **Rufus on Windows:** download from [rufus.ie](https://rufus.ie/), select the verified ISO and correct USB, and follow its prompts for the target's UEFI setup. Recheck the destination before starting.
- **Microsoft Media Creation Tool:** use the [official Windows download page](https://www.microsoft.com/software-download/windows11) for dedicated Windows installation media. This is separate from copying an ISO to Ventoy.
- **Linux `dd`:** appropriate for a distribution's USB-hybrid Linux ISO when its documentation supports raw writing. Do not assume a Windows ISO works with this method.

### Linux raw-write fallback

Identify the USB with `lsblk -o NAME,PATH,SIZE,MODEL,TRAN,TYPE,MOUNTPOINTS` and unmount its mounted partitions as described above. Substitute the exact verified filename and whole USB device:

```bash
sudo dd if='./your-distribution.iso' of=/dev/sdX bs=4M status=progress conv=fsync
sync
```

:::danger[No confirmation from dd]
This overwrites the entire selected device immediately. Use the whole USB disk, never an internal disk or a partition such as `/dev/sdb1`. Do not use wildcards in the input filename. Wait for successful completion, then safely eject. To restore multiboot afterward, back up remaining data and reinstall Ventoy.
:::

## Continue with your distribution

- [Artix KDE + OpenRC manual installation](/linux/artix-kde-openrc-install/#1-boot-the-live-iso)
- [Devuan server installation](/linux/devuan-server-install/#2-boot-the-installer-iso)
- [Debian server installation](/linux/debian-server-install/#4-boot-the-debian-installer)
- [Fedora KDE installation](/linux/fedora-kde-install/#4-boot-the-fedora-live-environment)
- [Linux overview](/linux/)
