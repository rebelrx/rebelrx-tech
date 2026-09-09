---
title: "🗂️ Mounting NAS Storage on Linux"
description: >-
  Mount NAS storage on a Linux server safely: understand NFS vs SMB, test shares before making them permanent, configure `/etc/fstab`, verify boot behavior, and keep network storage failures from breaking Docker applications.
---
A **NAS (Network Attached Storage)** is a computer or appliance whose main job is to provide storage to other devices over the network. Instead of every server keeping all of its files on local disks, a NAS can provide shared media, backups, documents, datasets, or application storage from one central system.

NAS describes the job, not the physical shape. Common forms include:

- **Desktop NAS** — a small tower or multi-bay appliance designed to sit on a desk or shelf.
- **Rack-mounted NAS** — a rack chassis designed for a server rack, usually with more drive bays, networking, and expansion options.
- **DIY NAS** — a standard PC or server running storage-focused software such as TrueNAS, Unraid, or a general Linux/BSD system.
- **NASbook / all-flash NAS** — a compact, high-speed system using SSDs or NVMe rather than large hard drives.

Once the NAS is sharing a folder, your Linux server still needs to **mount** that share. Mounting makes a remote folder appear at a normal local path so applications and Docker containers can use it.

:::tip[ELI5]
A NAS is a shared hard drive box on your network. Mounting is the step that makes one of its shared folders show up on your Linux server as if it were a local folder.
:::

## 🧩 Terms You Should Know First

:::tip[ELI5]
This section explains terms you should know first in practical terms and what it changes in the homelab.
:::

- **Share / export** — a folder the NAS makes available over the network.
- **Mount point** — the local directory where that remote share appears.
- **NFS** — a network file-sharing protocol commonly used between Linux/Unix systems.
- **SMB** — the file-sharing protocol commonly associated with Windows and widely supported by NAS appliances.
- **`/etc/fstab`** — the Linux configuration file used to define filesystems that should mount automatically.
- **UID/GID** — numeric Linux user/group identities that often determine whether a container can read or write mounted files.

## 🪜 What You Will Do

:::tip[ELI5]
This section explains what you will do in practical terms and what it changes in the homelab.
:::

1. Create or verify a share on the NAS.
2. Choose NFS or SMB.
3. Install the matching Linux client tools.
4. Test the mount manually first.
5. Verify read and write access.
6. Add a permanent `/etc/fstab` entry.
7. Reboot and confirm it returns correctly.
8. Only then pass the mounted path into Docker.

---

## ✅ What You Need to Know First

:::tip[ELI5]
This section explains what you need to know first in practical terms and what it changes in the homelab.
:::

Reliable storage should be predictable: the same share should mount at the same place, with the same permissions, after every reboot.

---

## 🧭 1. Choose NFS or SMB

:::tip[ELI5]
NFS is a common Linux-to-Linux network file-sharing protocol; this section shows where it fits and how to use it safely.
:::

Both work. Pick based on what's talking to what:

| | NFS | SMB / CIFS |
| :--- | :--- | :--- |
| Best for | Linux ↔ Linux / NAS | Mixed networks (Windows, printers, scanners) |
| Performance | Workload and implementation dependent | Workload and implementation dependent |
| Permissions | Unix UID/GID, native | Mapped at mount time |
| Auth model | Often AUTH_SYS + export restrictions; Kerberos is also supported | Username + password |
| Verdict | **Default choice for a Linux homelab** | Use when NFS isn't available or Windows shares the data |

This guide covers both, but NFS as the primary path.

---

## 🖥️ 2. Prepare the Share on the NAS

:::tip[ELI5]
This section covers shared network storage and what must be checked before applications depend on it.
:::

On the NAS (e.g., QNAP, Synology, TrueNAS) the UI may differ, but the concepts don't:

1. Create or pick the shared folder (e.g., `media`, `backups`)
2. Enable the **NFS service** and add an NFS rule for the share:
    - Allowed client → your server's IP (or Tailscale IP if mounting over the tailnet)
    - Access → read/write
    - Squash → retain root squashing; align the application's UID/GID or use a narrowly scoped mapping. Avoid granting remote root write access
3. For SMB → create a dedicated low-privilege NAS user for the server; never mount with the NAS admin account

