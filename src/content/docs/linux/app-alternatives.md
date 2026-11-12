---
title: "Open Source App Alternatives"
description: >-
  Practical open source Linux alternatives to Microsoft Office, Adobe apps, Outlook, Windows utilities, and other familiar desktop software, with installation guidance and compatibility notes.
---

Moving to Linux is easier when you know which applications can handle the work you already do. Start with your everyday tasks: documents, browsing, email, photos, media, and backups.

This directory provides a broad starting list of **open source applications that run on Linux**. It includes alternatives to Windows-specific software and cross-platform proprietary products commonly used on Windows. Some familiar open source apps already work on both systems, so you can keep using them.

**Install only what you need.** Each app name links to its official project. For installation, start with [Installing Apps on Linux](/linux/installing-apps/), which covers Fedora, Artix, Debian, and Devuan.

:::tip[Try the apps before switching operating systems]
Many of these projects also provide Windows versions. Test your documents and workflows there first, then move to Linux with familiar applications.
:::

## Start with these

| Task | Recommended starting point | Why start here? |
| :--- | :--- | :--- |
| Documents, spreadsheets, presentations | LibreOffice | A complete local office suite |
| Microsoft-format collaboration | ONLYOFFICE Desktop Editors | A familiar interface for DOCX, XLSX, and PPTX workflows; test your actual files |
| Photo editing | GIMP | Retouching, layers, and image composition |
| Digital painting | Krita | Brushes, illustration, and drawing tablets |
| Web browsing | Firefox | A mainstream open source browser |
| Email and calendars | Thunderbird | A desktop client for existing accounts |
| PDF reading and annotation | Okular | A capable document viewer that fits KDE well |
| Video and music playback | VLC | A general-purpose media player |
| Passwords stored locally | KeePassXC | An encrypted local password database |
| Video editing | Kdenlive | A multitrack timeline editor |

## Office, PDFs, and publishing

