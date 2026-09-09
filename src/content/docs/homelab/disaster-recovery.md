---
title: "🚨 Disaster Recovery Runbook"
description: >-
  A practical homelab disaster-recovery runbook covering failure classification, recovery priorities, host rebuilds, application restoration, NAS failure, off-site recovery, ransomware, and restore validation.
---
**Disaster recovery (DR)** is the process of turning backups, documentation, credentials, and replacement hardware back into a working environment after something significant fails. Backup answers “do I have another copy?” Disaster recovery answers “can I rebuild the system that uses it?”

:::tip[ELI5]
Backups are the spare parts. Disaster recovery is the repair manual and the order you install those parts. Restoring in the wrong order can leave perfectly good backups sitting beside applications that still cannot start.
:::

## 🪜 The Recovery Order

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

For most homelab incidents, restore dependencies before applications:

```text
Administrative access
        ↓
Network
        ↓
Storage
        ↓
Docker / compute runtime
        ↓
Secrets
        ↓
Databases and core services
        ↓
Applications
        ↓
Remote/public access
        ↓
Monitoring and backups
```

Start by identifying what failed. A deleted file, a broken container, a dead SSD, ransomware, and total site loss are different incidents and should not trigger the same response.

## 🧩 Recovery Terms You Should Know

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

- **Failure domain** — the group of things that can fail together.
- **RPO (Recovery Point Objective)** — the maximum amount of recent data you can afford to lose.
- **RTO (Recovery Time Objective)** — the maximum acceptable recovery time.
- **Restore validation** — proving that the recovered application and data actually work, not just that files copied successfully.
- **Runbook** — a written, step-by-step recovery procedure.

---

## 🧪 Real-World Recovery Examples

:::tip[ELI5]
Different failures need different responses. Do not rebuild the whole homelab because one file was deleted, and do not treat ransomware like a normal failed disk.
:::

### Example 1 — You deleted one important file

**Problem:** A document or configuration file was accidentally removed.

**Do this:**

1. Stop editing the affected directory if the file is important.
2. Open your backup tool.
3. Find the most recent snapshot from before deletion.
4. Restore the file to a **temporary location first**.
5. Inspect it.
6. Copy it back into production.

**Do not:** rebuild the server, restore the whole filesystem, or overwrite newer unrelated files.

---

### Example 2 — One Docker application broke after an update

**Problem:** The container starts but the application is broken, or a new image introduced a regression.

**Do this:**

1. Capture logs:

   ```bash
   docker compose logs --tail=200
   ```

2. Check whether only the image changed or whether the application performed a database migration.
3. If no incompatible migration occurred, roll the image tag back in `compose.yaml`.
4. Run:

   ```bash
   docker compose pull
   docker compose up -d
   ```

5. Verify the application from a real client.

If the database migrated incompatibly, restoring only the old container image may make things worse. Follow the application's documented rollback procedure or restore a matching database backup into an isolated test stack first.

---

### Example 3 — The Docker host's boot SSD dies

**Problem:** The operating system disk is dead, but application data/backups still exist elsewhere.

**Recovery order:**

1. Replace the failed drive.
2. Install the base OS.
3. Restore SSH/Tailscale administrative access.
4. Install Docker.
5. Recreate NAS/storage mounts.
6. Clone the infrastructure repository from Git.
7. Restore secrets from the password manager/protected secret store.
8. Restore application data from backup.
9. Restore databases.
10. Bring up core infrastructure first, then normal applications.
11. Verify services from clients.
12. Re-enable backups and monitoring.

The important point: **you usually do not need an image backup of the Linux operating system** if the OS is easy to rebuild and the configuration/state is protected elsewhere.

---

### Example 4 — The primary NAS dies

**Problem:** The server is healthy but the storage hosting important data is unavailable.

**Do this:**

1. Confirm whether the problem is the NAS OS, network path, pool, one disk, multiple disks, or the hardware itself.
2. Do **not** immediately initialize, reformat, or rebuild arrays just because the management UI suggests it.
3. If redundant storage is still healthy, replace only the failed component according to the NAS/vendor procedure.
4. If the pool is lost, build/recover replacement storage first.
5. Restore data from the independent backup copy.
6. Recreate mount points and verify permissions/UIDs/GIDs.
7. Only then restart applications that depend on the NAS.

---

### Example 5 — Ransomware or suspected compromise