:::tip[One share per purpose]
Separate shares for `media`, `backups`, and `archive` mean separate
permissions, separate NFS rules, and the ability to unmount one without
disturbing the others. Resist the single giant `share-of-everything`.
:::
---

## 📦 3. Install the Linux Client Packages (Debian)

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

```bash
# NFS
sudo apt update
sudo apt install -y nfs-common

# SMB (only if you're using it)
sudo apt install -y cifs-utils
```

---

## 🧪 4. Test the Mount Manually First

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

Don't go straight to `fstab`. Prove the mount works interactively:

```bash
# NFSv3-style export discovery; NFSv4-only servers may not support showmount
showmount -e NAS-IP

# Create the mount point and test
sudo mkdir -p /mnt/nas/media
sudo mount -t nfs -o vers=4.1 NAS-IP:/media /mnt/nas/media

# Verify: list it, write to it, read it back
ls /mnt/nas/media
touch /mnt/nas/media/.write-test && rm /mnt/nas/media/.write-test
```

If the write test fails, fix permissions **now** (see Troubleshooting) — a broken mount in `fstab` is much less fun to debug at boot time.

Unmount before making it permanent:

```bash
sudo umount /mnt/nas/media
```

---

## 📌 5. Make the Mount Persistent with `/etc/fstab`

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

### NFS

```bash
sudo nano /etc/fstab
```

Add one line per share:

```text
NAS-IP:/media    /mnt/nas/media    nfs    rw,hard,vers=4.1,_netdev,nofail    0    0
NAS-IP:/backups  /mnt/nas/backups  nfs    rw,hard,vers=4.1,_netdev,nofail    0    0
```

What each option buys you:

- `hard` → if the NAS drops, I/O **waits** for it to return instead of silently returning errors and corrupting writes. Correct for data you care about.
- `vers=4.1` → pin the protocol version; no negotiation surprises after NAS firmware updates
- `_netdev` → marks the filesystem as network-dependent so the init system handles it as a network mount
- `nofail` → a failed mount is not treated as a required filesystem; this is not a guarantee of bounded mount time, especially across different init scripts

Apply and verify:

```bash
sudo mount -a
df -h | grep nas
```

### SMB