| Familiar app or task | Open source alternative | Fit and limitations |
| :--- | :--- | :--- |
| Microsoft Word | [LibreOffice Writer](https://www.libreoffice.org/) | Documents, reports, mail merge, and PDF export. Check complex DOCX layouts and fonts. |
| Microsoft Excel | [LibreOffice Calc](https://www.libreoffice.org/) | Spreadsheets, charts, and formulas. Excel VBA, Power Query, and Power Pivot workflows may need substantial changes. |
| Microsoft PowerPoint | [LibreOffice Impress](https://www.libreoffice.org/) | Local presentations. Check imported transitions, embedded media, and fonts. |
| Microsoft 365 desktop editors | [ONLYOFFICE Desktop Editors](https://www.onlyoffice.com/desktop) | Local document, spreadsheet, and presentation editors. This recommendation refers to the open source desktop product; paid services and other editions have separate terms. It does not reproduce the entire Microsoft 365 service stack. |
| Microsoft Access | [LibreOffice Base](https://www.libreoffice.org/) | Database forms and connections. Existing Access applications, VBA, and database drivers need evaluation; this is not a direct conversion of an Access application. |
| Visio | [LibreOffice Draw](https://www.libreoffice.org/) | General diagrams and drawings. Check Visio imports and advanced shapes. |
| Adobe Acrobat Reader | [Okular](https://apps.kde.org/okular/) | PDF reading, annotations, and supported forms. It is not a full Acrobat Pro editor or a universal replacement for specialized PDF forms. |
| PDF page organization | [PDF Arranger](https://github.com/pdfarranger/pdfarranger) | Merge, split, rotate, crop, and reorder pages. It does not edit paragraph text or provide secure redaction. |
| Microsoft Publisher / Adobe InDesign | [Scribus](https://www.scribus.net/) | Page layout for brochures, newsletters, and print publishing. Expect to rebuild proprietary project files and check print requirements. |

### Why LibreOffice instead of Apache OpenOffice?

Both are open source. LibreOffice is the more actively developed continuation of the OpenOffice.org codebase and is the default recommendation here for a general-purpose Linux office suite. See [LibreOffice's overview](https://www.libreoffice.org/discover/libreoffice/) and [Microsoft format compatibility notes](https://help.libreoffice.org/latest/en-US/text/shared/guide/ms_import_export_limitations.html).

For files you control, OpenDocument formats such as ODT, ODS, and ODP are good native working formats. When exchanging Microsoft files, retain the original, work on a copy, and test the exported result. Use PDF when the recipient only needs to view or print a fixed layout.

## Graphics, photography, and design

| Familiar app or task | Open source alternative | Fit and limitations |
| :--- | :--- | :--- |
| Adobe Photoshop | [GIMP](https://www.gimp.org/) | Photo retouching, layers, and compositing. Photoshop plug-ins, smart objects, and complex PSD workflows may not transfer. |
| Adobe Illustrator / CorelDRAW | [Inkscape](https://inkscape.org/) | SVG illustration, logos, and vector graphics. Check proprietary format imports and print-production requirements. |
| Clip Studio Paint / Corel Painter | [Krita](https://krita.org/en/) | Digital painting, illustration, and animation tools. Check tablet support and specialized project features. |
| Adobe Lightroom | [darktable](https://www.darktable.org/) | RAW development and a photographic workflow. Lightroom catalogs and edit histories are not interchangeable. |
| Adobe Camera Raw | [RawTherapee](https://www.rawtherapee.com/) | Detailed RAW image processing. Expect different rendering and editing controls. |
| Adobe Bridge / photo library management | [digiKam](https://www.digikam.org/) | Organizing, tagging, searching, and managing photo collections. Check metadata and catalog migration before moving a library. |
| Windows Photos / image viewing | [Gwenview](https://apps.kde.org/gwenview/) | Browsing photos and making simple adjustments, especially on KDE. |
| Paint / simple raster drawing | [KolourPaint](https://apps.kde.org/kolourpaint/) | Quick drawing and basic image edits with a familiar toolset. |
| Autodesk Maya / 3ds Max | [Blender](https://www.blender.org/) | Modeling, rendering, sculpting, animation, and compositing. Proprietary plug-ins and production pipelines may require a different workflow. |

## Video, audio, and media

| Familiar app or task | Open source alternative | Fit and limitations |
| :--- | :--- | :--- |
| Adobe Premiere Pro / VEGAS | [Kdenlive](https://kdenlive.org/) | Multitrack video editing. Test codecs, hardware acceleration, effects, and export settings. |
| Clipchamp / simpler video editing | [Shotcut](https://www.shotcut.org/) | A local timeline editor without requiring a cloud editing account. It still takes time to learn. |
| Camtasia / screen recording | [OBS Studio](https://obsproject.com/) | Recording and live streaming. Use a separate editor for polished timeline editing; Wayland capture needs working portals. |
| Adobe Audition / basic audio editing | [Audacity](https://www.audacityteam.org/) | Recording, cutting, cleanup, and effects. Check plug-in formats and project compatibility. |
| Pro Tools / multitrack audio production | [Ardour](https://ardour.org/) | Recording, mixing, and MIDI workflows. Check audio interfaces and plug-ins. Official ready-to-run builds can involve payment; distro packaging may differ. |
| FL Studio / music composition | [LMMS](https://lmms.io/) | Beat and melody creation. It is a different production workflow, not an FL Studio project-file replacement. |
| Windows Media Player | [VLC](https://www.videolan.org/vlc/) | Local audio, video, and supported network streams. DRM-protected subscription services are a separate issue. |
| Minimal video playback | [mpv](https://mpv.io/) | Lightweight playback with keyboard controls and configuration. Less focused on a traditional media-library interface. |
| Video conversion utilities | [HandBrake](https://handbrake.fr/) | Transcoding supported video sources. It does not bypass copy protection. |
| iTunes / local music library | [Strawberry](https://www.strawberrymusicplayer.org/) | Managing and playing a local music collection. It does not replace Apple device management or the Apple Music subscription service. |

## Browsing, communication, and remote access

| Familiar app or task | Open source alternative | Fit and limitations |
| :--- | :--- | :--- |
| Microsoft Edge / Google Chrome | [Firefox](https://www.firefox.com/) | Everyday browsing and extensions. Review privacy settings; open source status does not mean telemetry or online services are absent. |
| Microsoft Outlook | [Thunderbird](https://www.thunderbird.net/) | Email, calendars, and contacts for supported accounts. Microsoft 365/Exchange access depends on current protocol support, authentication, and organization policy. Check with your employer before migrating a work account. |
| Discord-style community chat | [Element](https://element.io/) | A Matrix client for rooms, messaging, and calls. Contacts need Matrix accounts; it does not join Discord servers as a replacement client. |
| WhatsApp-style private messaging | [Signal](https://signal.org/) | End-to-end encrypted messaging. Desktop setup requires linking to Signal on a phone; contacts must use Signal. |
| Zoom / browser meetings | [Jitsi Meet](https://jitsi.org/jitsi-meet/) | Open source browser-based meetings through a suitable server. The chosen hosting service sets its own account and usage requirements. |
| Windows Remote Desktop client | [Remmina](https://remmina.org/) | Connect to supported RDP, VNC, and SSH targets. It is a client; the target needs a compatible server and permissions. |

For privacy-focused configuration and service choices, also see [Privacy App Recommendations](/privacy/app-recommendations/).

## Notes, reading, research, and finances

| Familiar app or task | Open source alternative | Fit and limitations |
| :--- | :--- | :--- |
| OneNote / Evernote | [Joplin](https://joplinapp.org/) | Notes, attachments, and optional synchronization. OneNote notebooks may need export or conversion; test formatting. Hosted Joplin Cloud is optional and paid. |
| Notion / linked personal notes | [Logseq](https://logseq.com/) | Outlines and linked knowledge management. Check the current graph/storage model before committing your library; it does not replicate every Notion database or team feature. |
| EndNote / Mendeley | [Zotero](https://www.zotero.org/) | References, citations, PDFs, and research organization. Test your citation style and word-processor integration. Extra hosted attachment storage is optional and paid. |
| Kindle desktop / ebook organization | [Calibre](https://calibre-ebook.com/) | Ebook libraries, reading, and supported format conversion. DRM restrictions and vendor account services are separate. |
| Microsoft To Do / local task lists | [Planify](https://github.com/alainm23/planify) | Task and project organization with supported Todoist, Nextcloud, and CalDAV integrations. It does not directly replace Microsoft To Do's account integration. |
| Quicken / personal accounting | [GnuCash](https://www.gnucash.org/) | Double-entry personal and small-business accounting. Bank imports and online connections vary by institution and region. |

## Passwords, files, synchronization, and backups

| Familiar app or task | Open source alternative | Fit and limitations |
| :--- | :--- | :--- |
| 1Password / LastPass, for local storage | [KeePassXC](https://keepassxc.org/) | An encrypted local database. You choose how to back up and synchronize it; use a suitable process for concurrent edits. |
| Cloud password manager | [Bitwarden clients](https://bitwarden.com/open-source/) | Open source clients with hosted or self-hosted options. Free and paid features differ; review server licensing separately for the edition you deploy. |
| File Explorer | [Dolphin](https://apps.kde.org/dolphin/) | KDE's file manager with tabs, split view, and network locations. Usually already present on KDE. |
| WinRAR / WinZip | [Ark](https://apps.kde.org/ark/) | Graphical archive creation and extraction. Format support depends on installed backends; creating RAR archives is a separate limitation. |
| OneDrive / Dropbox folder synchronization | [Syncthing](https://syncthing.net/) | Device-to-device folder synchronization. It does not supply hosted storage or edit Office documents collaboratively. Deletions can synchronize too. |
| OneDrive / Dropbox hosted file service | [Nextcloud desktop client](https://nextcloud.com/clients/) | Synchronizes with a Nextcloud server that you host or obtain from a provider. Installing the client alone does not create a server or storage account. |
| Acronis / file backup workflows | [Kopia](https://kopia.io/) | Encrypted, deduplicated snapshot backups with GUI and CLI options. Configure a repository and retention, and test restores. It is not a universal bare-metal imaging replacement. |
| System Restore-style snapshots | [Timeshift](https://github.com/linuxmint/timeshift) | System snapshots on supported layouts. A snapshot on the same disk is not an independent backup, and personal files are normally outside its default focus. |
| WinSCP / SFTP transfers | [FileZilla Client](https://filezilla-project.org/) | A graphical transfer client with SFTP support. Prefer SFTP over unencrypted FTP. |
| Windows disk imaging tools | [Rescuezilla](https://rescuezilla.com/) | Disk imaging and recovery from a bootable environment. This is a separate live USB workflow, not an app to casually install and run while modifying the active system disk. |

**Synchronization, snapshots, file backups, and disk images solve different problems.** For a complete strategy, see [Backup & Recovery](/homelab/backup-and-recovery/).

## Development, engineering, and gaming tools

| Familiar app or task | Open source alternative | Fit and limitations |
| :--- | :--- | :--- |
| Microsoft VS Code binary | [VSCodium](https://vscodium.com/) | Community builds of the open source editor code. Marketplace access and Microsoft-specific extensions can differ. |
| Notepad / Notepad++ | [Kate](https://kate-editor.org/) | A capable graphical text and code editor that fits KDE. |
| AutoCAD / parametric 3D design | [FreeCAD](https://www.freecad.org/) | Parametric modeling and technical design. It is not a direct replacement for every AutoCAD workflow; validate file exchange and drawings. |
| AutoCAD LT / 2D drafting | [LibreCAD](https://librecad.org/) | 2D CAD centered on DXF workflows. Do not assume full DWG compatibility. |
| Altium / PCB design | [KiCad](https://www.kicad.org/) | Schematic capture and PCB layout. Test library and project migration. |
| Proprietary game-library frontends | [Lutris](https://lutris.net/) | An open source game manager that can integrate Wine and launchers. Games and stores retain their own licenses and requirements. |
| Epic / GOG / Amazon game-library frontend | [Heroic Games Launcher](https://heroicgameslauncher.com/) | An open source launcher for supported store libraries. Compatibility depends on each game, DRM, and anti-cheat. |

Steam itself is proprietary. Wine and Proton are compatibility tools, and installing them does not guarantee that a Windows application or game will run. Check current compatibility for essential games, especially multiplayer anti-cheat requirements.

## How to install the apps in this directory

### Native packages: search by app name

Use your distribution's search command before installing. Package names can differ: Debian may offer `firefox-esr`, Artix office packages may be named `libreoffice-fresh` or `libreoffice-still`, and some apps require an additional supported repository or a developer-provided build.

| Distribution | Example search | Example GIMP installation |
| :--- | :--- | :--- |
| Fedora | `dnf search gimp` | `sudo dnf install gimp` |
| Artix | `pacman -Ss gimp` | `sudo pacman -Syu gimp` |
| Debian / Devuan | `apt search gimp` | `sudo apt update`, then `sudo apt install gimp` |

These are examples, not a promise that every app in the directory exists in every distribution's default repositories. Use the app's official Linux installation page if your package search is unsuccessful.

### Flatpak starter commands

Complete the [per-user Flatpak setup](/linux/installing-apps/#flatpak-one-approach-across-distributions) first. Then run **only the lines for apps you want**:

```bash
# Office suite
flatpak install --user flathub org.libreoffice.LibreOffice

# Photo editing, vector graphics, and painting
flatpak install --user flathub org.gimp.GIMP
flatpak install --user flathub org.inkscape.Inkscape
flatpak install --user flathub org.kde.krita

# Video editing and recording
flatpak install --user flathub org.kde.kdenlive
flatpak install --user flathub com.obsproject.Studio

# Browser, email, PDF reader, and media player
flatpak install --user flathub org.mozilla.firefox
flatpak install --user flathub org.mozilla.thunderbird
flatpak install --user flathub org.kde.okular
flatpak install --user flathub org.videolan.VLC

# Local password database
flatpak install --user flathub org.keepassxc.KeePassXC
```

These are common desktop choices, not a requirement to install Flatpak versions of everything. Native packaging can provide better integration for password-manager browser connections, development tools, hardware access, and system utilities. Review the packaging notes before choosing a source.

The Thunderbird command selects the regular release using its current, lowercase app ID. Thunderbird ESR uses `org.mozilla.thunderbird_esr`; see the [official channel guidance](https://support.mozilla.org/en-US/kb/channel-choices-thunderbird-snap-and-flatpak) before choosing a release channel.

Browse each [Flathub app listing](https://flathub.org/) to check its publisher, verification status, license, architecture support, and permissions. A community-maintained package is not necessarily maintained by the application's developers.

## Before you replace an essential Windows app

1. **List the work you actually do.** Include required file formats, plug-ins, macros, hardware, collaboration, and employer requirements.
2. **Back up and test copies.** Open, edit, export, print, and reopen representative files, including complex examples.
3. **Check the complete workflow.** An Outlook alternative does not replace Exchange administration; an Office editor does not recreate SharePoint or Teams.
4. **Migrate one category at a time.** Keep your original files and a working way to use an essential Windows application until the replacement meets your needs.
5. **Plan updates and recovery.** Keep apps updated, back up settings and data, and test restores.

Open source software gives you more control over the tools you use. Choosing a good replacement still means matching it to your actual work.

## Related guides

- [Installing Apps on Linux](/linux/installing-apps/)
- [Linux Overview](/linux/)
- [Linux Post-Install Baseline](/linux/post-install-baseline/)
- [Privacy App Recommendations](/privacy/app-recommendations/)
- [Backup & Recovery](/homelab/backup-and-recovery/)