**Problem:** Files are encrypted, credentials may be stolen, or malicious access is suspected.

**Do this:**

1. Isolate affected systems from the network.
2. Do not immediately reconnect backup repositories that might also be writable from the compromised host.
3. Preserve logs/evidence if you need to determine what happened.
4. Rotate important credentials from a known-clean device.
5. Rebuild affected hosts from trusted media/configuration.
6. Restore data from a known-good point **before** the compromise.
7. Verify systems before reconnecting them.
8. Change the design weakness that allowed the incident.

This is why an offline, immutable, or independently protected backup is so valuable.

---

### Example 6 — Total site loss

**Problem:** Fire, flooding, theft, or another event removes the local server and NAS together.

At that point your local RAID level does not matter. Recovery depends on what exists **outside the building**.

A realistic sequence is:

1. Obtain replacement compute and storage.
2. Restore access to your password manager, domain registrar, DNS provider, Git provider, Tailscale account, and off-site backup account.
3. Rebuild basic networking.
4. Install the OS and Docker.
5. Recover infrastructure definitions from Git.
6. Restore the most critical data first according to your RTO.
7. Restore large media/archive data later if bandwidth makes it slow.
8. Validate and resume normal backups.

This is the scenario the **"1" in 3-2-1** is designed to survive.

---

## ✅ What You Need to Know First

:::tip[ELI5]
A homelab is a graph of dependencies, not a bag of independent containers.
:::

> Restore dependencies before applications.

A homelab is a graph of dependencies, not a bag of independent containers.

The correct recovery sequence generally looks like:

```text
Access
  ↓
Network
  ↓
Storage
  ↓
Compute/runtime
  ↓
Secrets
  ↓
Core infrastructure
  ↓
Databases
  ↓
Applications
  ↓
External access
  ↓
Monitoring and backups
```

Trying to start everything at once usually creates noise rather than recovery.

---

## 🚨 1. First Determine What Actually Failed

:::tip[ELI5]
Do not begin restoring until you understand the failure domain.
:::

Do not begin restoring until you understand the failure domain.

Possible incidents include:

- One deleted file
- One broken application
- Failed application upgrade
- Corrupted database
- Failed SSD/NVMe
- Failed compute host
- Failed NAS
- Lost credentials
- Network equipment failure
- Ransomware
- Theft
- Fire or site loss

Each requires a different response.

Restoring an entire host because one file was deleted creates unnecessary risk.

---

## 🛑 2. Stop Making the Situation Worse

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

Before recovery, preserve what is still good.

Depending on the incident:

- Stop destructive jobs
- Pause synchronization
- Stop automated updates
- Disconnect compromised systems
- Prevent backup pruning
- Preserve logs
- Avoid repeated power cycling of questionable storage
- Do not overwrite the last known-good copy

For suspected compromise, containment comes before convenience.

---

## 🔐 3. Recover Administrative Access First

:::tip[ELI5]
If the infrastructure required to retrieve these credentials is itself down, the recovery design has a circular dependency.
:::

Make sure you still have access to:

- Password manager
- Backup repository credentials
- Git repositories
- Remote-access control plane
- Encryption keys
- Recovery codes
- Storage administration

If the infrastructure required to retrieve these credentials is itself down, the recovery design has a circular dependency.

Break that dependency before disaster—not during it.

---

## 🌐 4. Restore Basic Networking

:::tip[ELI5]
This section walks through getting data or a service back into a working state.
:::

The goal is not to recreate every convenience immediately.

Restore only enough networking to administer the environment safely:

- Internet connectivity if required
- Core LAN connectivity
- DNS
- Secure administrative access
- Required storage connectivity

Network segmentation can be restored afterward if the incident requires temporary simplification.

Public documentation should not contain internal IP addresses, VLAN IDs, private hostnames, or detailed topology.

Your private runbook may contain those details if protected appropriately.

---

## 🏷️ 5. Use Functional Names During Recovery

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

Think in roles rather than hostnames:

```text
primary server
AI workstation
AI orchestration node
bulk NAS
high-speed application storage
DNS primary
DNS secondary
```

This makes the recovery process resilient to hardware replacement.

A dead server should not force the replacement machine to have identical hardware or an identical hostname before services can return.

---

## 🧱 6. Classify Recovery Priorities

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

Not every system needs to return immediately.

