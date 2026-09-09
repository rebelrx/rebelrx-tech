---
title: "🐳 Docker Infrastructure Standards"
description: >-
  A practical standard for clean, reproducible Docker Compose homelabs: directory layout, stack structure, environment files, documentation, validation, secrets, updates, backups, and recovery.
---
Once Docker is installed, the next challenge is keeping dozens of services understandable. This guide is the operating standard I use for that: predictable directories, one Compose definition per stack, safe environment-variable handling, useful README files, Git review, deliberate upgrades, and recoverable application data.

:::tip[ELI5]
Docker runs the containers. **Docker Compose is the instruction sheet** that tells Docker which containers belong together, which ports they use, what storage they need, and which settings they receive. This page is about keeping those instruction sheets and their data organized so the homelab does not become a pile of one-off setups.
:::

## 🧩 What Docker Compose Is

:::tip[ELI5]
This section explains the saved configuration Docker uses to recreate the stack consistently.
:::

A Compose file is a human-readable YAML file—normally `compose.yaml`—that describes a complete application stack. Instead of typing a very long `docker run` command and trying to remember it later, you save the configuration as code.

For example:

```yaml
name: example

services:
  app:
    image: example/app:1.2.3
    ports:
      - "8080:8080"
    volumes:
      - /opt/docker/data/example:/config
    restart: unless-stopped
```

Then you operate it with commands such as:

```bash
docker compose up -d
docker compose ps
docker compose logs -f
docker compose down
```

The exact application changes; the workflow stays the same.

## 🧭 How to Use This Page

:::tip[ELI5]
If you are building a new Docker host, work through the numbered sections in order.
:::

If you are building a new Docker host, work through the numbered sections in order. If you already have a working homelab, use them as an audit checklist and adopt improvements gradually rather than rewriting everything at once.

The desired end state is simple:

```text
Git-managed stack definition
        +
local secrets (.env)
        +
separate persistent application data
        ↓
reproducible Docker stack
```

---

## ✅ What You Need to Know First

:::tip[ELI5]
Those three categories should remain separate.
:::

> Containers are disposable. Configuration is reproducible. Data is durable.

Those three categories should remain separate.

A healthy Docker environment should allow you to:

- Rebuild a host without reconstructing its configuration from memory
- Recreate any stack from Git plus its `.env` file
- Restore application state from backup without restoring container images
- Understand a stack months later without reverse-engineering it
- Review every infrastructure change before it reaches production
- Move a stack between compatible Docker hosts with minimal rework

If a service exists only because someone clicked through a GUI once, it is not yet reproducible infrastructure.

---

## 🚀 Clone the RebelRx Homelab Repo

:::tip[ELI5]
For reference, you can clone the entire RebelRx Homelab Repo, available at GitHub, and then follow along step-by-step.
:::

```bash
cd ~
git clone https://github.com/rebelrx/rebelrx-homelab.git
```

> This repo provides **real-world Compose templates** used in production, one
> directory per stack, each with a filled-in `README.md`.

Use the public repository as a template source. Review the current stack README and create your own private deployment repository at `/opt/docker/stacks/`, as described in [Git-Managed Homelab](/homelab/git-managed-homelab/). Copying a template is initial setup, not an ongoing synchronization strategy:

```bash
sudo mkdir -p /opt/docker/stacks
sudo cp -a ~/rebelrx-homelab/stacks/npm /opt/docker/stacks/
```

---

## 📁 1. Standard Directory Layout

:::tip[ELI5]
This section is about where files should live so you can find, back up, and rebuild them consistently.
:::

Use separate trees for **stack definitions** and **persistent application data**:

```text
/opt/docker/stacks/<stack>/
/opt/docker/data/<stack>/
```

For example:

```text
/opt/docker/
├── stacks/
│   ├── app-one/
│   │   ├── compose.yaml
│   │   ├── .env
│   │   ├── .env.example
│   │   └── README.md
│   ├── app-two/
│   └── monitoring/
└── data/
    ├── app-one/
    ├── app-two/
    └── monitoring/
```

### `stacks`

The `stacks` tree contains declarative configuration:

- `compose.yaml`
- `.env.example`
- Local `.env` file, ignored by Git
- `README.md`
- Optional configuration templates
- Optional helper scripts
- Optional application-specific static configuration

This tree should be small, human-readable, and version controlled.

### `data`

The `data` tree contains runtime state:

