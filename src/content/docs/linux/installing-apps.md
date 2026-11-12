---
title: "Installing Apps on Linux"
description: >-
  Install, update, and remove desktop apps on Fedora, Artix, Debian, and Devuan using native packages, graphical software managers, Flatpak, and AppImages.
---

You do not need to search the web for a Windows-style installer every time you want an app. Linux distributions provide **repositories**: collections of software that your package manager downloads, verifies, installs, and updates for you.

Start with your distribution's repositories. Use Flatpak when an app is unavailable there, when you need a newer desktop release, or when the developer recommends it.

Looking for replacements for Windows software? See [Open Source App Alternatives](/linux/app-alternatives/).

:::note[Desktop applications]
These instructions assume an installed graphical desktop and a user with administrative access through `sudo`. The Debian and Devuan server guides do not install a desktop by default. You can manage packages on a server, but graphical apps need a desktop session to display their windows.
:::

## Choose an installation method

| Method | Good starting point for | Who supplies updates? |
| :--- | :--- | :--- |
| Distribution packages | Desktop integration, command-line tools, drivers, and system utilities | Your distribution's package manager |
| Flatpak through Flathub | Desktop apps available across several distributions | Flatpak or a software manager with Flatpak support |
| AppImage from the developer | A portable release when the developer provides one | Depends on the app; often you replace the file yourself |
| Developer repository or download | Apps whose official installation method requires it | The developer repository, app updater, or manual replacement |

A Flatpak is not automatically open source: Flathub distributes both open source and proprietary software. Check the app's license, publisher, permissions, and support information.

## Fedora: DNF

This section applies to conventional Fedora installations, including Fedora KDE Plasma Desktop and Workstation. Fedora Atomic desktops such as Kinoite and Silverblue use a different system-management model; use their documentation for operating-system packages and prefer Flatpak for desktop apps.

### Search and inspect

```bash
dnf search gimp
dnf info gimp
```

### Update and install

```bash
sudo dnf upgrade --refresh
sudo dnf install gimp
```

Read the transaction summary before accepting. Launch GIMP from the application menu after installation.

### Remove an app

```bash
sudo dnf remove gimp
```

Review the removal list. Removing an app normally leaves personal documents and user configuration in your home directory.

### Graphical option

On Fedora KDE, open **Discover**. On GNOME, open **Software**. Search for an app, inspect its source, and select Install. If several versions are offered, check whether you are selecting a Fedora package or a Flatpak.

Repositories and software-manager backends vary by installation. A missing search result in Discover does not necessarily mean the app is unavailable through DNF.

## Artix: pacman

Artix is a rolling-release distribution. **Update the whole system when installing software** so packages and their dependencies remain consistent.

### Search and inspect

```bash
pacman -Ss gimp
pacman -Si gimp
```

### Update and install

```bash
sudo pacman -Syu gimp
```

For later updates:

```bash
sudo pacman -Syu
```

:::caution[Avoid partial upgrades]
Do not use `pacman -Sy` followed by installing individual packages without a full system upgrade. Read Artix upgrade notices if a transaction requires manual intervention.
:::

### Remove an app

```bash
sudo pacman -R gimp
```

This removes the app while leaving installed dependencies. `pacman -Rns` also removes eligible dependencies and package backup files; inspect its removal list before using it.

### Repository availability and the AUR