A practical tier model is:

### Tier 0 — Recovery foundation

- Password manager access
- Git access
- Backup credentials
- Network
- DNS
- Remote administration

### Tier 1 — Core infrastructure

- Primary server/runtime
- Storage
- Authentication
- Reverse proxy
- Backup system

### Tier 2 — Important personal services

- Documents
- File synchronization
- Home automation
- Critical databases

### Tier 3 — Compute and productivity

- AI inference
- AI orchestration
- Development environments
- Secondary workstations

### Tier 4 — Convenience and replaceable services

- Dashboards
- Download tooling
- Disposable test VMs
- Nonessential automation

The exact order should reflect your real dependencies.

---

## ⏱️ 7. Define RPO and RTO

:::tip[ELI5]
Two concepts make recovery planning concrete.
:::

Two concepts make recovery planning concrete.

### Recovery Point Objective (RPO)

How much recent data can you tolerate losing?

Examples:

```text
6 hours of application changes
24 hours of model changes
1 week of archival media changes
```

### Recovery Time Objective (RTO)

How long can the system remain unavailable?

Examples:

```text
DNS              → 1 hour
primary server   → 8 hours
personal files   → 24 hours
bulk media       → several days
```

A homelab does not need enterprise bureaucracy, but explicit priorities prevent wasted effort during an incident.

---

## 📚 8. Keep the Runbook Outside the Homelab

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

The recovery instructions must survive the event they describe.

Maintain an offline or externally reachable copy of the private runbook containing:

- System roles
- Backup repository locations
- Restore credentials
- Git repository locations
- Storage relationships
- Required recovery keys
- Restore commands
- Important compatibility notes

Do not place plaintext passwords into public documentation.

---

## 🔑 9. Recovery Keys Need Their Own Recovery Plan

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

Protect copies of:

- Backup repository passwords
- Disk-encryption recovery material
- Password-manager emergency information
- Important SSH keys
- API recovery tokens
- Off-site storage credentials

A backup without the key required to decrypt it is not recoverable.

---

## 🧬 10. Recover Infrastructure Definition from Git

:::tip[ELI5]
This section explains how version control helps you review, reproduce, or recover infrastructure configuration.
:::

Git should provide the reproducible structure of the environment:

```text
compose.yaml
.env.example
README.md
scripts/
config templates/
```

After a host failure, Git should answer:

- What stacks existed?
- How were they configured?
- Which directories were expected?
- Which ports or networks were intentional?
- What environment variables are required?
- How should the application be validated?

See [Git-Managed Homelab](/homelab/git-managed-homelab/).

---

## 🔒 11. Recover Secrets Separately

:::tip[ELI5]
This section is about keeping credentials private while still making the system recoverable.
:::

Git should not contain production secrets.

Restore sensitive state from the protected secret source:

- `.env` files
- API keys
- Encryption secrets
- Database passwords
- Service tokens
- Private keys

Do not improvise new secrets during an emergency unless you intentionally plan to rotate them.

Changing credentials mid-restore can break dependencies and make diagnosis harder.

---

## 💾 12. Recover Application State from Backups

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Backups restore what Git cannot recreate:

- Databases
- Uploaded files
- Application-generated configuration
- User state
- Documents
- AI workflows
- Important models

Know the restore method for each stateful application.

Possible patterns include:

```text
filesystem only
filesystem + database
logical database import
application-native import
specific application version first, then upgrade
```

Document this before the failure.

---

## 🗃️ 13. Restore Databases Deliberately

:::tip[ELI5]
This section walks through getting data or a service back into a working state.
:::

A database restore is not simply "copy the folder back."

Prefer application-consistent backups such as:

- PostgreSQL logical dumps
- MariaDB/MySQL logical dumps
- Vendor-supported export/import
- Known-good snapshot procedures

During recovery:

1. Install or start a compatible database version
2. Create the required users/roles
3. Import the dump
4. Check for errors
5. Validate representative data
6. Only then start the dependent application

If an application performed a major schema migration, restoring the application version that matches the backup may be necessary before upgrading again.

---

## 🐳 14. Full Docker Host Rebuild Sequence

:::tip[ELI5]
This section explains how the Docker part of the setup should be configured or operated.
:::

A clean rebuild is generally safer than trying to recreate a dead OS byte-for-byte.

A typical sequence is:

