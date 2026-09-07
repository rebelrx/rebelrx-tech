---
title: "🗂️ Mounting NAS Storage (Devuan)"
description: >-
  Mount NAS storage on a Devuan server the right way — NFS vs SMB, fstab entries that survive reboots without systemd, Docker ordering gotchas, and the SQLite-over-NFS mistake that corrupts homelab databases.
---
Your NAS holds the bulk storage; your server runs the services. This guide connects them **reliably**: mounts that survive reboots, behave under sysvinit, and don't silently feed empty directories to your Docker containers.

---

## ⚠️ Core Principle

> Storage should be boring. A mount you have to think about is a mount that will fail you.

---

## 🧭 NFS or SMB?

Both work. Pick based on what's talking to what:

| | NFS | SMB / CIFS |
| :--- | :--- | :--- |
| Best for | Linux ↔ Linux / NAS | Mixed networks (Windows, printers, scanners) |
| Performance | Faster, lower overhead | Slightly heavier |
| Permissions | Unix UID/GID, native | Mapped at mount time |
| Auth model | Host/IP-based (v3/v4) | Username + password |
| Verdict | **Default choice for a Linux homelab** | Use when NFS isn't available or Windows shares the data |

This guide covers both — NFS as the primary path.

---

## 🖥️ NAS-Side Prep