Search your configured repositories first. Artix repositories and Arch repositories are different; an Arch package listing does not guarantee availability or compatibility on Artix. If an app is missing, consider Flatpak or follow the current [Artix repository documentation](https://wiki.artixlinux.org/Main/Repositories).

The **Arch User Repository (AUR)** contains community build recipes, not official Artix binary packages. Review the `PKGBUILD`, sources, dependencies, and maintenance status before building. An AUR helper does not make a package officially supported. AUR use is optional and unnecessary for following the Flatpak examples below.

Artix does not use systemd. If an application's setup requires a background service, use an Artix-compatible package and the instructions for your selected init system. Do not copy `systemctl` commands into an OpenRC installation.

### Graphical option

On KDE, Discover can manage Flatpaks when its Flatpak backend is available. Do not assume it can manage pacman packages on every Artix installation. The pacman commands above are the baseline for native packages.

## Debian and Devuan: APT

Debian and Devuan both use APT. **Keep the repositories appropriate to your distribution and release.** Devuan users should use Devuan's repository configuration; do not add Debian repositories merely because an app is missing.

### Refresh, search, and inspect

```bash
sudo apt update
apt search gimp
apt show gimp
```

`apt update` refreshes the available package list; it does not install updates.

### Update installed packages and install an app

```bash
sudo apt upgrade
sudo apt install gimp
```

Stable distributions may ship older app releases with distribution-maintained fixes. A lower version number alone does not mean a package is unsupported. Consider Flatpak if you specifically need a newer desktop feature.

### Remove an app

```bash
sudo apt remove gimp
```

`apt purge` additionally removes package-managed system configuration. It does not generally erase configuration in your home directory. Review any proposed dependency removals before using `apt autoremove`.

### Graphical option

**Synaptic** provides a graphical interface for native APT packages:

```bash
sudo apt install synaptic
```

Launch Synaptic from the application menu. KDE Discover and GNOME Software are other options where the appropriate package and Flatpak backends are installed. Available software centers depend on the desktop you selected.

## Flatpak: one approach across distributions

[Flatpak](https://flatpak.org/) packages desktop apps separately from much of the operating system. [Flathub](https://flathub.org/) is an app repository for Flatpak.

The examples here consistently use **per-user installation**. Run the Flatpak commands as your regular desktop user, without `sudo`. Apps and the Flathub remote will belong to that user.

### 1. Install Flatpak

Run only the command for your distribution.

**Fedora:**

```bash
sudo dnf install flatpak
```

**Artix:**

```bash
sudo pacman -Syu flatpak
```

**Debian / Devuan:**

```bash
sudo apt update
sudo apt install flatpak
```

### 2. Add Flathub for your user

```bash
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak remotes
```

Check the remote's installation scope. An existing system-wide Flathub remote and a per-user remote can coexist; the commands below explicitly select the per-user installation.

Log out of your desktop and log back in after initial setup so menus and session environment changes take effect.

### 3. Search and install

```bash
flatpak search gimp
flatpak install --user flathub org.gimp.GIMP
```

Read the requested permissions and download size. Flatpak may also download shared runtimes, so the first install can be larger than expected.

### 4. Launch and update

Launch the app through your application menu, or run:

```bash
flatpak run org.gimp.GIMP
```

Update your per-user Flatpak apps and runtimes:

```bash
flatpak update --user
```

**DNF, pacman, and APT updates do not update your Flatpak apps.** Keep both installation methods updated. A configured software center may handle both, but check the sources it manages.

### 5. List and remove

```bash
flatpak list --user --app
flatpak uninstall --user org.gimp.GIMP
```

Optional cleanup of unused runtimes:

```bash
flatpak uninstall --user --unused
```

Normal uninstallation preserves app data. Do not add `--delete-data` unless you intend to remove the app's saved data as well.

### Permissions and desktop integration

Flatpak sandboxing limits access according to each app's permissions. It does not guarantee that every app is isolated from all personal files or network access.

- For an inaccessible folder, first try opening the file through the app's file picker.
- For a NAS folder, check that the share is mounted and accessible to your desktop user.
- For Wayland screen capture, the app needs a working desktop portal and an appropriate backend for your desktop.
- KDE usually uses `xdg-desktop-portal-kde`; other desktops may use a different backend. On Artix and Devuan, follow the distribution's session and D-Bus setup rather than systemd service instructions.
- [Flatseal](https://github.com/tchx84/Flatseal) provides a graphical permissions editor. Grant only the folders or capabilities needed instead of unrestricted filesystem access.

## AppImages and developer downloads

An AppImage is usually a downloaded application file. Use the developer's official download page and choose the correct architecture, such as x86_64 for most Intel/AMD PCs or aarch64 for supported ARM systems.

For an AppImage saved in Downloads, inspect the actual filename, make that file executable, then open it. This example filename is a placeholder:

```bash
chmod +x ~/Downloads/Example.AppImage
~/Downloads/Example.AppImage
```

Replace `Example.AppImage` with your downloaded filename. Do not run desktop apps with `sudo`. AppImages are not automatically sandboxed, may depend on host libraries or FUSE compatibility, and do not necessarily integrate with your normal updates. Follow the application's own instructions if it fails to start.

For a trusted local package supplied by a developer:

| Distribution | Example command; replace the filename |
| :--- | :--- |
| Fedora | `sudo dnf install ./example.rpm` |
| Debian / Devuan | `sudo apt install ./example.deb` |

Run these from the directory containing the file. A `.deb` or `.rpm` is not automatically compatible with every distribution using that format. Confirm the supported release and architecture. Installing one downloaded file does not necessarily configure future updates.

Avoid adding unrelated repositories or running an unfamiliar downloaded script as root just to install a desktop app.

## Troubleshooting

| Problem | What to check |
| :--- | :--- |
| Package not found | Search first; the package name may differ from the app name. Check your release and enabled repositories. Use Flatpak if supported. |
| Same app appears twice | You may have installed a native package and a Flatpak. Check the software source before removing either copy; their settings may be separate. |
| Flatpak says no matching remote | Confirm the per-user Flathub remote exists with `flatpak remotes`; keep `--user` consistent. |
| App missing from the menu | Log out and back in after Flatpak setup, or try `flatpak run` with the app ID. |
| Screen sharing is unavailable | Check Wayland support, the portal backend, and the app's permissions. |
| Video will not play | Codec availability differs between distro and Flatpak builds. Check the app's documentation and Fedora's multimedia guidance where relevant. |
| Old Windows app will not open | An `.exe` is not a native Linux package. Look for a Linux version or an alternative first. Wine compatibility varies by application. |

## Next steps and references

- [Open Source App Alternatives](/linux/app-alternatives/)
- [Linux Post-Install Baseline](/linux/post-install-baseline/)
- [Fedora DNF documentation](https://docs.fedoraproject.org/en-US/quick-docs/dnf/)
- [Artix documentation](https://wiki.artixlinux.org/)
- [pacman manual](https://man.archlinux.org/man/pacman.8.en)
- [Debian package installation](https://wiki.debian.org/HowToInstallPackages)
- [Devuan documentation](https://www.devuan.org/os/documentation/)
- [Flatpak commands and installation scopes](https://docs.flatpak.org/en/latest/using-flatpak.html)
- [Flathub setup](https://flathub.org/en/setup)