1. Install the operating system
2. Apply updates
3. Configure secure administrative access
4. Install required storage/network tooling
5. Install Docker Engine and Compose
6. Recreate the standard directory structure
7. Clone infrastructure repositories
8. Restore secrets
9. Reconnect required network storage
10. Restore application data
11. Restore databases
12. Start foundational stacks
13. Start dependent applications in groups
14. Validate locally
15. Restore external access
16. Restore monitoring
17. Confirm backups resume

Do not run every Compose project simultaneously and hope dependency failures sort themselves out.

---

## 🐧 15. Rebuild Linux Hosts from Documentation

:::tip[ELI5]
For Linux systems, a documented clean install has several advantages over relying exclusively on disk images: The Fedora, Debian, and Artix guides on this site can form the foundation of that rebuild process.
:::

For Linux systems, a documented clean install has several advantages over relying exclusively on disk images:

- Removes accumulated OS drift
- Avoids restoring obsolete packages
- Confirms the build guide is still valid
- Allows replacement hardware
- Separates operating system from application state

The Fedora, Debian, and Artix guides on this site can form the foundation of that rebuild process.

The private runbook should additionally document any host-specific packages or drivers that matter.

---

## 🤖 16. Recover AI Compute in Layers

:::tip[ELI5]
Restore in that order.
:::

Local AI systems often contain several independently recoverable layers:

```text
OS / GPU driver
container runtime
application configuration
workflows
models
custom nodes / plugins
local datasets
```

Restore in that order.

Do not begin by copying terabytes of models to a machine whose GPU driver or runtime has not been validated.

A better sequence is:

1. Validate GPU hardware
2. Install/validate driver
3. Validate container GPU access
4. Restore application configuration
5. Restore one known-good model
6. Test inference
7. Restore remaining model library

This produces a working system sooner and isolates failures cleanly.

---

## 🧠 17. Decide Which AI Assets Are Critical

:::tip[ELI5]
This section helps you make this choice using practical criteria rather than adding complexity by default.
:::

Not every model needs disaster-level protection.

Prioritize:

- Custom fine-tunes
- Unique conversions
- Custom quantizations
- LoRAs/adapters you created
- Workflows
- Configuration
- Hard-to-find models

Standard upstream models can often be re-downloaded later after the platform is operational.

---

## 🗄️ 18. NAS Failure Requires Failure-Domain Thinking

:::tip[ELI5]
This section covers shared network storage and what must be checked before applications depend on it.
:::

"The NAS failed" can mean many different things:

- One disk failed
- Pool degraded
- Filesystem damage
- Controller failure
- Chassis failure
- Multiple-disk failure
- Accidental deletion
- Entire site loss

Do not treat these as one scenario.

If only the chassis failed and the underlying pool is healthy, recovery may be very different from a pool-level corruption or site-level loss.

---

## 💿 19. RAID Is an Availability Tool

:::tip[ELI5]
RAID can allow a storage system to remain available through certain disk failures.
:::

RAID can allow a storage system to remain available through certain disk failures.

It does not replace:

- Versioned backups
- Independent copies
- Off-site recovery

If a command deletes a directory, RAID will faithfully preserve the deletion across all participating disks.

---

## 🌍 20. Off-Site Recovery Is for Site-Level Failure

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

The off-site copy exists for events that destroy both the live storage and local backups.

Examples:

- Fire
- Flood
- Theft
- Electrical catastrophe
- Ransomware affecting local storage
- Catastrophic NAS loss

For very large media/archive datasets, off-site recovery may be slow.

That is acceptable if the recovery objective is preservation rather than immediate availability.

---

## 📡 21. Understand Bulk-Restore Time

:::tip[ELI5]
This section walks through getting data or a service back into a working state.
:::

A massive off-site dataset may require days or weeks to restore over a WAN connection.

Before disaster:

- Know approximate dataset size
- Know sustainable link speed
- Know provider limits
- Know whether physical disk shipment is possible
- Know which data must return first

Prioritize irreplaceable or frequently used data before bulk media.

---

## 🔄 22. Do Not Restore Synchronization Too Early

:::tip[ELI5]
This section walks through getting data or a service back into a working state.
:::

Synchronization systems can propagate mistakes quickly.

After a data-loss incident:

1. Stop sync clients
2. Restore the authoritative dataset
3. Validate it
4. Re-enable synchronization deliberately