- Databases
- Application state
- Uploaded content
- Generated configuration
- Indexes
- Persistent caches when genuinely required

Runtime data does **not** belong in Git.

:::tip
Keeping configuration and data separate makes backup policy, restores, migrations, Git review, and disaster recovery significantly easier.
:::

---

## 🧱 2. One Directory Per Operational Stack

:::tip[ELI5]
This section is about where files should live so you can find, back up, and rebuild them consistently.
:::

Each independently managed application belongs in its own directory:

```text
stacks/
├── actualbudget/
├── adguardhome/
├── authentik/
├── books/
├── monitoring/
└── paperless/
```

A stack is an **operational unit**, not necessarily a single container.

For example, an application may legitimately contain:

- Web application
- Database (e.g., PostgreSQL)
- Cache (e.g., Redis)
- Worker
- Scheduler

If those services are deployed, upgraded, backed up, and recovered together, they belong in the same stack.

Avoid creating artificial separation merely because a Compose file contains multiple services.

---

## 📄 3. Use `compose.yaml`

:::tip[ELI5]
This section explains the saved configuration Docker uses to recreate the stack consistently.
:::

Use one filename consistently:

```text
compose.yaml
```

Avoid mixing:

```text
docker-compose.yml
docker-compose.yaml
compose.yml
compose.yaml
```

Docker Compose supports several names, but operational consistency is more valuable than flexibility here.

A predictable filename simplifies:

- Documentation
- Shell commands
- Automation
- Validation
- Repository searches
- Migrations between hosts