On the NAS (QNAP, Synology, TrueNAS — the UI differs, the concepts don't):

1. Create or pick the shared folder (e.g., `media`, `backups`)
2. Enable the **NFS service** and add an NFS rule for the share:
    - Allowed client → your server's IP (or Tailscale IP if mounting over the tailnet)
    - Access → read/write
    - Squash → *no root squash* only if Docker containers must write as root; otherwise map to a specific UID/GID
3. For SMB → create a dedicated low-privilege NAS user for the server; never mount with the NAS admin account

:::tip[One share per purpose]
Separate shares for `media`, `backups`, and `archive` mean separate
permissions, separate NFS rules, and the ability to unmount one without
disturbing the others. Resist the single giant `share-of-everything`.
:::
---

## 📦 Install Client Packages (Devuan)

```bash
# NFS
sudo apt update
sudo apt install -y nfs-common

# SMB (only if you're using it)
sudo apt install -y cifs-utils
```

---

## 🧪 Test Mount First (Always)

Never go straight to `fstab`. Prove the mount works interactively:

```bash
# See what the NAS exports
showmount -e 192.168.1.xx

# Create the mount point and test
sudo mkdir -p /mnt/nas/media
sudo mount -t nfs -o vers=4.1 192.168.1.xx:/media /mnt/nas/media

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

## 📌 Permanent Mounts via /etc/fstab

### NFS

```bash
sudo nano /etc/fstab
```

Add one line per share:

```text
192.168.1.xx:/media    /mnt/nas/media    nfs    rw,hard,vers=4.1,_netdev,nofail    0    0
192.168.1.xx:/backups  /mnt/nas/backups  nfs    rw,hard,vers=4.1,_netdev,nofail    0    0
```

What each option buys you:

- `hard` → if the NAS drops, I/O **waits** for it to return instead of silently returning errors and corrupting writes. Correct for data you care about.
- `vers=4.1` → pin the protocol version; no negotiation surprises after NAS firmware updates
- `_netdev` → tells the init scripts this needs networking first — **essential on sysvinit**
- `nofail` → a powered-off NAS won't hang the server's entire boot

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
//192.168.1.xx/media  /mnt/nas/media  cifs  credentials=/root/.smb-credentials,uid=1000,gid=1000,vers=3.0,_netdev,nofail  0  0
```

The `uid=1000,gid=1000` maps every file to your user — set it to match the `PUID`/`PGID` your [Docker stacks](/homelab/docker-home-lab/) run as.

---

## 🔁 Boot Behavior Without systemd

On Devuan, the sysvinit boot sequence handles this correctly **because of `_netdev`**: the `mountnfs` stage runs after networking is up and mounts everything fstab marks as network-dependent. No units, no automount configs — the 30-year-old mechanism just works.

Verify after your next reboot:

```bash
df -h | grep nas
```

:::tip[On-demand mounting with autofs (optional)]
If the NAS is sometimes off, `autofs` mounts shares only when accessed
and releases them after idle — no boot dependency at all:

```
sudo apt install -y autofs
```

Then map your shares in `/etc/auto.master.d/`. For an always-on NAS,
plain fstab is simpler and better; reach for autofs only when the NAS
is genuinely intermittent.
:::
---

## 🐳 The Docker Gotcha

This is the failure mode that bites everyone once:

**If Docker starts before the NAS mount lands, containers bind-mount an empty directory** — and some apps happily initialize a fresh, empty library into it. Jellyfin scanning an empty media folder deletes its metadata; a backup job seeing an empty source "succeeds" at backing up nothing.

Defenses, in order of value:

**1. Let the boot order do its job.** On sysvinit, `mountnfs` runs before the Docker init script — with `_netdev` set, an *online* NAS is mounted before containers start. The risk is the NAS being slow or offline (which `nofail` deliberately allows).

**2. Guard the stacks that depend on the mount.** Add a check to the Docker init sequence — create `/etc/init.d/wait-for-nas`:

```bash
#!/bin/sh
### BEGIN INIT INFO
# Provides:          wait-for-nas
# Required-Start:    $network $remote_fs
# Required-Stop:
# Default-Start:     2 3 4 5
# Default-Stop:
# X-Start-Before:    docker
# Short-Description: Delay boot until NAS shares are mounted
### END INIT INFO

case "$1" in
  start)
    for i in $(seq 1 30); do
      mountpoint -q /mnt/nas/media && exit 0
      sleep 2
    done
    echo "wait-for-nas: NAS not mounted after 60s, continuing anyway"
    ;;
  *) ;;
esac
exit 0
```

```bash
sudo chmod +x /etc/init.d/wait-for-nas
sudo update-rc.d wait-for-nas defaults
```

**3. Make the emptiness detectable.** Place a marker file on the NAS share (`touch /mnt/nas/media/.nas-mounted` while it's mounted). Any script — backups especially — can then refuse to run against an unmounted path:

```bash
[ -f /mnt/nas/media/.nas-mounted ] || { echo "NAS not mounted, aborting"; exit 1; }
```

> The marker-file trick costs nothing and has saved more homelab data than any other three lines in this guide.

---

## 🚫 What Not To Do

:::danger[Never run SQLite databases over NFS or SMB]
The Arr stack (Sonarr, Radarr, Prowlarr…), Jellyfin, and many homelab
apps use **SQLite**, which depends on file locking that network
filesystems implement unreliably. Databases on NAS mounts corrupt —
not *if*, *when*.

The rule from the [Docker guide](/homelab/docker-home-lab/) already handles this:

- App data and databases → `/opt/data/<stack>` on **local disk**
- Bulk media, documents, backups → NAS mount
:::
- Don't mount with the NAS admin account — dedicated low-privilege user, per share
- Don't use `soft` mounts for anything that writes — silent partial writes are how files corrupt. (The [Devuan server guide](/linux/devuan-server-install/) deliberately uses `soft` for read-mostly shares to keep a headless box responsive — that's the other side of this tradeoff)
- Don't put credentials in `fstab` — credentials file, `chmod 600`
- Don't skip the interactive test mount — fstab is where you *record* a working mount, not where you *discover* a broken one

---

## 🧰 Troubleshooting

- **`access denied by server`** → the NFS rule on the NAS doesn't include your server's IP, or the export path is wrong. Re-check with `showmount -e <nas-ip>`.
- **Files owned by `nobody:nogroup`** → NFSv4 ID mapping mismatch. Simplest fix on a home LAN: make the UID/GID on the NAS share match your server user (1000:1000), or set the share's squash option to map all access to that UID.
- **`Stale file handle`** → the export changed on the NAS side while mounted. `sudo umount -l /mnt/nas/media && sudo mount -a`.
- **Commands hang forever on the mount point** → the NAS is down and the mount is `hard` (working as designed — data safety over responsiveness). Bring the NAS back, or `sudo umount -f -l` to force-release.
- **Slow SMB transfers** → confirm `vers=3.0` or higher in the mount options; SMB1 negotiation still lurks in old NAS defaults and is both slow and insecure.

---

## 🧠 Final Thought

A NAS you can't reliably reach is just a very expensive space heater.

Get the mounts boring — tested, pinned, ordered, guarded — and the rest of the homelab gets to build on storage it never has to think about.

> Boring storage is the foundation everything else stands on.