Otherwise an old client may reconnect and reintroduce deletion or stale state into the freshly restored system.

---

## 🦠 23. Ransomware Recovery Requires Isolation

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

If compromise is suspected:

- Disconnect affected systems
- Preserve evidence where useful
- Do not immediately reconnect backup repositories
- Rotate compromised credentials
- Restore from a recovery point before the compromise
- Validate the restored environment before reconnecting clients

A clean backup restored into a still-compromised environment can simply be encrypted again.

---

## 🧯 24. Failed Upgrade Recovery

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

Not every disaster is hardware.

A bad application upgrade can be one of the most common homelab incidents.

Before major upgrades:

1. Commit infrastructure changes
2. Confirm current backups
3. Read upstream migration notes
4. Record the running version
5. Back up the database
6. Upgrade one layer at a time
7. Validate before pruning old images/backups

If rollback is required, remember:

> Rolling back `compose.yaml` does not necessarily roll back the database schema.

Database compatibility must be checked explicitly.

---

## 🧰 25. Single-File Recovery

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

For accidental deletion, use the smallest recovery scope possible.

Workflow:

1. Identify the last known-good snapshot
2. Restore the file to a temporary path
3. Inspect contents
4. Compare metadata/permissions if relevant
5. Copy it into production

Do not restore an entire application dataset to recover one document.

---

## 📁 26. Directory Recovery

:::tip[ELI5]
This section is about where files should live so you can find, back up, and rebuild them consistently.
:::

For a deleted or corrupted directory:

1. Stop the application if it may write to the same path
2. Restore to a temporary location
3. Compare with current data
4. Decide whether to merge or replace
5. Preserve anything newer that remains valid
6. Restore ownership and permissions
7. Start the application
8. Validate

Recovery should minimize additional data loss.

---

## 🧪 27. Restore Into Isolation Whenever Possible

:::tip[ELI5]
This section walks through getting data or a service back into a working state.
:::

Use a scratch directory, test VM, spare machine, or isolated container for recovery testing.

This allows you to answer:

- Does the backup decrypt?
- Do files restore?
- Does the database import?
- Does the application start?

without risking the live system.

---

## ✅ 28. Validate the Application, Not the Container

:::tip[ELI5]
Containers are replaceable application instances; this section explains how to operate them without losing persistent state.
:::

A container reporting `healthy` is only infrastructure-level evidence.

After restoration, verify:

- Authentication works
- Expected records exist
- Recent data exists
- Uploaded files open
- Search/indexing works where relevant
- Background jobs run
- External integrations reconnect
- Permissions are correct
- Backup jobs resume

"Container is green" is not a restore test.

---

## 🔍 29. Validate Data Recency

:::tip[ELI5]
Recovery is incomplete if the restored data is unexpectedly old.
:::

Recovery is incomplete if the restored data is unexpectedly old.

Check representative timestamps or recent records:

```text
latest document
latest database entry
latest configuration change
latest AI workflow
latest uploaded file
```

Compare them with the expected RPO.

---

## 🩺 30. Restore Monitoring Last—but Do Restore It

:::tip[ELI5]
This section walks through getting data or a service back into a working state.
:::

Monitoring is not required to start the first application, so it comes after foundational services.

But do not forget it.

After recovery, re-enable monitoring for:

- Host reachability
- Storage health
- Backup freshness
- Application availability
- Disk capacity
- Failed jobs

Otherwise the environment may recover while silently losing its safety net.

---

## 💾 31. Confirm Backups Resume After Recovery

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

A recovered application that is no longer backed up creates the next incident.

After restoration:

1. Confirm repository connectivity
2. Run or wait for a new snapshot
3. Confirm success
4. Verify retention policy
5. Confirm off-site workflows where applicable

Treat this as part of the recovery, not a future maintenance task.

---

## 🧪 32. Run Small Restore Tests Frequently

:::tip[ELI5]
This section walks through getting data or a service back into a working state.
:::

Monthly or quarterly, restore representative data:

- One document
- One directory
- One database dump
- One application stack
- One AI workflow or model artifact

This tests different recovery paths instead of assuming one successful file restore validates everything.

---

## 🧱 33. Run a Full Rebuild Drill Periodically

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

A larger drill can use spare hardware or a VM.

Simulate:

```text
The primary server is completely gone.
```

Then:

