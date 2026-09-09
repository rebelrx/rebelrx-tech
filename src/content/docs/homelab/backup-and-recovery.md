---
title: "💾 Backup Architecture & Recovery"
description: >-
  A practical, layered backup architecture for a self-hosted homelab using Git for reproducible configuration, Kopia for versioned local backups, NAS storage, off-site disaster recovery, and routine restore testing.
---
A **backup** is an independent copy of data that lets you recover after deletion, corruption, hardware failure, or another loss. A useful backup system is not just “another copy somewhere”; it should preserve enough history that you can go back to a known-good version and it should be tested often enough that you know restoration actually works.

:::tip[ELI5]
A backup is your undo button after something important is gone or broken. The job is not finished when the backup says “success”—it is finished when you can restore the right files and applications from it.
:::

## 🪜 A Practical Backup Setup Order

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

1. List the data that is irreplaceable or painful to recreate.
2. Keep infrastructure configuration in Git where appropriate.
3. Back up application data and databases with a versioned backup tool.
4. Store the backup repository on storage that can fail independently from the computer being protected.
5. Keep critical recovery credentials outside that same failure domain.
6. Maintain an off-site copy for data that must survive theft, fire, or total site loss.
7. Test ordinary file restores regularly and full application restores periodically.

This guide uses Git, versioned backups such as Kopia, NAS storage, and off-site storage as complementary layers. You do not need the exact same products; you need the same recovery properties.

## 🧩 Backup Terms You Should Know

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

- **Snapshot** — a point-in-time view of backed-up data.
- **Retention** — the rules that decide how many old snapshots you keep.
- **Repository** — the storage location where the backup tool writes protected data.
- **RPO** — how much recent data you can tolerate losing.
- **RTO** — how long you can tolerate the recovery taking.
- **Off-site backup** — a copy stored outside the physical location of the primary systems.

---

## 3️⃣-2️⃣-1️⃣ Start With the 3-2-1 Backup Rule

:::tip[ELI5]
For important data, keep three copies: the live copy plus two backups, stored across at least two different storage types or failure domains, with at least one copy somewhere else.
:::

The classic **3-2-1 strategy** is the simplest useful starting point for backup design:

- **3 copies of important data** — one production copy and two backup copies.
- **2 different media or independent storage systems** — so one hardware/storage failure does not destroy every copy.
- **1 copy off-site** — so theft, fire, flooding, electrical damage, or a catastrophic local event does not destroy the entire backup set.

A practical homelab example:

```text
Copy 1: Live application data on the server
Copy 2: Versioned Kopia snapshots on a local NAS
Copy 3: Independent off-site backup or replicated critical data
```

Git can add another useful copy of **configuration**, but it does not replace backups of databases, documents, photos, or application state.

### What counts as "different media" in a homelab?

Do not get hung up on tape versus disk. The goal is **independent failure**.

Better:

```text
Server NVMe → separate NAS → remote/off-site storage
```

Worse:

```text
/data/app
/data/app-backup
```

Those two directories may still disappear together if the same filesystem, host, or storage controller fails.

### A stronger modern version: 3-2-1-1-0

For critical data, I like the extended idea:

- **3** copies
- **2** storage types/failure domains
- **1** off-site copy
- **1** offline, immutable, or otherwise protected copy where practical
- **0** unverified backups—meaning restores are tested and backup errors are not ignored

You do not need enterprise tape infrastructure to apply this. An off-site target with versioning/immutability controls plus routine restore tests already gets a homelab much closer to the intent.

CISA/US-CERT guidance has long recommended the 3-2-1 rule for improving recoverability.

**Reference:** [CISA/US-CERT Data Backup Options](https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf)

---

## 🛠️ Concrete Example: Protect a Docker Application

:::tip[ELI5]
For a Docker application, back up the data the container needs—not the container image itself. The image can usually be downloaded again; your database and uploaded files cannot.
:::

Imagine this stack:

