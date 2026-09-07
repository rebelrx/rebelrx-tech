---
title: "💾 Backup & Recovery (Docker Homelab)"
description: >-
  A tested, layered backup strategy for your Docker homelab — Kopia to local NAS, encrypted Borg offsite, database dumps, and the restore drills that make it real.
---
A practical guide to building a **layered, tested backup system** for the [Docker homelab](/homelab/docker-home-lab/) and proving it works before you need it.

---

## ⚠️ Core Principle

> If your backup strategy isn't tested, it doesn't exist.

Backups are not a product you install. They are a **discipline**: copies in the right places, automated without you, and restored on a schedule to prove they're real.

---

## 🧭 The 3-2-1 Rule

The baseline every strategy should meet:

- **3** copies of your data (the original + two backups)
- **2** different storage media or systems
- **1** copy offsite

For this homelab that maps cleanly:

| Copy | Where | Tool |
| :--- | :--- | :--- |
| 1 (live) | Server → `/opt/data` | — |
| 2 (local) | NAS | Kopia |
| 3 (offsite) | Encrypted remote repo | Borg (borgmatic) |

> Local backups protect against mistakes and dead disks. Offsite protects against fire, theft, and ransomware.

---

## 📦 What to Back Up (and What Not To)

Not all data deserves the same treatment. Tier it:

### 🔴 Irreplaceable (backup, all tiers)

- App data → `/opt/data/<stack>` (Immich library, Paperless documents, Nextcloud files, Vaultwarden vault)
- Database dumps (see below)
- Photos, documents, personal archives

### 🟡 Recoverable with effort (backup locally)

- Service configuration not yet captured in Git
- Metadata libraries that took years to curate

### 🟢 Re-acquirable (don't back up)