1. Install a clean OS
2. Install Docker
3. Clone infrastructure configuration
4. Restore one stack's secrets
5. Restore its database/data
6. Start it
7. Validate access
8. Confirm a new backup can be made

Record every missing instruction.

The test is successful when the documentation improves—not when you manage to muddle through from memory.

---

## 📋 34. Full Host Recovery Checklist

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

```text
[ ] Identify failure scope
[ ] Contain destructive activity
[ ] Recover administrative credentials
[ ] Restore basic network access
[ ] Confirm storage availability
[ ] Install clean operating system
[ ] Patch system
[ ] Install container/runtime tooling
[ ] Clone infrastructure repositories
[ ] Restore protected secrets
[ ] Restore application data
[ ] Restore database dumps
[ ] Start foundational services
[ ] Start dependent services
[ ] Validate application behavior
[ ] Restore remote access/reverse proxy
[ ] Restore monitoring
[ ] Confirm new backups complete
[ ] Update documentation
```

---

## 🌐 35. Site-Loss Recovery Checklist

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

For loss of the entire local environment:

```text
[ ] Secure replacement location/hardware
[ ] Recover password-manager access
[ ] Recover Git repositories
[ ] Recover backup repository credentials
[ ] Re-establish minimum network
[ ] Bring up critical compute
[ ] Restore critical personal data first
[ ] Restore application infrastructure
[ ] Restore databases
[ ] Restore selected services
[ ] Begin bulk off-site data recovery
[ ] Validate data integrity
[ ] Recreate local backup protection
[ ] Replace lost off-site redundancy if needed
```

Bulk media can wait behind critical documents and infrastructure.

---

## 📝 36. Record What Happened

:::tip[ELI5]
After an incident, document: This turns an outage into useful operational knowledge.
:::

After an incident, document:

- What failed
- When it failed
- What detected it
- What data was affected
- Which recovery point was used
- How long recovery took
- Which instructions were missing
- Which credentials were difficult to locate
- Which dependencies surprised you

This turns an outage into useful operational knowledge.

---

## 🔐 37. Rotate Credentials After Suspected Compromise

:::tip[ELI5]
Do this in a controlled order so dependent services can be updated deliberately.
:::

If the incident may involve unauthorized access:

Rotate affected:

- Passwords
- API tokens
- SSH keys
- Backup credentials
- Database credentials
- Session secrets

Do this in a controlled order so dependent services can be updated deliberately.

---

## 🔁 38. Fix the Design Weakness After Recovery

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

Do not simply return to the same architecture that made the incident painful.

Examples:

- Missing database dump → add one
- Backup password hard to find → improve credential documentation
- Restore took too long → change retention or staging strategy
- One NAS was a single point of failure → add independent protection
- Important model was not backed up → change AI backup policy
- Documentation was stale → update it in the same recovery task

A disaster-recovery event should improve the system.

---

## 🚫 39. Common Disaster-Recovery Mistakes

:::tip[ELI5]
This section is about getting from a failure back to a verified working system.
:::

Avoid these:

- Restoring before understanding what failed
- Starting every service simultaneously
- Reconnecting sync clients too early
- Assuming RAID equals backup
- Restoring an incompatible database/application combination
- Keeping the only recovery keys inside the failed environment
- Forgetting to validate restored data
- Forgetting to restart backups
- Recovering bulk media before irreplaceable documents
- Treating an off-site copy as instantly available
- Relying on memory instead of written procedures
- Publishing private topology in public documentation

---

## 🔗 Related Guides

:::tip[ELI5]
This section explains related guides in practical terms and what it changes in the homelab.
:::

- [Backup Architecture & Recovery](/homelab/backup-and-recovery/)
- [Git-Managed Homelab](/homelab/git-managed-homelab/)
- [Docker Infrastructure Standards](/homelab/docker-infrastructure-standards/)
- [NAS Mounting](/homelab/nas-mounting/)
- [Linux Post-Install Baseline](/linux/post-install-baseline/)

---

## ✅ What to Remember

:::tip[ELI5]
This is the short version to keep in mind after you finish the page.
:::

The goal of disaster recovery is not to prevent every failure.

That is impossible.

The goal is to make failure:

> **contained, documented, predictable, and recoverable.**

When the hardware can disappear and the environment can still be rebuilt from known sources of truth, the homelab has become an engineered system rather than a collection of machines.