> 💡 For more information on Docker Compose, refer to the official [Docker Docs](https://docs.docker.com/compose/)

---

## 🏷️ 4. Give Every Stack a Stable Project Name

:::tip[ELI5]
Use a top-level Compose `name:`: This makes the Compose project identity explicit instead of relying on whatever directory name happens to contain the file.
:::

Use a top-level Compose `name:`:

```yaml
name: paperless
```

This makes the Compose project identity explicit instead of relying on whatever directory name happens to contain the file.

It also keeps generated resources predictable:

```text
paperless_default
paperless_postgres
paperless_redis
```

Choose names that are:

- Short
- Lowercase
- Stable
- Descriptive
- Unique on the host

Do not rename mature stacks casually. A project-name change can create new networks, containers, and volume associations even when the underlying application did not change.

---

## 📛 5. Container Names: Be Consistent, Not Dogmatic

:::tip[ELI5]
Containers are replaceable application instances; this section explains how to operate them without losing persistent state.
:::

Explicit container names are acceptable when a stable name is operationally useful:

```yaml
container_name: paperless-webserver
```

They can help with:

- Human-readable logs
- Monitoring
- Administration
- External tooling
- Established operational workflows

Compose-generated names are also valid and can be preferable when:

- Running multiple copies of the same project
- Testing alternate stacks
- Avoiding global naming collisions

The standard is therefore not "always use `container_name`" or "never use it."

The standard is:

> **Use a consistent naming model and document deliberate exceptions.**

Do not churn known-good Compose wiring purely to satisfy stylistic preferences.

---

## 🧾 6. `.env.example` Is Part of the Documentation

:::tip[ELI5]
This section explains how to keep configurable values documented while keeping real secrets out of Git.
:::

Every stack that uses environment variables should include:

```text
.env.example
```

The real `.env` file stays local and must be ignored by Git.

A good `.env.example` is not merely a list of variable names. It should serve as an **operator-facing configuration reference**.

### Standard format

Use a prominent title block:

```dotenv
# =============================================================================
# Example Application - Environment Configuration
# =============================================================================
#
# Copy this file before deployment:
#   cp .env.example .env
#   chmod 600 .env
#
# Review every value before starting the stack.
# Never commit the production .env file.
#
```

Then group related settings with clear section dividers:

```dotenv
# -----------------------------------------------------------------------------
# General
# -----------------------------------------------------------------------------

TZ=America/New_York
PUID=1000
PGID=1000

# -----------------------------------------------------------------------------
# Volume Paths
# -----------------------------------------------------------------------------

APP_CONFIG_PATH=/opt/docker/data/example/config
APP_DATA_PATH=/opt/docker/data/example/data

# -----------------------------------------------------------------------------
# Authentication
# -----------------------------------------------------------------------------

# Generate a long random value for production.
APP_SECRET=
```

### `.env.example` rules

A production-quality example should:

- Preserve the same variable order used by the stack
- Use uppercase variable names
- Group related values into clearly labeled sections
- Include blank lines between logical groups
- Explain every non-obvious setting
- Include safe defaults where appropriate
- Leave credentials and secrets blank
- Explain how a secret should be generated when useful
- Document expected path formats
- Call out required versus optional settings
- Preserve intentionally unused reference values when they are helpful

If a value is included for documentation but is **not consumed by Compose**, say so explicitly:

```dotenv
# -----------------------------------------------------------------------------
# Reference Only - Not Consumed by compose.yaml
# -----------------------------------------------------------------------------

# Used when configuring the application through its own web interface.
EXAMPLE_REFERENCE_VALUE=
```

This avoids one of the most common sources of configuration confusion: a variable existing in `.env` while doing nothing at deployment time.

---

## 🔄 7. Keep `.env.example`, `compose.yaml`, and README in Sync

:::tip[ELI5]
This section explains the saved configuration Docker uses to recreate the stack consistently.
:::

Configuration drift is one of the easiest ways to make an otherwise clean repository unreliable.

When adding, renaming, or removing an environment variable, review all three files:

```text
compose.yaml
.env.example
README.md
```

A variable should not be:

- Required by Compose but missing from `.env.example`
- Documented in the README but no longer used
- Renamed in one file and not the others
- Given conflicting defaults in different places

Treat those three files as a single interface.

---

## 🔐 8. Secrets Never Belong in Git

:::tip[ELI5]
This section is about keeping credentials private while still making the system recoverable.
:::

Do not commit:

- Passwords
- API keys
- Access tokens
- OAuth secrets
- Private keys
- Database credentials
- Recovery keys
- Session secrets
- Production `.env` files

The repository contains **templates and instructions**, not production credentials.

A basic `.gitignore` should include:

```text
.env
.env.*
!.env.example
```

Adjust this when a project intentionally tracks additional example files.

Before every commit, inspect what is actually staged:

```bash
git diff --cached
```

Secret scanners are useful guardrails, but they do not replace human review.

:::caution
If a real secret is committed, removing it from the latest file is not enough. Assume the value is compromised, rotate it, then clean repository history if necessary.
:::

---

## 🧩 9. Standard Compose Structure

:::tip[ELI5]
This section explains the saved configuration Docker uses to recreate the stack consistently.
:::

A simple stack should be easy to scan from top to bottom.

Example:

```yaml
name: example

services:
  app:
    image: ghcr.io/example/app:${APP_TAG:-1.2.3}
    container_name: example-app
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - TZ=${TZ}
    volumes:
      - ${APP_CONFIG_PATH}:/config
    ports:
      - "8080:8080"
```

For larger stacks, keep related settings grouped consistently:

1. Image / build
2. Container name
3. Restart behavior
4. Commands
5. Dependencies
6. Environment
7. Volumes
8. Devices / GPU
9. Ports
10. Networks
11. Healthcheck
12. Other service-specific settings

Exact ordering is less important than **repository-wide consistency**.

---

## 🛠️ 10. Preserve Known-Good Wiring

:::tip[ELI5]
Do not rewrite a working Compose file merely because another syntax is newer, shorter, or more fashionable.
:::

Do not rewrite a working Compose file merely because another syntax is newer, shorter, or more fashionable.

Examples of things that may be deliberate:

- Fixed container-internal paths
- Existing GPU reservation syntax
- A specific healthcheck command
- An intentionally omitted `security_opt`
- A fixed network name
- A reserved host port
- Application-specific dependency behavior

Change infrastructure because there is a functional, security, compatibility, or maintainability benefit — not because YAML can be made prettier.

This is especially important when auditing many stacks at once. Large cosmetic rewrites increase risk and make meaningful changes harder to review.

---

## 🏷️ 11. Image Tags: Pin Deliberately

:::tip[ELI5]
Choose an update model intentionally.
:::

Choose an update model intentionally.

### Exact version

```yaml
image: vendor/app:1.2.3
```

Best when:

- The service is critical
- Upgrades can include migrations
- Rollback planning matters
- You want explicit change control

### Release channel

```yaml
image: vendor/app:1.2
```

Reasonable when the project maintains stable channel tags responsibly.

### Floating tag

```yaml
image: vendor/app:latest
```

Reasonable only when you knowingly accept new upstream builds during pulls.

### Variable-driven tag

For repositories where version changes should be easy to audit:

```yaml
image: vendor/app:${APP_TAG:-1.2.3}
```

with:

```dotenv
APP_TAG=1.2.3
```

This makes the deployed version obvious without editing the Compose file itself.

There is no universal tag strategy. The problem is **unintentional** upgrade behavior.

---

## 🔁 12. Restart Policies

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

For normal long-running services:

```yaml
restart: unless-stopped
```

is a good default.

Do not apply it blindly to:

- Database migration jobs
- One-shot initialization containers
- Backup jobs
- Import/export tasks
- Containers expected to exit after successful completion

A one-time job that restarts forever is not resilience; it is a configuration error.

---

## ❤️ 13. Healthchecks Should Test Something Real

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

A container being `running` does not mean its application is usable.

Good healthchecks test something meaningful:

- HTTP health endpoint
- Application CLI status
- Database readiness
- Local socket availability

Example:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 30s
```

Avoid healthchecks that exist only to make a dashboard green.

---

## ⏳ 14. `depends_on` Does Not Automatically Mean "Ready"

:::tip[ELI5]
means Compose starts the dependency first.
:::

Basic start ordering:

```yaml
depends_on:
  - postgres
```

means Compose starts the dependency first. It does **not** guarantee that PostgreSQL is ready to accept connections.

For services that require dependency readiness, combine a meaningful healthcheck with:

```yaml
depends_on:
  postgres:
    condition: service_healthy
```

The dependency must actually define a valid healthcheck.

---

## 💾 15. Persistent Storage

:::tip[ELI5]
This section explains how to keep storage usable, observable, and recoverable as the homelab grows.
:::

Prefer explicit host paths for application data you administer directly:

```yaml
volumes:
  - /opt/docker/data/example:/config
```

Benefits include:

- Easy location discovery
- Straightforward backup policy
- Simple host migrations
- Clear restore procedures
- No need to inspect Docker volume metadata to find state

Named volumes remain valid when they are the better fit for a particular application. What matters is knowing where durable state lives and how it is backed up.

### Database caution

Do not place database files on NFS or SMB merely because shared storage is available.

SQLite in particular can behave poorly on network filesystems unless the application explicitly supports that configuration.

Keep latency-sensitive or locking-sensitive application state local when required, and back it up separately.

---

## 🗄️ 16. Treat Network Storage as a Dependency

:::tip[ELI5]
This section explains how to keep storage usable, observable, and recoverable as the homelab grows.
:::

If a stack relies on NFS or another remote filesystem, document that dependency.

The README should state:

- Which class of data lives remotely
- Whether the mount must exist before deployment
- What happens if the storage target is unavailable
- Whether the application tolerates delayed storage availability

Do not let Docker silently create a local directory where a missing mount was expected. That can make an application appear healthy while writing data to the wrong filesystem.

A simple pre-deployment check can prevent this:

```bash
mountpoint -q /path/to/mount || {
  echo "Required storage is not mounted"
  exit 1
}
```

Use generic documented mount roles in public repositories rather than exposing private storage topology.

---

## 🚪 17. Publish Only the Ports You Need

:::tip[ELI5]
Do not expose a host port merely because the upstream example does.
:::

Do not expose a host port merely because the upstream example does.

For every published port, decide whether the service should be reachable from:

- Localhost only
- The trusted LAN
- A secure overlay network such as Tailscale
- A reverse proxy
- The public Internet

Example localhost-only binding:

```yaml
ports:
  - "127.0.0.1:8080:8080"
```

Administrative interfaces should be bound as narrowly as practical.

If two containers only communicate with one another, they usually do not need host ports at all.

---

## 🕸️ 18. Use Compose Networks for Internal Communication

:::tip[ELI5]
This section explains the saved configuration Docker uses to recreate the stack consistently.
:::

Containers in the same Compose network can communicate using service names:

```text
postgres:5432
redis:6379
```

Do not hard-code private host IP addresses into application configuration when Docker's internal DNS can solve the same problem.

Example:

```yaml
services:
  app:
    environment:
      DATABASE_HOST: postgres

  postgres:
    image: postgres:18
```

This keeps stacks portable between Docker hosts.

---

## 🌐 19. External Networks Should Be Explicit

:::tip[ELI5]
This section covers a network dependency or boundary you should understand before adding more complexity.
:::

Some environments use shared reverse-proxy or infrastructure networks.

If a stack attaches to one, document it clearly:

```yaml
networks:
  proxy:
    external: true
```

The README should state that the network must already exist.

Create shared infrastructure deliberately rather than relying on undocumented host state.

---

## 🔑 20. Environment Variables vs Compose Secrets

:::tip[ELI5]
This section explains the saved configuration Docker uses to recreate the stack consistently.
:::

`.env` files are practical for homelabs, but they are not encrypted secret stores.

Use them with appropriate filesystem permissions:

```bash
chmod 600 .env
```

For applications that support file-based credentials or Docker secrets cleanly, those approaches may reduce accidental exposure through environment inspection.

Regardless of mechanism:

- Do not commit secrets
- Limit permissions
- Avoid printing credentials in logs
- Rotate leaked values immediately
- Document how recovery-critical secrets are backed up

---

## 🧠 21. GPU Workloads Must Be Explicit

:::tip[ELI5]
This section focuses on the GPU-specific measurements or decisions that matter for local AI workloads.
:::

On GPU hosts, document accelerator requirements rather than assuming future-you will remember them.

Record:

- Whether a GPU is required
- Which device class is expected
- VRAM requirements
- Driver/runtime prerequisites
- Any device reservation or visibility settings
- Whether the workload may share a GPU safely

Example:

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

On multi-GPU hosts, explicit allocation prevents unrelated workloads from unexpectedly competing for the same device.

See [Self-Hosted AI](/homelab/self-hosted-ai/) for the broader architecture.

---

## 📊 22. Resource Limits Are a Tool, Not a Requirement

:::tip[ELI5]
Do not add CPU and memory limits to every service simply because Compose supports them.
:::

Do not add CPU and memory limits to every service simply because Compose supports them.

Limits make sense when:

- A process can starve the host
- A service has demonstrated runaway behavior
- Multiple heavy workloads compete for resources
- A GPU must be reserved explicitly
- Capacity isolation has a real operational purpose

They are not a substitute for monitoring or understanding workload behavior.

---

## 📚 23. README Files Should Be Operational Manuals

:::tip[ELI5]
Every stack should have a detailed `README.md`.
:::

Every stack should have a detailed `README.md`.

A one-paragraph description and a `docker compose up -d` command are not sufficient for infrastructure you may need to recover later.

### Recommended README structure

```markdown
# Stack Name

Short description of the stack and its purpose.

## Overview

:::tip[ELI5]
What it does, where it fits, and any important design decisions.
:::

What it does, where it fits, and any important design decisions.

## Services

:::tip[ELI5]
Containers included in the stack and their roles.
:::

Containers included in the stack and their roles.

## Prerequisites

:::tip[ELI5]
Required storage, networks, devices, accounts, directories, or host configuration.
:::

Required storage, networks, devices, accounts, directories, or host configuration.

## Directory Layout

:::tip[ELI5]
This section is about where files should live so you can find, back up, and rebuild them consistently.
:::

Persistent paths and stack files.

## Environment Configuration

:::tip[ELI5]
Variables the operator must review.
:::

Variables the operator must review.

## Networking

:::tip[ELI5]
This section covers a network dependency or boundary you should understand before adding more complexity.
:::

Published ports, internal service communication, reverse-proxy requirements, or external networks.

## Deployment

:::tip[ELI5]
Exact setup and startup commands.
:::

Exact setup and startup commands.

## Validation

:::tip[ELI5]
Commands or health checks that confirm successful deployment.
:::

Commands or health checks that confirm successful deployment.

## Updates

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

Safe upgrade procedure and version-specific cautions.

## Backup and Restore

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

What must be protected and how the service is recovered.

## Troubleshooting / Notes

:::tip[ELI5]
Work through these checks in order so you isolate the failing layer instead of changing several things at once.
:::

Known application-specific issues, exceptions, or non-obvious behavior.
```

The exact headings may vary, but every README should answer these questions:

1. What does this stack do?
2. Which containers are included?
3. What must exist before deployment?
4. Which directories contain persistent state?
5. Which ports are exposed, and why?
6. Which variables must be configured?
7. How is it deployed?
8. How do you verify it is healthy?
9. How is it upgraded?
10. What must be backed up?
11. How is it restored?
12. What unusual decisions or constraints must be preserved?

A README should be detailed enough that **future-you can recover the application without reconstructing the original thought process**.

---

## 📝 24. Document Exceptions Instead of "Fixing" Them

:::tip[ELI5]
Real infrastructure accumulates exceptions for legitimate reasons.
:::

Real infrastructure accumulates exceptions for legitimate reasons.

Examples:

- A specific application requires host networking
- A GPU service needs shared memory increased
- An upstream image expects a fixed internal path
- One service must start after a migration step
- A database cannot live on shared storage
- An application requires a particular UID/GID model

Do not hide those exceptions.

Explain them in the README and, where useful, directly in `compose.yaml`:

```yaml
# Required by the application for large model loading.
shm_size: 2gb
```

A documented exception is maintainable. An unexplained workaround becomes technical debt.

---

## ✅ 25. Validate Compose Before Deployment

:::tip[ELI5]
This section explains the saved configuration Docker uses to recreate the stack consistently.
:::

Validate without printing resolved secrets when only a pass/fail result is needed:

```bash
docker compose config --quiet
```

This catches many common problems before Docker changes anything:

- Invalid YAML
- Missing variables
- Malformed interpolation
- Duplicate keys
- Invalid Compose structure

For a stack that uses an alternate environment file during testing:

```bash
docker compose --env-file .env.example config --quiet
```

Use `docker compose config` without `--quiet` only for a private, deliberate review; its resolved output may contain credentials. Do not paste it into public logs or issue reports. Missing variables only become hard failures when declared required, for example `${APP_SECRET:?Set APP_SECRET}`.

Do not assume a YAML file is valid because it looks correct in an editor.

---

## 🧪 26. Repository-Wide Pre-Commit Validation

:::tip[ELI5]
A stack repository should automatically catch common mistakes before commit.
:::

A stack repository should automatically catch common mistakes before commit.

A practical baseline includes:

- End-of-file fixer
- Trailing-whitespace removal
- YAML validation
- Merge-conflict detection
- Private-key detection
- Large-file detection
- Secret scanning

Example `.pre-commit-config.yaml` pattern:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: <pinned-version>
    hooks:
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: check-yaml
      - id: check-merge-conflict
      - id: detect-private-key
      - id: check-added-large-files

  - repo: https://github.com/Yelp/detect-secrets
    rev: <pinned-version>
    hooks:
      - id: detect-secrets
        args: ["--baseline", ".secrets.baseline"]
```

Pin hook versions deliberately rather than copying an old example indefinitely.

Install hooks once per clone:

```bash
pre-commit install
```

Run everything manually when performing larger audits:

```bash
pre-commit run --all-files
```

If a hook modifies a file, review the change, stage it again, and rerun validation.

---

## ↩️ 27. Enforce Predictable Line Endings

:::tip[ELI5]
Infrastructure repositories often move between Linux, Windows, and editors with different defaults.
:::

Infrastructure repositories often move between Linux, Windows, and editors with different defaults.

A simple `.gitattributes` baseline can keep text files consistent:

```text
* text=auto eol=lf
```

This prevents meaningless CRLF/LF churn in Compose files, scripts, environment examples, and READMEs.

---

## 🔎 28. Review Changes Before Staging

:::tip[ELI5]
The second check is especially important for infrastructure repositories because a single accidental secret, port change, or volume-path typo can have real consequences.
:::

Before committing:

```bash
git status
git diff
```

After staging:

```bash
git diff --cached
```

These answer different questions:

- `git diff` — what have I changed?
- `git diff --cached` — what am I actually about to commit?

The second check is especially important for infrastructure repositories because a single accidental secret, port change, or volume-path typo can have real consequences.

---

## 🌿 29. Standard Git Change Workflow

:::tip[ELI5]
This section explains how version control helps you review, reproduce, or recover infrastructure configuration.
:::

A disciplined change sequence looks like:

```bash
cd /opt/docker/stacks

git status
git diff
pre-commit run --all-files

git add <files>
git diff --cached

git commit -m "Update <stack>"
git push
```

For a change affecting only one or two files, you can validate those files directly first:

```bash
pre-commit run --files path/to/compose.yaml path/to/.env.example
```

See [Git-Managed Homelab](/homelab/git-managed-homelab/) for the complete repository workflow.

---

## 🚀 30. Deployment Workflow

:::tip[ELI5]
For a new stack, do not call the deployment complete merely because the container started.
:::

For a new or changed stack:

```bash
cd /opt/docker/stacks/<stack>
```

Review configuration:

```bash
docker compose config --quiet
```

Pull images deliberately:

```bash
docker compose pull
```

Deploy:

```bash
docker compose up -d
```

Inspect status:

```bash
docker compose ps
```

Review logs:

```bash
docker compose logs --tail=100
```

For a new stack, do not call the deployment complete merely because the container started. Verify the application itself.

---

## ⬆️ 31. Upgrade Workflow

:::tip[ELI5]
10. Review logs for migration or startup errors.
:::

A normal update should be deliberate:

```bash
cd /opt/docker/stacks/<stack>

docker compose pull
docker compose config --quiet
docker compose up -d
docker compose ps
docker compose logs --tail=100
```

Before upgrading a stateful application:

1. Read upstream release notes
2. Check for breaking configuration changes
3. Check for database migrations
4. Confirm backup coverage
5. Note the currently deployed version
6. Pull the new image
7. Validate the rendered Compose configuration
8. Deploy
9. Confirm application health
10. Review logs for migration or startup errors

If an application performs irreversible schema migrations, simply restoring the previous container image may **not** constitute a rollback.

---

## 🛑 32. Do Not Blindly Auto-Update Production Services

:::tip[ELI5]
Follow these steps in order, verify the result, and only then move to the next part of the setup.
:::

Automatic image updaters are convenient, but they remove the review window where you would normally:

- Read release notes
- Review breaking changes
- Confirm backups
- Check migrations
- Validate compatibility
- Decide when downtime is acceptable

Automation is excellent for **detecting** available updates.

Blindly replacing every running service because a new image exists is a different operational model and should be chosen consciously.

For important stateful services, manual or approval-based upgrades remain the safer default.

---

## 💾 33. Back Up State, Not Container Images

:::tip[ELI5]
Containers are replaceable application instances; this section explains how to operate them without losing persistent state.
:::

Container images can normally be downloaded again.

The valuable assets are:

- Persistent application data
- Databases
- Database dumps where appropriate
- Application configuration
- Encryption keys
- Recovery keys
- Certificates when not automatically reproducible
- Uploaded files
- Model/configuration state that would be costly to recreate

Do not waste backup capacity protecting replaceable image layers unless you have a specific offline-recovery requirement.

---

## 🛡️ 34. Git and Backups Protect Different Things

:::tip[ELI5]
This section explains what should be protected and how to make sure it can actually be restored.
:::

Git protects **declarative configuration**:

```text
compose.yaml
.env.example
README.md
scripts
configuration templates
```

Your backup system protects **runtime state**:

```text
/opt/docker/data/...
real .env files where appropriate
database dumps
application keys
other recovery-critical state
```

Neither replaces the other.

A Git repository without application data cannot restore a stateful service.

A backup of runtime data without Compose definitions and documentation can be equally painful to recover.

---

## 🧭 35. Define What Must Be Recreated vs Restored

:::tip[ELI5]
This section walks through getting data or a service back into a working state.
:::

Every stack should fall into one of three broad categories.

### Recreate only

Stateless or disposable services where configuration in Git is sufficient.

### Restore application state

Services whose persistent directories must be recovered.

### Restore application state plus external prerequisites

Services that also require:

- Database dump/restore
- Encryption keys
- External network creation
- Remote storage mounts
- OAuth/application credentials
- Certificates
- Specialized hardware or GPU runtime

The README should make that distinction clear.

---

## ♻️ 36. Restore Procedures Are Part of the Stack

:::tip[ELI5]
This section walks through getting data or a service back into a working state.
:::

"This directory is backed up" is not a restore plan.

A README should document the order required to recover a stateful application.

Typical sequence:

1. Install Docker and Compose
2. Restore the stack repository
3. Recreate `.env`
4. Restore persistent application data
5. Recreate external networks or storage prerequisites
6. Restore databases or keys if required
7. Validate `docker compose config`
8. Start dependencies
9. Start the application
10. Verify health and logs

Where ordering matters, write it down.

---

## 🔒 37. Avoid Host-Specific Information in Public Repositories

:::tip[ELI5]
Public documentation should explain architecture without publishing unnecessary private infrastructure details.
:::

Public documentation should explain architecture without publishing unnecessary private infrastructure details.

Avoid committing or documenting:

- Internal hostnames
- Private IP addresses
- VLAN IDs
- Internal DNS zones
- Storage server names
- Credentials
- Private mount topology
- Device serial numbers
- Private domain names not intended for publication

Prefer role-based examples:

```text
primary-server
nas
ai-workstation
reverse-proxy
```

The goal is to teach the pattern without creating an inventory of your private network.

---

## 📦 38. Keep Public Examples Portable

:::tip[ELI5]
A public stack example should usually be understandable without owning your exact hardware.
:::

A public stack example should usually be understandable without owning your exact hardware.

Prefer:

```dotenv
APP_DATA_PATH=/opt/docker/data/example
```

rather than documenting an environment-specific mount hierarchy.

For GPU, storage, or networking requirements, explain the **role** of the dependency rather than exposing the exact internal implementation.

This also makes the documentation more useful to other readers.

---

## 📖 39. Repository Root README

:::tip[ELI5]
A multi-stack repository should also have a detailed root README.
:::

A multi-stack repository should also have a detailed root README.

It should explain:

- Repository purpose
- Directory layout
- Host-path conventions
- Stack deployment model
- `.env` handling
- Git/security rules
- Validation commands
- Update workflow
- Backup approach
- Any repository-wide naming standards

Example layout:

```text
repo/
├── README.md
├── .gitignore
├── .gitattributes
├── .pre-commit-config.yaml
├── .secrets.baseline
├── actualbudget/
├── authentik/
├── monitoring/
└── ...
```

The root README explains **how the repository works**.

Individual stack READMEs explain **how each service works**.

---

## ☑️ 40. New Stack Checklist

:::tip[ELI5]
Use this as a final verification pass after the main setup is working.
:::

Before considering a new stack finished, verify:

- [ ] Directory has a clear, stable name
- [ ] Compose file is named `compose.yaml`
- [ ] Top-level project `name:` is intentional
- [ ] Container naming is intentional
- [ ] Image-tag strategy is understood
- [ ] Restart policy matches workload behavior
- [ ] Environment variables are documented
- [ ] `.env.example` follows repository formatting
- [ ] Production `.env` is ignored by Git
- [ ] Persistent data locations are known
- [ ] Remote-storage prerequisites are documented
- [ ] Published ports are intentional
- [ ] Internal communication uses Compose networking where appropriate
- [ ] Healthcheck is meaningful if present
- [ ] Dependency readiness is handled correctly
- [ ] GPU/device requirements are documented
- [ ] README is operationally complete
- [ ] Compose renders successfully
- [ ] Pre-commit checks pass
- [ ] Secrets are not tracked
- [ ] Backup coverage is known
- [ ] Restore requirements are documented
- [ ] Service survives a normal host reboot

---

## 🔍 41. Existing Stack Audit Checklist

:::tip[ELI5]
Use this as a final verification pass after the main setup is working.
:::

When reviewing an older repository for drift, check each stack for:

### Compose

- Current image source
- Intentional tag/version
- Valid environment interpolation
- Correct volume paths
- Correct ports
- Correct dependency handling
- Valid healthchecks
- Obsolete Compose syntax
- Accidental host-specific values

### `.env.example`

- Exact variable coverage
- Correct ordering
- Current defaults
- Clear section headers
- Explanatory comments
- Blank secrets
- Removed obsolete variables
- Reference-only values clearly labeled

### README

- Current application purpose
- Current prerequisites
- Accurate deployment instructions
- Accurate ports and paths
- Current environment-variable documentation
- Correct update steps
- Backup and restore coverage
- Known exceptions explained

### Repository hygiene

- `.env` ignored
- No credentials tracked
- No private keys
- No large runtime files
- LF line endings
- Pre-commit passes
- Clean Git status after validation

This is the standard to use when a repository has accumulated several months or years of gradual drift.

---

## 🚫 42. What Not to Standardize

:::tip[ELI5]
Standardization is useful until it starts overriding application reality.
:::

Standardization is useful until it starts overriding application reality.

Do **not** force every stack to have identical:

- Healthchecks
- UID/GID variables
- Network models
- Storage layouts
- Database architectures
- Resource limits
- GPU syntax
- Security options
- Update cadence

Standardize the **operational framework**:

- Where files live
- How they are documented
- How secrets are handled
- How changes are validated
- How updates are reviewed
- How recovery works

Let application-specific requirements remain application-specific.

---

## ✅ What to Remember

:::tip[ELI5]
This is the short version to keep in mind after you finish the page.
:::

A Compose stack should be understandable without opening a running container, inspecting undocumented Docker state, or relying on the memory of the person who created it.

If the repository, `.env.example`, README, and backups are current, the container itself becomes what it should have been all along: **replaceable**.