```text
/opt/docker/stacks/app/compose.yaml
/opt/docker/stacks/app/.env
/opt/docker/data/app/config/
/opt/docker/data/app/uploads/
PostgreSQL database
```

A sensible protection plan is:

1. Commit `compose.yaml`, `.env.example`, scripts, and README to Git.
2. Keep the real `.env` in a password manager/protected secret backup—not a public repository.
3. Create a scheduled PostgreSQL dump.
4. Include the dump, `config/`, and `uploads/` in Kopia snapshots.
5. Store the Kopia repository on a separate NAS/storage system.
6. Replicate critical data or backups off-site.
7. Quarterly, restore the app into a temporary directory or test stack and prove it starts.

That is 3-2-1 translated into an actual homelab workflow.

---

## ✅ What You Need to Know First

:::tip[ELI5]
A green dashboard, a completed snapshot, or an intact RAID array is not proof of recoverability.
:::

> A backup is not successful because the job completed. It is successful because the data can be restored.

A green dashboard, a completed snapshot, or an intact RAID array is not proof of recoverability.

A useful backup system must provide:

- Multiple independent copies
- Version history
- Protection against accidental deletion
- Protection against hardware failure
- Protection against site loss
- Recoverable encryption credentials
- Documented restore procedures
- Periodic restore testing

---

## 🧱 Think in Layers, Not Products

:::tip[ELI5]
No single mechanism is ideal for all of these.
:::

A homelab typically contains several different kinds of state:

| Layer | Examples | Best protection |
| :--- | :--- | :--- |
| Infrastructure definition | Compose files, scripts, templates, documentation | Git |
| Secrets | `.env`, API keys, recovery codes | Password manager + protected backup |
| Application state | Databases, configs, uploaded files | Versioned backup repository |
| AI assets | Models, workflows, custom nodes, local datasets | Versioned local backup where practical |
| Personal files | Documents, photos, scans | Versioned backup + off-site copy |
| Bulk media/archive | Large media libraries and archives | Redundant local storage + selective off-site protection |
| Operating system | Installed packages and base configuration | Rebuild from documentation rather than image everything |

No single mechanism is ideal for all of these.

That is why a layered strategy is more resilient than trying to make one backup application protect the entire environment indiscriminately.

---

## 🧬 Git Protects Reproducibility, Not Runtime State

:::tip[ELI5]
This section explains how version control helps you review, reproduce, or recover infrastructure configuration.
:::

Infrastructure configuration belongs in Git whenever it can be safely represented there:

```text
compose.yaml
.env.example
README.md
scripts/
config templates/
pre-commit configuration
```

Git provides:

- Version history
- Change review
- Rollback of configuration
- A reproducible starting point for rebuilding a host
- Documentation that stays adjacent to the infrastructure it describes

But Git should **not** contain:

```text
.env
private keys
passwords
API tokens
live databases
application uploads
large model files
cache directories
runtime state
```

This distinction matters during recovery:

> Git recreates the **shape** of the environment. Backups restore the **state** of the environment.

See [Git-Managed Homelab](/homelab/git-managed-homelab/) for the repository workflow.

---

## 📦 Classify Data Before Backing It Up

:::tip[ELI5]
Before configuring retention, decide what each class of data is worth.
:::

Before configuring retention, decide what each class of data is worth.

### 🔴 Tier A — Irreplaceable

Examples:

- Personal documents
- Scanned records
- Photos and family data
- Important databases
- Application data with significant history
- Unique source files
- Critical secrets and recovery material

These deserve the strongest protection available, including an independent copy outside the primary environment where practical.

### 🟠 Tier B — Expensive to Recreate

Examples:

- Carefully curated application metadata
- Self-hosted service configuration
- AI workflows
- Custom model modifications
- Large locally downloaded model collections
- VM templates

These may technically be reproducible, but rebuilding them could take days or weeks.

They should generally be backed up locally with version history.