Credentials never go in `fstab` (it's world-readable). Use a credentials file:

```bash
sudo nano /root/.smb-credentials
```

```text
username=serversvc
password=your-strong-password
```

```bash
sudo chmod 600 /root/.smb-credentials
```

Then in `/etc/fstab`:

```text
//NAS-IP/media  /mnt/nas/media  cifs  credentials=/root/.smb-credentials,uid=1000,gid=1000,vers=3.0,_netdev,nofail  0  0
```

The `uid=1000,gid=1000` maps every file to your user — set it to match the `PUID`/`PGID` your [Docker stacks](/homelab/docker-home-lab/) run as.

---

## 🔁 6. Verify Boot Behavior

:::tip[ELI5]
A manual mount proves the share works now. This step proves the server can come back from a reboot without hanging or starting NAS-dependent applications against an empty local directory.
:::

On Debian 13, `/etc/fstab` network mounts are managed by systemd. After editing `fstab`, reload systemd's generated mount units and test the entry before rebooting:

```bash
sudo systemctl daemon-reload
sudo mount -a
findmnt -t nfs,nfs4,cifs
```

Then reboot once while the NAS is online and confirm the share returns:

```bash
sudo reboot
```

After reconnecting:

```bash
findmnt /path/to/mount
```

If you use `nofail`, also test what happens when the NAS is unavailable. `nofail` allows the host to continue booting; it does **not** guarantee that Docker services will wait for the share to appear later.

For especially important mounts, systemd automounting can make boot behavior more forgiving:

```text
x-systemd.automount,_netdev,nofail
```

Use it deliberately and test the application behavior. An automount can improve availability, but it does not make a remote filesystem appropriate for every database or workload.

:::note[Non-systemd Linux]
The same NFS/SMB and `fstab` concepts apply on sysvinit/OpenRC systems, but boot ordering is init-specific. Use that distribution's network-mount/service mechanism rather than copying systemd dependency directives verbatim.
:::

## 🐳 7. Pass the Mounted Storage to Docker

:::tip[ELI5]
This section explains how the Docker part of the setup should be configured or operated.
:::

This is the failure mode that bites everyone once:

**If Docker starts before the NAS mount lands, containers bind-mount an empty directory** — and some apps happily initialize a fresh, empty library into it. Jellyfin scanning an empty media folder deletes its metadata; a backup job seeing an empty source "succeeds" at backing up nothing.

Defenses, in order of value:

**1. Verify the mount before starting the dependent stack.** On Debian/systemd, `_netdev` marks the filesystem as network-dependent, but `nofail` can still allow the host and Docker to continue when the NAS is absent. Treat the mount as an explicit dependency for any stack that would behave badly against an empty directory.

**2. Make startup fail closed for dependent stacks.** A delay script that eventually exits successfully does not guard anything. Keep unrelated local-only services running, but start a NAS-dependent stack only after checking the expected mounted filesystem:

```bash
mountpoint -q /mnt/nas/media || { echo "Required NAS mount missing"; exit 1; }
findmnt -rn -M /mnt/nas/media -t nfs,nfs4 >/dev/null ||
  { echo "Expected NFS filesystem missing"; exit 1; }
test -f /mnt/nas/media/.nas-mounted ||
  { echo "Expected share marker missing"; exit 1; }
cd /opt/docker/stacks/example || exit 1
docker compose up -d
```

Create the marker on the verified remote share first. Check the expected export/source as well when different shares could use the same mount point.

**3. Account for automatic container restarts.** A wrapper around `docker compose up` cannot guard a container that Docker restarts on its own. For a stack that must never start without the NAS, manage that stack with a systemd unit that depends on the required mount, or use another tested mount-aware startup mechanism. Do not assume `restart: unless-stopped` understands remote-storage dependencies.

A marker-file read can itself block on an unavailable hard mount. It is an identity check, not a bounded health probe.

A marker file is a simple identity check that helps distinguish the intended mounted share from an empty local mount-point directory.

---

## 🚫 What Not To Do

:::tip[ELI5]
The Arr stack (Sonarr, Radarr, Prowlarr…), Jellyfin, and many homelab apps use **SQLite**, which depends on file locking that network filesystems implement unreliably.
:::

:::danger[Never run SQLite databases over NFS or SMB]
The Arr stack (Sonarr, Radarr, Prowlarr…), Jellyfin, and many homelab
apps use **SQLite**, which depends on file locking that network
filesystems implement unreliably. Network locking and failure semantics can cause corruption or unsupported behavior. Follow the application's storage requirements.

The rule from the [Docker guide](/homelab/docker-home-lab/) already handles this:

- App data and databases → `/opt/docker/data/<stack>` on **local disk**
- Bulk media, documents, backups → NAS mount
:::
- Don't mount with the NAS admin account — dedicated low-privilege user, per share
- Use `hard` as the default for both read and write mounts. `soft` is an exceptional, application-tested availability tradeoff, not a safe default for backups. See [nfs(5)](https://man7.org/linux/man-pages/man5/nfs.5.html).
- Don't put credentials in `fstab` — credentials file, `chmod 600`
- Don't skip the interactive test mount — fstab is where you *record* a working mount, not where you *discover* a broken one

---

## 🧰 8. Troubleshooting

:::tip[ELI5]
Work through these checks in order so you isolate the failing layer instead of changing several things at once.
:::

- **`access denied by server`** → the NFS rule on the NAS doesn't include your server's IP, or the export path is wrong. Re-check with `showmount -e <nas-ip>`.
- **Files owned by `nobody:nogroup`** → NFSv4 ID mapping mismatch. Simplest fix on a home LAN: make the UID/GID on the NAS share match your server user (1000:1000), or set the share's squash option to map all access to that UID.
- **`Stale file handle`** → the export changed on the NAS side while mounted. `sudo umount -l /mnt/nas/media && sudo mount -a`.
- **Commands hang forever on the mount point** → the NAS is down and the mount is `hard` (working as designed — data safety over responsiveness). Bring the NAS back, or `sudo umount -f -l` to force-release.
- **Slow SMB transfers** → confirm `vers=3.0` or higher in the mount options; SMB1 negotiation still lurks in old NAS defaults and is both slow and insecure.

---

## ✅ What to Remember

:::tip[ELI5]
This is the short version to keep in mind after you finish the page.
:::

Test the share manually, make it persistent, verify a reboot, and then test the failure case with the NAS unavailable. Only after those checks should an application depend on the mount.