- Media libraries managed by the Arr stack
- Container images (they're one `docker compose pull` away)
- Caches, transcodes, thumbnails

:::tip[Your compose tree is already backed up]
Following the [homelab structure](/homelab/docker-home-lab/), everything in
`/opt/stacks/` lives in Git (Forgejo). That's your infrastructure backup —
which is exactly why secrets stay in `.env` files and out of the repo.

This guide covers the other half: `/opt/data/`.
:::
---

## 🗄️ Databases: The Silent Backup Killer

Copying a **running** database's files produces a corrupt backup often enough to ruin your one restore that matters. Postgres, MySQL, and MariaDB write constantly; a file-level snapshot mid-write is a coin flip.

The fix is simple: **dump first, then back up the dumps.**

Create `/opt/scripts/db-dumps.sh`:

```bash
#!/bin/sh
# Nightly database dumps — file-safe copies for the backup jobs to pick up
set -eu

DUMP_ROOT=/opt/data/db-dumps
mkdir -p "$DUMP_ROOT"

# Postgres containers: docker exec + pg_dumpall
for c in immich-postgres paperless-db joplin-db forgejo-db; do
  docker exec "$c" sh -c 'pg_dumpall -U "$POSTGRES_USER"' | \
    gzip > "$DUMP_ROOT/${c}.sql.gz.tmp" && \
    mv "$DUMP_ROOT/${c}.sql.gz.tmp" "$DUMP_ROOT/${c}.sql.gz"
done

# MariaDB containers
for c in seafile-mysql romm-db; do
  docker exec "$c" sh -c 'mariadb-dump -uroot -p"$MYSQL_ROOT_PASSWORD" --all-databases' | \
    gzip > "$DUMP_ROOT/${c}.sql.gz.tmp" && \
    mv "$DUMP_ROOT/${c}.sql.gz.tmp" "$DUMP_ROOT/${c}.sql.gz"
done
```

Adjust the container lists to your stacks, then schedule it nightly **before** the backup jobs run:

```bash
sudo chmod +x /opt/scripts/db-dumps.sh
sudo crontab -e
```

```text
# Dumps at 01:00, local backup at 02:00, offsite at 03:00
0 1 * * * /opt/scripts/db-dumps.sh
```

> The `.tmp` + `mv` pattern ensures a backup never picks up a half-written dump.

---

## 🟢 Tier 2 — Local Backups with Kopia (Server → NAS)

[Kopia](https://kopia.io/) provides fast, deduplicated, encrypted snapshots with a clean web UI — ideal for the high-frequency local tier.

**Prerequisite:** your NAS mounted on the server (e.g., at `/mnt/nas/backups` via NFS).

### Compose Stack

`/opt/stacks/backup/compose.yaml`:

```yaml
services:
  kopia:
    image: kopia/kopia:latest
    container_name: kopia
    restart: unless-stopped
    hostname: server-backup
    environment:
      - KOPIA_PASSWORD=${KOPIA_REPO_PASSWORD}
      - TZ=${TZ}
    command:
      - server
      - start
      - --insecure                  # UI reached via Tailscale only; TLS optional
      - --address=0.0.0.0:51515
      - --server-username=${KOPIA_UI_USER}
      - --server-password=${KOPIA_UI_PASSWORD}
    ports:
      - "51515:51515"
    volumes:
      - /opt/data/kopia/config:/app/config
      - /opt/data/kopia/cache:/app/cache
      - /opt/data/kopia/logs:/app/logs
      - /opt/data:/source/opt-data:ro        # what we back up (read-only)
      - /mnt/nas/backups/kopia:/repository   # where it goes
```

:::caution[Mount sources read-only]
The `:ro` on the source mount means a compromised or misbehaving backup
container **cannot alter the data it protects**. Backup tools need read
access — never write access — to your live data.
:::
### Initialize and Schedule

Open `http://server:51515` (over Tailscale), create the repository in `/repository`, and define a snapshot policy for `/source/opt-data`:

- **Schedule** → daily at 02:00
- **Retention** → 7 daily, 4 weekly, 6 monthly
- **Exclusions** → cache directories, transcode folders, anything 🟢 tier

The repository password (`KOPIA_REPO_PASSWORD`) encrypts everything at rest.

:::danger[Store the repository password outside the system it protects]
A backup encrypted with a password that only exists on the dead server is
not a backup. Keep repo passwords and keys in your password manager **and**
one offline copy (printed, in a safe location).
:::
---

## 🔴 Tier 3 — Offsite with Borg (borgmatic)

[Borg](https://www.borgbackup.org/) provides encrypted, deduplicated, append-capable archives; [borgmatic](https://torsion.org/borgmatic/) wraps it in one declarative config file.

For the remote end, pick a Borg-native host — [BorgBase](https://www.borgbase.com/) and [rsync.net](https://rsync.net/) are the established options, or another machine you control (family member's house, second site) works just as well and keeps everything in-house.

> Everything is encrypted **client-side** before it leaves your server. The remote host stores ciphertext it cannot read.

### Compose Stack

Add to the same `backup` stack:

```yaml
  borgmatic:
    image: ghcr.io/borgmatic-collective/borgmatic:latest
    container_name: borgmatic
    restart: unless-stopped
    environment:
      - BORG_PASSPHRASE=${BORG_PASSPHRASE}
      - TZ=${TZ}
    volumes:
      - /opt/data:/mnt/source:ro                          # source (read-only)
      - /opt/data/borgmatic/config:/etc/borgmatic.d       # config + crontab
      - /opt/data/borgmatic/borg-config:/root/.config/borg
      - /opt/data/borgmatic/cache:/root/.cache/borg
      - /opt/data/borgmatic/ssh:/root/.ssh                # key for the remote repo
```

### Configuration

`/opt/data/borgmatic/config/config.yaml`:

```yaml
source_directories:
  - /mnt/source

exclude_patterns:
  - '*/cache/*'
  - '*/transcodes/*'
  - /mnt/source/kopia          # don't back up the local backup tool's cache

repositories:
  - path: ssh://xxxxxxxx@xxxxxxxx.repo.borgbase.com/./repo
    label: offsite

keep_daily: 7
keep_weekly: 4
keep_monthly: 12

checks:
  - name: repository
    frequency: 2 weeks
  - name: archives
    frequency: 1 month
```

`/opt/data/borgmatic/config/crontab.txt`:

```text
0 3 * * * PATH=$PATH:/usr/local/bin borgmatic --verbosity -1 --syslog-verbosity 1
```

Initialize the repository once:

```bash
docker exec borgmatic borgmatic repo-create --encryption repokey-blake2
docker exec borgmatic borgmatic key export --paper   # print this. seriously.
```

:::tip[Why both Kopia and Borg?]
Two independent tools means one bad update, bug, or repository corruption
can't take out every copy of your data at once. Local tier optimizes for
fast, frequent restores; offsite optimizes for disaster survival.

Running only one? Borg + borgmatic to the NAS **and** offsite covers 3-2-1
with a single toolchain.
:::
---

## 🔁 Restore Testing (The Part Everyone Skips)

An untested backup is a hope, not a plan. Put a **quarterly restore drill** on your calendar. Thirty minutes, four checks:

### 1. Restore a File (Kopia)

Pick a real file, restore it somewhere else, verify contents:

```bash
docker exec kopia kopia snapshot list /source/opt-data
docker exec kopia kopia restore <snapshot-id>/immich/library/some-photo.jpg /tmp/restore-test/
```

### 2. Restore a File (Borg)

```bash
docker exec borgmatic borgmatic list
docker exec borgmatic borgmatic extract --archive latest \
  --path mnt/source/paperless/media/documents \
  --destination /tmp/restore-test/
```

### 3. Restore a Database

The one that actually matters:

```bash
# Into a scratch container — never your live DB
docker run -d --name pg-restore-test -e POSTGRES_PASSWORD=test postgres:17
zcat /opt/data/db-dumps/paperless-db.sql.gz | \
  docker exec -i pg-restore-test psql -U postgres
docker exec pg-restore-test psql -U postgres -c '\l'   # databases exist? row counts sane?
docker rm -f pg-restore-test
```

### 4. Rehearse the Disaster on Paper

Ask: *the server is gone; what's the sequence?* You should be able to write it from memory:

1. Install Devuan → [server guide](/linux/devuan-server-install/)
2. Install Docker → [homelab guide](/homelab/docker-home-lab/)
3. Clone the homelab repo from Forgejo → `/opt/stacks` restored
4. Restore `/opt/data` from NAS (Kopia) — or from offsite (Borg) if the NAS died too
5. Restore database dumps into fresh DB containers
6. `docker compose up -d`, stack by stack

If any step makes you say "I'd have to figure that out," figure it out **now** and write it down.

---

## 📟 Monitoring (Silent Failure Is the Default)

Backups fail quietly — a full disk, an expired key, an unmounted NAS — and you find out at restore time. Wire them to your existing monitoring:

- Add a push monitor in **Uptime Kuma** and ping it at the end of each backup run; alert if no ping arrives on schedule
- borgmatic supports this natively — add to `config.yaml`:

```yaml
uptime_kuma:
  push_url: https://uptime-kuma.local/api/push/<token>
```

- Check `docker logs kopia` and `docker logs borgmatic` after any infrastructure change

> Monitor for the **absence of success**, not just the presence of errors.

---

## 🚫 What Not To Do

- Don't back up live database files; dump first
- Don't give backup containers write access to source data
- Don't keep encryption keys only on the machine being backed up
- Don't let RAID or NAS redundancy masquerade as backup — it protects against disk failure, not deletion, corruption, or ransomware
- Don't "set and forget" — that's how you discover in year three that backups stopped in year one

---

## 🧠 Final Thought

Nobody regrets the hour spent testing a restore.

Plenty of people regret the years of photos, documents, and infrastructure that vanished with a single disk.

> Your data is only as sovereign as your ability to get it back.