### 🟡 Tier C — Replaceable but Inconvenient

Examples:

- Downloaded installation media
- Re-creatable caches
- Temporary project files
- Generated thumbnails
- Transcodes

Back these up only when the recovery benefit exceeds the storage cost.

### 🟢 Tier D — Re-downloadable

Examples:

- Container images
- Package caches
- ISO files available upstream
- Disposable build artifacts

These usually do not belong in a backup repository.

---

## 🗺️ The RebelRx Backup Model

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

At a high level, the environment uses four complementary protections:

### 1. Git

For reproducible infrastructure definitions, documentation, scripts, and safe templates.

### 2. Kopia

For versioned snapshots of important server/workstation data, including self-hosted application state, Docker data, infrastructure data, and local AI assets where appropriate.

### 3. Local NAS Storage

For durable backup repositories and bulk data storage separate from the machines doing the work.

### 4. Independent Off-Site Storage

For selected large media/archive data that must survive loss of the local site.

This is intentionally not a byte-for-byte mirror of every system. Different data classes have different restore economics.

---

## 🛡️ Why Kopia Works Well for the Local Backup Tier

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

[Kopia](https://kopia.io/) is a strong fit for homelab backups because it provides:

- Content-addressed deduplication
- Compression
- Encryption
- Snapshot history
- Retention policies
- Verification features
- Efficient incremental backups
- File-level restore
- CLI and server/UI workflows

The important architectural choice is not simply "use Kopia." It is:

> Put the backup repository on storage that is physically and operationally separate from the machine being protected.

Backing a workstation onto another disk inside the same workstation is useful against accidental deletion, but it is not meaningful protection against chassis failure, theft, power damage, or filesystem destruction.

---

## 🗄️ Keep Backup Repositories Separate from Live Data

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Whenever possible, the system being backed up and the repository receiving the backup should fail independently.

For example:

```text
Compute host
   │
   ├── live application data
   ├── infrastructure configuration
   └── AI models / working data
          │
          ▼
   Versioned Kopia repository
          │
          ▼
      NAS storage
```

The precise mount points and network paths are not important to the concept.

What matters is that a failed compute host does not also destroy its backup repository.

---

## 🔒 Encryption Keys Are Part of the Backup

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Kopia repositories are encrypted. That is a major advantage—until the repository password is lost.

Store repository credentials somewhere independent from the machine being backed up.

At minimum:

- Password manager
- Protected secondary copy of critical recovery credentials
- Recovery documentation that identifies which credential unlocks which repository

:::danger[Do not create an unrecoverable encrypted backup]
A perfectly healthy encrypted repository with a lost password is functionally equivalent to deleted data.
:::

---

## 🧠 Back Up the Things That Take Time to Rebuild

:::tip[ELI5]
One of the easiest backup mistakes is focusing only on obvious personal files while ignoring infrastructure state that required significant effort to create.
:::

One of the easiest backup mistakes is focusing only on obvious personal files while ignoring infrastructure state that required significant effort to create.

For a self-hosted environment, consider protecting:

- Docker application data
- Database exports
- Configuration directories not represented safely in Git
- Reverse-proxy state where relevant
- Authentication-system state
- Document-management data
- Local AI models
- AI workflows
- Custom scripts
- Model configuration
- Application metadata

A 50 GB directory that took two weeks to curate may be more valuable than a 5 TB directory that can be downloaded again overnight.

---

## 🤖 Treat AI Models as a Deliberate Backup Class

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Local AI systems introduce a new storage problem: models can be enormous.

A blanket rule of "back up all models" may consume massive repository capacity, while "back up none" can result in days of re-downloading and reconstructing a working environment.

Classify models:

### Back up

- Hard-to-find models
- Custom fine-tunes
- Converted or quantized models you produced yourself
- LoRAs or adapters you trained
- Custom workflows
- Model metadata or configuration that is difficult to reconstruct

### Consider re-downloading

- Popular upstream models with stable sources
- Standard container images
- Easily regenerated caches

In my environment, local AI assets are important enough that key model/data directories are included in versioned backup coverage rather than treating the entire AI stack as disposable.

---

## 🗃️ Databases Need Application-Consistent Backups

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Databases deserve special handling.

Blindly copying a live database directory can produce an inconsistent restore because database engines may have:

- Dirty pages
- Write-ahead logs
- In-flight transactions
- Files that must agree at a specific point in time

For stateful applications, prefer one of these approaches:

1. Application-supported export
2. Database-native logical dump
3. Filesystem snapshot explicitly supported by the database
4. Temporarily stopping the database during a controlled backup window

For PostgreSQL, logical dumps commonly use tools such as:

```bash
pg_dump
pg_dumpall
```

For MariaDB/MySQL:

```bash
mariadb-dump
```

The exact command depends on the application and database topology.

The important rule is:

> Do not assume that "the files were copied" means "the database is restorable."

---

## 🧪 Prefer Atomic Database Export Workflows

:::tip[ELI5]
Databases need deliberate handling because copying live database files is not always a safe backup or migration method.
:::

When automating database dumps, do not allow the backup system to capture a half-written export.

A simple pattern is:

```bash
some-dump-command > database.sql.tmp &&
  mv -- database.sql.tmp database.sql
```

Or with compression:

```bash
# Bash: propagate failures from the dump command through the pipeline.
set -o pipefail
some-dump-command | gzip > database.sql.gz.tmp &&
  mv -- database.sql.gz.tmp database.sql.gz
```

Replace `some-dump-command` with the database's tested export command. Run one export at a time, restrict dump-file permissions (for example, `umask 077`), exclude `*.tmp` from snapshots, and alert on failure. A failed export must leave the previous final file intact.

The final `mv` is atomic on the same filesystem, so the backup job sees either:

- The previous complete dump
- The new complete dump

It does not see a partially written file with the final production name.

---

## 📆 Snapshot Frequency Should Follow Change Rate

:::tip[ELI5]
There is no universal correct backup interval.
:::

There is no universal correct backup interval.

Think in terms of **Recovery Point Objective (RPO)**:

> How much recent work or data am I willing to lose?

Examples:

| Data | Reasonable RPO |
| :--- | :--- |
| Frequently changing documents | Hours |
| Application databases | Hours |
| Infrastructure configuration | Every committed change |
| AI models | Daily or after major changes |
| Static archive | Daily, weekly, or event-driven |

A six-hour snapshot interval may be entirely reasonable for important homelab state, while archival media might require much less frequent backup.

---

## 🕰️ Retention Is About History, Not Just Copies

:::tip[ELI5]
A backup repository should protect against mistakes discovered later.
:::

A backup repository should protect against mistakes discovered later.

If ransomware encrypts files on Monday and your backup system immediately replaces Sunday's copy with Monday's version, the backup has failed at one of its most important jobs.

Use a retention model that preserves multiple time scales.

For example:

```text
Recent snapshots     → dense coverage
Daily snapshots      → short-term history
Weekly snapshots     → medium-term history
Monthly snapshots    → long-term recovery points
Annual snapshots     → optional archival checkpoints
```

Kopia supports policy-based retention, allowing you to retain snapshots across hourly, daily, weekly, monthly, and annual periods.

The exact numbers should reflect available capacity and how quickly corruption or deletion might be discovered.

---

## 💽 RAID and ZFS Are Not Backups

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Redundant storage is useful. It is not backup.

RAID/ZFS redundancy can help survive:

- Individual disk failure
- Some hardware faults

It does not inherently protect against:

- Accidental deletion
- Application corruption
- Ransomware
- Administrator error
- Stolen hardware
- Fire
- Flood
- Catastrophic pool failure

A replicated mistake is still a mistake.

---

## 🗂️ Separate Storage Pools Are Useful—but Still Local

:::tip[ELI5]
This section explains how to keep storage usable, observable, and recoverable as the homelab grows.
:::

Using multiple independent NAS pools is valuable because it avoids making every workload depend on one giant filesystem.

Separate pools can provide:

- Failure isolation
- Capacity management
- Workload separation
- Easier maintenance

But two NAS units in the same physical location are still vulnerable to the same site-level disaster.

That is why genuinely important data needs an off-site strategy as well.

---

## 🌍 Off-Site Protection Should Match the Data

:::tip[ELI5]
Off-site backups are expensive in three currencies: That is especially true for very large media/archive collections.
:::

Off-site backups are expensive in three currencies:

- Storage
- Bandwidth
- Time

That is especially true for very large media/archive collections.

A practical strategy may therefore protect different data differently:

### Critical small data

Use frequent, highly versioned protection **and an independent encrypted off-site copy**. Small irreplaceable data and recovery credentials take priority over replaceable bulk media.

### Large media/archive data

Maintain a separate off-site disaster-recovery copy sized for catastrophic loss rather than trying to provide minute-by-minute version history.

In my environment, large NAS media/archive data has an independent off-site destination specifically for disaster recovery.

The important properties are:

- Geographically separate
- Independent from local NAS failure
- Sufficient capacity
- Documented access credentials
- Known restore process

---

## 📡 Know the Restore Bandwidth Before You Need It

:::tip[ELI5]
This section walks through getting data or a service back into a working state.
:::

Large backups introduce an uncomfortable reality: restoring tens or hundreds of terabytes over the internet may take a very long time.

Approximate best-case transfer time can be estimated with:

```text
Time = Data size ÷ sustained transfer rate
```

Real-world recovery takes longer due to:

- Protocol overhead
- Encryption
- Disk speed
- Remote provider limits
- Network congestion
- Verification
- Small-file overhead

For bulk media, the goal may be "the data survives" rather than "everything is back online tomorrow."

That distinction should be documented before disaster strikes.

---

## 🧱 Back Up Application Data, Not Containers

:::tip[ELI5]
Containers are replaceable application instances; this section explains how to operate them without losing persistent state.
:::

Container images should generally be recreated from upstream registries.

Back up:

```text
compose.yaml          → Git
.env.example          → Git
.env                   → protected secret backup
application data      → Kopia
logical DB dumps       → Kopia
custom scripts         → Git
custom config          → Git or Kopia depending on sensitivity
```

Do not waste backup storage on container layers that Docker can pull again.

---

## 🐳 Know Which Docker Data Is Stateful

:::tip[ELI5]
This section explains how the Docker part of the setup should be configured or operated.
:::

A Compose project may look reproducible while hiding state in:

- Bind mounts
- Named Docker volumes
- External network storage
- Database volumes
- Application-generated configuration

Before declaring a stack protected, answer:

```text
Where is every piece of state stored?
```

For bind-mounted infrastructure this is usually straightforward.

Named volumes require deliberate export or inclusion in the backup process.

---

## 🧾 Document Backup Coverage

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Maintain a simple coverage matrix.

Example:

| Asset | Live location | Local backup | Off-site | Restore tested |
| :--- | :--- | :--- | :--- | :--- |
| Infrastructure Git | Compute systems | Git server | Repo backup | Yes |
| Docker application data | Compute systems | Kopia/NAS | As required | Yes |
| AI models | AI compute | Kopia/NAS | Selective | Yes |
| Personal documents | Self-hosted storage | Versioned backup | Yes | Yes |
| Bulk media | NAS pools | Storage redundancy | Independent off-site copy | Sampled |

The exact topology can remain private. The important part is knowing whether an independent recovery path exists.

---

## 🩺 Monitor Backups for Absence of Success

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Backups often fail silently because of:

- Full storage
- Broken mounts
- Expired credentials
- Network failure
- Repository locks
- Permission changes
- Container updates
- A job that simply stopped running

Do not monitor only for explicit errors.

Monitor for:

> "A successful backup has not occurred within the expected window."

That catches the failure mode where nothing runs at all.

Useful signals include:

- Age of latest snapshot
- Repository errors
- Repository free space
- Last successful database dump
- Backup job exit status
- Mount availability

---

## 🔍 Verify Repository Health

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

Periodic repository verification should be part of routine maintenance.

With Kopia, verification can include checking repository metadata and content integrity using the tools appropriate for the repository configuration.

Do not run heavyweight verification blindly on enormous repositories without understanding the I/O impact.

Schedule deeper checks during low-activity periods.

---

## 🔁 Restore Testing Is Mandatory

:::tip[ELI5]
This section walks through getting data or a service back into a working state.
:::

Every backup class should be restored periodically.

A useful quarterly drill includes at least four tests.

### 1. Restore one ordinary file

Pick a real document or configuration file and restore it to a temporary location.

Check:

- Filename
- Size
- Contents
- Permissions where relevant

### 2. Restore one directory tree

Restore something with nested directories and multiple files.

This catches path and permission issues a single-file test may miss.

### 3. Restore one database export

Restore a database dump into an isolated test database—not production.

Confirm that:

- The database imports
- Expected tables exist
- Representative records exist
- The application version is compatible

### 4. Restore one application stack

On an isolated machine or path:

1. Clone infrastructure configuration
2. Restore secrets
3. Restore application state
4. Start the stack
5. Confirm the application works

This is the closest thing to proof that the backup architecture is real.

---

## 🧪 Test the Backup, Not Just the Restore Command

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

A command returning exit code `0` proves only that the command did not report an error.

After restoring, validate the actual data:

- Open the document
- View the photo
- Query the database
- Log into the restored application
- Confirm recent records
- Confirm expected permissions

Recovery validation must be semantic, not merely mechanical.

---

## 📋 A Practical Quarterly Backup Drill

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

A lightweight quarterly routine can be:

```text
[ ] Confirm latest snapshots are recent
[ ] Check repository capacity
[ ] Restore one random file
[ ] Restore one directory
[ ] Restore one database dump in isolation
[ ] Validate one infrastructure repository clone
[ ] Confirm backup credentials are recoverable
[ ] Confirm off-site access still works
[ ] Update documentation if anything changed
```

This should take far less time than recovering from an undocumented failure.

---

## 🚨 Protect Against Ransomware

:::tip[ELI5]
Versioned backups help, but only if an attacker cannot erase every version.
:::

Versioned backups help, but only if an attacker cannot erase every version.

Consider the trust boundary:

> If a compromised client has permanent credentials that can delete the entire repository, that repository may be vulnerable too.

Resilience improves with:

- Snapshot history
- Separate backup credentials
- Limited permissions
- Repository access not exposed unnecessarily
- Independent off-site copies
- Storage-side snapshots where appropriate
- Immutable retention where available
- Recovery credentials stored separately

No single feature replaces layered isolation.

---

## 🔑 Treat Secrets as Recoverable State

:::tip[ELI5]
This section is about keeping credentials private while still making the system recoverable.
:::

Secrets should not be in Git, but they still have to survive a host failure.

Examples:

- `.env` files
- Encryption keys
- Database passwords
- API credentials
- Application recovery tokens
- SSH material
- Backup repository passwords

Store them in a secure system designed for secrets and ensure you can access that system during a disaster.

Do not make the recovery path depend on a service that itself requires the failed infrastructure to start.

---

## 🧯 Plan for Backup-System Failure Too

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Backup infrastructure can fail independently.

Possible failures include:

- Repository corruption
- NAS failure
- Lost credentials
- A bad backup-tool upgrade
- Accidental repository deletion

This is one reason multiple independent protection layers matter.

Git, Kopia, local NAS storage, and off-site storage solve different problems and reduce dependence on one technology.

---

## 🔄 Do Not Confuse Synchronization with Backup

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

File synchronization tools are designed to propagate changes.

That includes bad changes.

If a file is deleted locally and that deletion synchronizes everywhere, synchronization worked perfectly—and you still lost the file.

Use synchronization for availability and workflow.

Use versioned backups for recovery.

---

## 🧩 Backups Should Follow Dependencies

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

A self-hosted application often depends on more than its own data directory.

For example:

```text
Application
   ├── database
   ├── uploaded files
   ├── secrets
   ├── reverse proxy
   ├── authentication
   └── external storage
```

A complete recovery plan must account for every dependency.

This is why infrastructure documentation and backups must be designed together.

---

## 🗃️ Keep Backup Tool Configuration Reproducible

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Where safe, keep non-secret backup configuration in Git:

- Compose definition
- Scripts
- Exclusion files
- Documentation
- Restore procedures

Keep secrets outside Git:

- Repository passwords
- Credentials
- Private SSH keys

The backup system itself should be rebuildable after a host failure.

---

## ⚙️ Rebuild the OS; Restore the State

:::tip[ELI5]
This section walks through getting data or a service back into a working state.
:::

For most Linux homelab systems, I prefer not to rely on full-disk images as the primary recovery mechanism.

Instead:

1. Reinstall the operating system cleanly
2. Apply the documented baseline
3. Install Docker or required runtime
4. Clone infrastructure configuration
5. Restore secrets
6. Restore application state
7. Reattach storage
8. Validate services

This avoids preserving years of operating-system drift inside a monolithic image.

It also proves that the documentation is sufficient to recreate the machine.

---

## 📚 Keep Recovery Documentation Outside the Failure Domain

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

Do not store the only copy of the recovery guide on the server it describes.

Keep an externally accessible or offline copy containing enough information to identify:

- Backup repositories
- Required credentials
- Storage roles
- Restore order
- Repository locations
- Recovery dependencies

Do not publish private network details or plaintext secrets in public documentation.

---

## 🚫 Common Backup Mistakes

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Avoid these:

- Treating RAID as backup
- Backing up container images instead of application state
- Keeping all copies in one physical location
- Backing up a live database without a consistency strategy
- Keeping repository passwords only on the protected host
- Assuming sync is backup
- Never testing restores
- Keeping only one recent version
- Backing up terabytes of disposable caches
- Ignoring AI models or custom workflows that would take days to recreate
- Failing to monitor backup freshness
- Building a backup process nobody remembers how to restore

---

## ✅ Backup Architecture Checklist

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Before calling a system protected, confirm:

```text
[ ] Infrastructure configuration is version controlled
[ ] Secrets are stored outside Git and recoverable
[ ] Important application state is versioned
[ ] Database backups are application-consistent
[ ] Backup repositories are separate from live compute
[ ] Important data has an independent physical copy
[ ] Critical data has an off-site recovery path
[ ] Encryption keys are recoverable
[ ] Retention preserves historical versions
[ ] Backup freshness is monitored
[ ] At least one restore has been tested
[ ] Recovery documentation exists outside the lab
```

---

## 🔗 Related Guides

:::tip[ELI5]
This section explains related guides in practical terms and what it changes in the homelab.
:::

- [Docker Infrastructure Standards](/homelab/docker-infrastructure-standards/)
- [Git-Managed Homelab](/homelab/git-managed-homelab/)
- [Disaster Recovery Runbook](/homelab/disaster-recovery/)
- [NAS Mounting](/homelab/nas-mounting/)
- [Docker Home Lab](/homelab/docker-home-lab/)

---

## ✅ What to Remember

:::tip[ELI5]
This is the short version to keep in mind after you finish the page.
:::

A backup architecture is not measured by how many terabytes it stores.

It is measured by how confidently you can answer:

> **If this machine, disk, NAS, or entire site disappeared today, what would I restore, from where, and in what order?**

If that answer is documented and tested, failure becomes an inconvenience instead of a catastrophe.
