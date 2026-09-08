---
title: "🌿 Git-Managed Homelab"
description: >-
  Use Git and Forgejo to manage homelab infrastructure safely: repository design, pre-commit validation, secrets, branches, deployment, rollback, documentation, and recovery.
---

A homelab becomes much easier to maintain when its configuration has **history**.

Without Git, a working Docker host can slowly turn into a collection of files that are difficult to explain, reproduce, or safely change. With Git, every meaningful infrastructure change can be inspected, documented, compared, and—when appropriate—reversed.

The goal here is **not** to build a miniature enterprise GitOps platform.

It is much simpler:

> **Every meaningful configuration change should be reviewable, reproducible, and recoverable.**

This guide describes the workflow I use for infrastructure repositories in a self-hosted homelab. It complements the [Docker Infrastructure Standards](/homelab/docker-infrastructure-standards/) guide, which covers how individual stacks should be structured.

---

## 🧭 Core Philosophy

Git should make the homelab **safer**, not more bureaucratic.

The useful parts of Git are straightforward:

- A complete history of configuration changes
- Clear diffs before deployment
- Easy comparison between working and broken states
- Documentation that evolves with the infrastructure
- Protection against accidental file deletion
- A reproducible starting point when rebuilding a host
- A clean way to synchronize configuration across systems

You do **not** need elaborate CI/CD pipelines, Kubernetes, Terraform, or automatic production deployment to benefit from version control.

For a personal environment, the best workflow is often deliberately boring:

```text
edit → validate → review → commit → push → deploy → verify
```

That small amount of discipline prevents a surprising number of problems.

---

## 📦 1. What Belongs in Git

Git is ideal for **configuration and documentation**.

Typical infrastructure files that belong in a repository include:

- `compose.yaml`
- `.env.example`
- README files
- Reverse-proxy configuration
- Monitoring configuration
- Service configuration templates
- Shell scripts
- Deployment helpers
- Documentation
- Pre-commit configuration
- Repository metadata such as `.gitignore` and `.gitattributes`

A simple stack directory might look like:

```text
my-service/
├── compose.yaml
├── .env.example
└── README.md
```

A more involved stack might also contain:

```text
my-service/
├── compose.yaml
├── .env.example
├── README.md
├── config/
│   ├── application.yml
│   └── logging.yml
└── scripts/
    └── maintenance.sh
```

The important distinction is that Git tracks the **instructions needed to recreate the service**, not the service's live state.

---

## 🚫 2. What Does Not Belong in Git

Do not use Git as a dumping ground for runtime data.

Examples that normally **should not** be committed include:

- Real `.env` files
- Passwords
- API keys
- Private keys
- TLS private keys
- OAuth client secrets
- Database files
- Application databases
- Container writable layers
- User uploads
- Media libraries
- Backups
- Logs
- Cache directories
- Model files
- Generated thumbnails
- Large binary archives

Git is exceptionally good at tracking small text files.

It is usually the wrong tool for mutable application data.

A useful mental model is:

> **Git stores how the system is built. Backups store what the system contains.**

---

## 🗂️ 3. Choose Repository Boundaries Deliberately

There is no universal correct repository layout.

For a homelab with multiple physical hosts, I prefer repository boundaries that reflect **operational ownership** rather than trying to place the entire environment into one giant repository.

For example:

```text
primary-server-stacks
ai-workstation-stacks
ai-agent-stacks
```

Each repository can correspond to the stack directory on that machine.

This keeps changes easy to reason about:

- A commit affects one host
- A rollback is scoped to one host
- Host-specific documentation stays together
- Deployment is straightforward
- Repository history reflects the actual machine being administered

A monorepo can work, especially for small labs, but it becomes less attractive when hosts have very different hardware, responsibilities, or lifecycle requirements.

---

## 🏠 4. Let the Repository Mirror the Real Stack Tree

Where practical, I prefer the checked-out repository to **be** the active stack directory rather than maintaining a second template directory that must be copied into place.

A common layout is:

```text
/opt/docker/stacks/
├── .git/
├── README.md
├── service-a/
├── service-b/
├── service-c/
└── ...
```

This has an important advantage:

> There is only one authoritative copy of the configuration on the host.

You do not end up with:

```text
~/git/docker-stacks/
```

and separately:

```text
/opt/docker/stacks/
```

with no certainty that they still match.

If the repository itself is the deployed stack tree, `git status` immediately tells you whether production has drifted from version control.

---

## 🏛️ 5. Use Forgejo as the Repository Hub

A self-hosted Git service such as **Forgejo** is an excellent fit for a homelab.

It provides:

- Private repositories
- Browser-based diffs
- Commit history
- Branches
- Pull requests
- Issues
- Releases and tags
- User/access controls
- A central location for repositories from multiple hosts

Self-hosting the Git service also means the infrastructure's source history does not have to depend on a public SaaS provider.

However, remember:

> **Self-hosted Git still needs backup.**

If the Forgejo server disappears and no other clones or backups exist, self-hosting alone did not make the repository durable.

Fortunately, Git's distributed design helps: every normal clone already contains most of the repository history.

---

## 🔐 6. Keep Repositories Private by Default

Infrastructure repositories frequently reveal more than people expect.

Even without credentials, they may expose:

- Internal DNS names
- Hostnames
- Network structure
- Reverse-proxy names
- Volume paths
- Service inventory
- Hardware assignments
- Email addresses
- Internal ports
- Authentication architecture

Private repositories should therefore be the default for live homelab configuration.

If you publish examples publicly, sanitize them intentionally rather than assuming that removing `.env` is enough.

Use generic placeholders such as:

```text
server.example
nas.example
user@example.com
/path/to/data
```

instead of exposing the actual topology.

---

## 🙈 7. Establish a Strong `.gitignore`

Every infrastructure repository should exclude secrets and generated state before the first meaningful commit.

At minimum:

```text
# Real environment files
.env
.env.*
*.env
!.env.example

# Local overrides
compose.override.yaml
docker-compose.override.yml

# Editor files
.vscode/
.idea/
*.swp
*.swo

# OS-generated files
.DS_Store
Thumbs.db

# Logs and temporary files
*.log
*.tmp
*.bak
```

Adjust this for your environment.

Be careful with broad patterns such as:

```text
*.env
```

because they also exclude intentionally committed example files unless you add an exception such as:

```text
!.env.example
```

The best time to fix `.gitignore` is **before** a secret is committed.

---

## 🧾 8. Treat `.env.example` as an Interface Contract

A real `.env` file is private runtime configuration.

An `.env.example` file is public documentation for the stack.

The example should describe every variable expected by `compose.yaml` without containing real credentials.

For example:

```dotenv
# ==============================================================================
# APPLICATION
# ==============================================================================
APP_URL=https://example.invalid
APP_PORT=8080
APP_TIMEZONE=Etc/UTC

# ==============================================================================
# DATABASE
# ==============================================================================
DB_NAME=change_me
DB_USER=change_me
DB_PASSWORD=
```

The important rule is synchronization:

> If Compose gains or loses an environment variable, `.env.example` should change in the same commit.

This prevents a common form of documentation drift where the example file no longer describes what the stack actually requires.

See [Docker Infrastructure Standards](/homelab/docker-infrastructure-standards/) for the full environment-file convention.

---

## 🔍 9. Search for Secrets Before the First Commit

Before initializing an existing stack directory as a repository, inspect it carefully.

Useful searches include:

```bash
grep -RIn --exclude-dir=.git \
  -E '(password|passwd|secret|api[_-]?key|token|private[_-]?key)' .
```

This is not a perfect secret scanner, but it often reveals obvious problems.

Also inspect files such as:

```text
.env
*.pem
*.key
id_rsa
id_ed25519
credentials.json
config.json
```

Do not assume a file is safe simply because its filename looks harmless.

---

## 🧪 10. Use Pre-Commit Validation

A small set of automated checks catches many mistakes before they ever reach the remote repository.

I recommend `pre-commit` for infrastructure repositories.

Install it using your distribution's preferred package mechanism or Python tooling, then create:

```text
.pre-commit-config.yaml
```

A useful baseline includes checks for:

- End-of-file newline
- Trailing whitespace
- YAML syntax
- Merge conflict markers
- Private keys
- Large files
- Secrets

A representative configuration might look like:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v6.0.0
    hooks:
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: check-yaml
      - id: check-merge-conflict
      - id: detect-private-key
      - id: check-added-large-files
```

Add a dedicated secret-detection hook appropriate to your workflow as well.

The exact tool matters less than the principle:

> Obvious errors should be detected automatically before they become repository history.

---

## 🪝 11. Install the Pre-Commit Hook Locally

After configuring pre-commit:

```bash
pre-commit install
```

Now checks run automatically when committing.

You can also validate the entire repository manually:

```bash
pre-commit run --all-files
```

Or only specific files:

```bash
pre-commit run --files service-a/compose.yaml service-a/README.md
```

This is especially useful after making a focused edit.

---

## 🔧 12. A Hook That Modifies a File Is Not a Failure

Some pre-commit hooks automatically repair formatting.

For example:

```text
fix end of files................Failed
- hook id: end-of-file-fixer
- exit code: 1

Fixing service/compose.yaml
```

This usually means the hook **successfully corrected the file**, but the staged copy is now outdated.

The correct workflow is:

```bash
git add service/compose.yaml
pre-commit run --files service/compose.yaml
```

Then commit once the checks pass.

Do not bypass the hook simply because it made a trivial formatting correction.

---

## ↩️ 13. Normalize Line Endings with `.gitattributes`

Infrastructure repositories often move between Linux, Windows, editors, and web interfaces.

Without explicit rules, line endings can generate enormous meaningless diffs.

A simple `.gitattributes` baseline is:

```text
* text=auto eol=lf

*.sh text eol=lf
*.yaml text eol=lf
*.yml text eol=lf
*.md text eol=lf
*.env text eol=lf
```

This keeps the repository predictable and avoids CRLF/LF churn.

For shell scripts in particular, LF line endings matter operationally.

---

## 🔎 14. Always Inspect Before Staging

Before `git add`, run:

```bash
git status
```

Then:

```bash
git diff
```

This answers two different questions:

1. **What files changed?**
2. **What actually changed inside those files?**

Do not treat `git add .` as the automatic next step after editing.

First understand the working tree.

---

## 🎯 15. Stage Deliberately

For focused infrastructure changes, stage specific files:

```bash
git add \
  service/compose.yaml \
  service/.env.example \
  service/README.md
```

This reduces the chance of accidentally including:

- Unrelated edits
- Temporary files
- Debug changes
- Secrets
- Half-finished work

For large intentional repository-wide refactors, `git add -A` can be appropriate—but only after inspecting the entire diff.

---

## 👀 16. Review the Staged Diff

After staging:

```bash
git diff --cached
```

This is one of the most useful commands in the entire workflow.

It shows **exactly what the next commit will contain**.

Check for:

- Accidental secrets
- Internal information you did not mean to publish
- Unexpected formatting churn
- Files unrelated to the task
- Incorrect version changes
- Documentation that was not updated

A clean staged diff should tell a coherent story.

---

## 🧹 17. Restore Unrelated Changes Instead of Carrying Them Along

Sometimes you notice a file was modified unintentionally.

If you do not want the change:

```bash
git restore path/to/file
```

If it was already staged:

```bash
git restore --staged path/to/file
git restore path/to/file
```

Be careful: `git restore` can discard work.

Always inspect the diff first.

The important principle is that unrelated local changes should not be dragged into a commit simply because they happen to exist.

---

## ✍️ 18. Make Commits Describe One Change

Good infrastructure commits are small enough that you can understand them months later.

Good examples:

```text
Update Authentik image and documentation
Rename Hawser compose file
Add healthcheck to database service
Document backup requirements for Paperless
Migrate stack directories to new convention
```

Poor examples:

```text
updates
stuff
changes
misc fixes
```

The commit subject should answer:

> **What changed?**

The diff answers:

> **How did it change?**

---

## 📝 19. Use Commit Bodies When the Why Matters

A one-line subject is enough for many changes.

For higher-risk modifications, add context:

```text
Pin application to known-good release

The newest upstream release currently fails during database migration.
Remain on this release until the migration issue is resolved.
```

That information becomes invaluable six months later when someone wonders why the image was deliberately pinned.

In a personal homelab, that future someone is often you.

---

## 🌿 20. Use Branches in Proportion to Risk

Not every change needs a feature branch.

A typo in a README can usually go directly to the main branch in a personal repository.

A major migration should not.

Create a branch for higher-risk work:

```bash
git switch -c migration/new-layout
```

Examples where a branch is useful:

- Directory restructures
- Service migrations
- Database changes
- Major image upgrades
- Reverse-proxy redesign
- Authentication changes
- Large documentation rewrites
- Multi-stack refactors

The objective is not ceremony.

It is isolation.

---

## 🔀 21. Keep the Main Branch Deployable

Treat the main branch as the last known intended configuration.

Ideally:

```text
main = configuration you are willing to deploy
```

Experimental work belongs on a branch until it has been validated.

This makes recovery much easier because you are not trying to remember whether the latest main-branch commit represented a finished state or an experiment halfway through implementation.

---

## ✅ 22. Test Before Merging

For infrastructure changes, a branch should be validated before it is merged.

At minimum:

```bash
pre-commit run --all-files
```

For Docker stacks:

```bash
docker compose config
```

Then perform whatever service-specific validation is appropriate.

Once the configuration is known-good, merge it into `main`.

---

## 🧬 23. Prefer Fast-Forward Updates on Production Hosts

On hosts where you do not intend to create merge commits during deployment, use:

```bash
git pull --ff-only
```

This refuses to perform an implicit merge if local and remote history have diverged.

That is a feature.

A production stack tree should not silently generate a merge commit because somebody ran `git pull` without noticing local history had changed.

If `--ff-only` fails, investigate why.

---

## 🛑 24. Never Pull Over Unreviewed Local Changes

Before pulling:

```bash
git status
```

If the working tree is dirty, determine why.

Possible explanations include:

- An intentional local edit that has not been committed
- A management UI rewrote a Compose file
- A pre-commit hook changed formatting
- A generated file is incorrectly tracked
- Someone edited production directly

Do not blindly run:

```bash
git stash
git pull
git stash pop
```

just to make the warning disappear.

First understand the drift.

---

## 🧭 25. Decide Where Edits Are Allowed

There are two reasonable workflows:

### Edit on the server

You SSH into the host, edit the active repository, validate, commit, and push.

Advantages:

- You are working directly against the deployed environment
- Service validation is immediate
- No second deployment copy exists

### Edit on a workstation

You clone the repository locally, edit and review there, push, then pull on the target host.

Advantages:

- Better development tools
- Easier large-scale edits
- Production remains untouched until deployment

Both approaches can work.

The important part is avoiding a third accidental workflow where edits happen independently in both locations and nobody knows which copy is authoritative.

---

## 🔄 26. A Simple Server-Side Change Workflow

For a small, low-risk change made directly on a host:

```bash
cd /opt/docker/stacks

git status
git pull --ff-only

# Edit files

pre-commit run --files \
  service/compose.yaml \
  service/.env.example \
  service/README.md

docker compose -f service/compose.yaml config

git diff
git add \
  service/compose.yaml \
  service/.env.example \
  service/README.md

git diff --cached
git commit -m "Update service configuration"
git push
```

Then deploy and validate the service.

This is intentionally uncomplicated.

---

## 💻 27. A Workstation-to-Server Workflow

For larger changes:

```text
workstation clone
      ↓
create branch
      ↓
edit + validate
      ↓
commit + push
      ↓
review/merge
      ↓
production host: git pull --ff-only
      ↓
deploy
      ↓
validate
```

The production host consumes an already reviewed commit rather than serving as the editing environment.

This is particularly useful for repository-wide migrations and documentation work.

---

## 🖥️ 28. Managing Multiple Hosts

When each major Docker host has its own repository, the workflow stays predictable:

```text
Host A → Repository A
Host B → Repository B
Host C → Repository C
```

Avoid trying to solve cross-host consistency through copying files manually.

If several hosts should share a convention, document that convention and apply it deliberately in each repository.

For genuinely shared files, consider a separate templates/reference repository—but do not introduce shared abstractions until they solve a real problem.

---

## 🧩 29. Do Not Force Identical Repositories Across Different Hosts

Consistency is useful.

Artificial sameness is not.

An AI workstation may require:

- NVIDIA runtime settings
- GPU device configuration
- Model-storage conventions
- Large shared-memory allocations

A general-purpose server may require none of those.

Keep the common conventions consistent while allowing host-specific requirements to remain explicit.

This mirrors the broader principle from the Docker standards guide:

> **Standardize structure, not every implementation detail.**

---

## 🛠️ 30. Treat UI-Generated Changes as Real Changes

Management interfaces can modify Compose files or stack configuration.

If a UI changes a tracked file, immediately inspect:

```bash
git status
git diff
```

Then decide whether the change is intentional.

If it is:

1. Validate it
2. Update associated documentation
3. Commit it
4. Push it

If it is not:

```bash
git restore path/to/file
```

A file modified through a GUI is not somehow exempt from version control.

---

## 📚 31. Documentation Changes Belong in the Same Commit

A configuration change is incomplete if the repository documentation now describes the old system.

If you change any of the following:

- Image version
- Port
- Volume path
- Environment variable
- Service name
- Dependency
- Network requirement
- Upgrade process
- Backup requirement
- Restore process

update the README in the same commit.

This keeps repository history internally consistent.

A checkout at a historical commit should ideally contain both the configuration **and the documentation appropriate to that configuration**.

---

## 🧾 32. Preserve `.env.example` Formatting

Example environment files are often edited casually, which leads to gradual drift across a repository.

Choose a format and preserve it.

For example:

```dotenv
# ==============================================================================
# SERVICE
# ==============================================================================
SERVICE_TAG=latest
SERVICE_PORT=8080

# ==============================================================================
# DATABASE
# ==============================================================================
DB_NAME=service
DB_USER=service
DB_PASSWORD=
```

When auditing a repository, do not "simplify" these files into an inconsistent format just because a shorter file also works.

Formatting is part of the documentation standard.

---

## 🧠 33. Preserve Detailed READMEs

Operational READMEs should not be reduced to a three-command deployment snippet simply for uniformity.

A mature stack README may contain important context such as:

- Why a particular image is used
- Hardware requirements
- GPU configuration
- Known incompatibilities
- Backup details
- Upgrade caveats
- Model requirements
- Troubleshooting history
- Service-specific validation

During repository cleanup, **preserve useful knowledge**.

Consistency should improve documentation, not erase it.

---

## 🚀 34. Separate Commit from Deployment

A commit records intent.

Deployment changes the running system.

Those are related but distinct actions.

A good workflow is:

```text
validate configuration
      ↓
commit
      ↓
push
      ↓
deploy
      ↓
validate runtime
```

This ensures the configuration being deployed already has a known Git identity.

If the deployment fails, you know exactly which commit produced the state you are troubleshooting.

---

## 🐳 35. Validate Compose Before Deployment

Before applying a changed stack:

```bash
cd /opt/docker/stacks/service

docker compose config
```

For environments using an external env file, ensure the same runtime inputs are available during validation.

Then:

```bash
docker compose pull
docker compose up -d
docker compose ps
```

Inspect logs where appropriate:

```bash
docker compose logs --tail=100
```

Git validation does not replace runtime validation.

A YAML file can be valid and still describe a broken application.

---

## 🩺 36. Define What "Deployed Successfully" Means

Do not stop at:

```text
Container is running
```

A successful deployment may require checking:

- Container health
- Web interface
- Authentication
- Reverse proxy
- Database connection
- Persistent data
- Storage mounts
- GPU access
- Background workers
- Dependent applications

For important stacks, write the validation procedure into the README.

---

## 🏷️ 37. Use Tags for Important Milestones

Tags can mark known-good states before large changes.

For example:

```bash
git tag -a before-major-migration -m "Known-good state before major migration"
git push origin before-major-migration
```

Or use version-oriented tags when appropriate:

```text
homelab-2026-09
pre-storage-migration
before-auth-redesign
```

Do not tag every routine commit.

Tags are most useful when they identify operational milestones you may need to find quickly later.

---

## ↩️ 38. Roll Back Configuration Carefully

If a configuration change breaks a service, first inspect history:

```bash
git log --oneline -- service/
```

Compare the current state to a known-good commit:

```bash
git diff <good-commit>..HEAD -- service/
```

If the change is purely configuration, reverting may be straightforward:

```bash
git revert <bad-commit>
```

Then redeploy.

Prefer `git revert` on shared history because it creates a new commit that explicitly reverses the previous change.

---

## ⚠️ 39. Git Rollback Does Not Reverse Database Migrations

This distinction is critical.

Suppose you upgrade an application:

1. New image starts
2. Application migrates its database schema
3. New version fails
4. You revert `compose.yaml` to the old image

The old application may no longer understand the migrated database.

Git successfully restored the **configuration**.

It did not restore the **application state**.

Before major upgrades, consult the application's upgrade documentation and make an appropriate backup or snapshot.

---

## 💾 40. Git Is Not a Backup System for Application Data

Git can recover:

- Compose configuration
- Documentation
- Scripts
- Templates
- Example environment files

Git cannot recover:

- User uploads
- Databases
- Media
- Application state
- AI models
- Runtime secrets excluded from Git

That is the responsibility of a real backup system.

See [Backup & Recovery](/homelab/backup-and-recovery/) and [Disaster Recovery](/homelab/disaster-recovery/).

---

## 🛡️ 41. Git Itself Still Needs Protection

A distributed Git repository is inherently resilient because clones contain history, but the central Forgejo service should still be protected.

Backup the data required to restore:

- Repository data
- Forgejo database
- Configuration
- Necessary secrets
- Custom assets, if any

Also remember that clones on infrastructure hosts provide an additional copy of repository history—but they should not be your only recovery plan.

---

## 🔑 42. Decide How Git Authentication Works

Common approaches include:

- HTTPS with a credential helper
- SSH keys
- Hardware-backed SSH keys
- Access tokens where required

Whichever method you choose:

- Do not embed credentials in repository URLs
- Do not store tokens in plaintext shell scripts
- Use scoped credentials when possible
- Protect private keys
- Rotate credentials when a device is retired or compromised

Authentication should be convenient enough that you do not start bypassing Git because pushing changes is annoying.

---

## 🔗 43. Prefer Stable Remote URLs

Check the configured remote:

```bash
git remote -v
```

A repository should use the normal canonical Forgejo URL rather than an ad hoc temporary clone path.

If changing transport—for example, HTTPS to SSH—update the remote explicitly:

```bash
git remote set-url origin <new-url>
```

Then verify:

```bash
git remote -v
```

Do not reclone a working repository merely to change its remote URL.

---

## 🧬 44. Set Tracking Branches Correctly

A local branch should normally track the appropriate remote branch.

Check:

```bash
git branch -vv
```

For a new branch:

```bash
git push -u origin branch-name
```

The `-u` establishes upstream tracking, allowing later commands such as:

```bash
git pull
git push
```

to work without specifying the remote and branch every time.

---

## 🗑️ 45. Clean Up Finished Branches

After a feature branch has been merged and is no longer needed:

```bash
git branch -d branch-name
```

Then remove the remote branch if appropriate:

```bash
git push origin --delete branch-name
```

Keeping dozens of dead branches makes repository history harder to navigate.

Do not delete branches that still contain unique work you intend to keep.

---

## ⚔️ 46. Resolve Push Rejections Instead of Forcing Them

If Git rejects a push because the remote contains newer work, do not immediately reach for:

```bash
git push --force
```

First inspect the situation:

```bash
git fetch origin
git status
git log --oneline --graph --decorate --all -20
```

Often the correct solution is simply to integrate the remote change cleanly.

Force pushes rewrite history and should be exceptional in infrastructure repositories.

---

## 🔥 47. Avoid `--force` on Shared Main Branches

A force push can erase commits from the remote history.

That is especially dangerous when multiple hosts clone the repository.

If a bad commit reached `main`, prefer:

```bash
git revert <commit>
```

This preserves history and makes the rollback explicit.

If history rewriting is genuinely necessary, understand every clone that will be affected before doing it.

---

## 🧯 48. Recover from Accidental Changes with `reflog`

Git keeps a local record of where branch references previously pointed.

If you accidentally reset, rebase, or otherwise lose sight of a commit:

```bash
git reflog
```

You can often recover the prior commit from there.

`reflog` is local and eventually expires, so it is not a substitute for proper remote history or backup—but it is an excellent emergency tool.

---

## 🧱 49. Avoid Committing Large Binary Files

A single large binary committed to Git may remain in repository history even after it is later deleted.

Examples to keep out:

- VM images
- ISO files
- Database dumps
- AI models
- Media
- Backup archives
- Container image exports

Pre-commit's large-file check is useful precisely because prevention is much easier than rewriting history later.

---

## 📜 50. Scripts Belong in Git When They Encode Operations

If you repeatedly use the same shell sequence for maintenance, turn it into a script and commit it.

Examples:

- Backup helpers
- Restore helpers
- Migration scripts
- Validation scripts
- Repository audit tools
- Maintenance tasks

A script is especially valuable when the procedure is easy to mistype.

Document its purpose and prerequisites in the relevant README.

---

## 🧰 51. Keep Repository-Level Tooling at the Root

Files that govern the entire repository belong at the repository root.

Typical examples:

```text
.gitignore
.gitattributes
.pre-commit-config.yaml
README.md
```

Do not duplicate identical repository-wide tooling inside every stack directory unless there is a specific reason.

Stack-specific documentation stays with the stack.

Repository-wide policy stays at the root.

---

## 📖 52. Maintain a Useful Root README

The repository root README should explain the repository itself rather than duplicate every stack README.

Useful sections include:

- Purpose
- Host role, described generically if public
- Directory conventions
- Repository standards
- Prerequisites
- Common Git workflow
- Validation commands
- Deployment philosophy
- Backup expectations
- Security notes

It can also link to each stack directory where appropriate.

The root README is the operating manual for the repository as a whole.

---

## 🧭 53. Keep Public Documentation More General Than Private Repositories

A public documentation site and a private infrastructure repository have different audiences and different security requirements.

Private repository:

```text
May contain host-specific implementation details that are operationally useful.
```

Public guide:

```text
Should explain architecture and method without publishing sensitive topology.
```

When turning private infrastructure work into public documentation, remove or generalize:

- Hostnames
- Internal domains
- IP addresses
- VLAN IDs
- Precise mount paths
- Credentials
- Private repository URLs
- Detailed service exposure maps

Share the **method**, not the attack surface.

---

## 🔒 54. Assume a Secret Can Eventually Leak

`.gitignore` is necessary, but it is not enough.

Humans make mistakes.

Use layered protection:

1. Secrets excluded through `.gitignore`
2. Example files contain placeholders only
3. Pre-commit secret scanning
4. Manual staged-diff review
5. Private repositories where appropriate
6. Scoped credentials
7. Credential rotation capability

The objective is to make accidental disclosure require multiple failures rather than one typo.

---

## 🚨 55. If a Secret Is Committed, Rotate It

Deleting the line in the next commit does **not** make the secret safe.

The previous commit still contains it.

If a real credential is committed:

1. Revoke or rotate the credential immediately
2. Replace it in the live service
3. Remove it from current files
4. Decide whether repository history must be rewritten
5. Inform anyone with a clone if history is rewritten

Treat the credential as compromised even if the repository is private.

Do not waste time trying to prove nobody saw it before rotating it.

---

## 🔁 56. Audit Repositories Periodically

Infrastructure repositories accumulate drift just like infrastructure itself.

Periodically inspect:

```bash
git status
pre-commit run --all-files
```

Then review:

- Deprecated Compose filenames
- Missing `.env.example` variables
- Stale README instructions
- Old image tags
- Unused stack directories
- Secrets accidentally tracked
- Large files
- Inconsistent line endings
- Orphaned branches
- Old deployment notes

A repository that was clean two years ago may no longer describe the environment accurately today.

---

## 🧹 57. Refactor in Reviewable Batches

When cleaning a large repository, avoid rewriting every stack at once unless there is a compelling reason.

A safer pattern is:

```text
1. Establish repository-wide conventions
2. Update a small group of stacks
3. Validate
4. Commit
5. Continue with the next group
```

This makes mistakes easier to isolate.

It also keeps diffs small enough to review meaningfully.

---

## 🛠️ 58. Do Not Rewrite Working Infrastructure for Cosmetic Uniformity

This is one of the most important rules in a mature homelab.

Suppose two stacks use slightly different—but valid—Compose structures because of upstream requirements.

Do not rewrite the functioning stack merely because another pattern looks cleaner.

Standardization is valuable when it improves:

- Readability
- Safety
- Maintenance
- Documentation
- Reproducibility

It is harmful when it introduces operational risk for no meaningful benefit.

Document intentional exceptions instead.

---

## 📋 59. Routine Change Checklist

For a normal infrastructure change:

- [ ] Confirm the working tree is clean
- [ ] Pull the latest remote state with `git pull --ff-only`
- [ ] Make the intended edit
- [ ] Update `.env.example` if variables changed
- [ ] Update the README if behavior changed
- [ ] Run pre-commit checks
- [ ] Validate Compose/configuration
- [ ] Review `git diff`
- [ ] Stage only intended files
- [ ] Review `git diff --cached`
- [ ] Commit with a meaningful message
- [ ] Push
- [ ] Deploy
- [ ] Validate runtime behavior

That sounds like many steps when written out.

In practice, it becomes a fast routine.

---

## 🧪 60. Major Upgrade Checklist

For a higher-risk upgrade:

- [ ] Read upstream release notes
- [ ] Confirm backup coverage
- [ ] Determine whether database migrations occur
- [ ] Create a branch if appropriate
- [ ] Record the current known-good version
- [ ] Consider creating a Git tag
- [ ] Update configuration
- [ ] Update `.env.example`
- [ ] Update README/upgrade notes
- [ ] Run pre-commit
- [ ] Validate Compose
- [ ] Review the full diff
- [ ] Commit and push
- [ ] Deploy during an appropriate maintenance window
- [ ] Verify application health
- [ ] Verify persistent data
- [ ] Verify dependencies/integrations
- [ ] Merge only after validation if using a branch

The larger the migration, the more useful Git becomes.

---

## ♻️ 61. Host Rebuild Workflow

One of the best tests of a Git-managed homelab is whether the repository helps you rebuild a lost host.

A simplified rebuild sequence is:

```text
Install operating system
        ↓
Install Docker / prerequisites
        ↓
Clone infrastructure repository
        ↓
Restore private environment files / secrets
        ↓
Restore persistent application data
        ↓
Validate configuration
        ↓
Start stacks in dependency order
        ↓
Validate services
```

Git supplies the configuration history.

Your backup system supplies the state.

Documentation explains how they fit together.

---

## 🧠 62. Source of Truth Does Not Mean Source of Everything

It is common to call Git the "source of truth."

That phrase is useful only if interpreted correctly.

Git can be the source of truth for:

- Intended configuration
- Stack structure
- Scripts
- Documentation

It is **not** necessarily the source of truth for:

- Runtime secrets
- Databases
- User data
- External DNS state
- Hardware state
- SaaS configuration

A mature recovery plan knows where each class of information actually lives.

---

## 🚫 63. Common Git Mistakes to Avoid

Avoid these patterns:

### Committing `.env`

```text
The most obvious infrastructure Git mistake.
```

### Running `git add .` without reviewing

```text
Convenient until an unrelated or secret file is included.
```

### Force-pushing `main`

```text
Can invalidate history across multiple clones.
```

### Blindly pulling over local edits

```text
Hides configuration drift instead of understanding it.
```

### Treating Git as database rollback

```text
Configuration history does not undo state migrations.
```

### Letting README files drift

```text
The repository becomes reproducible in theory but not understandable in practice.
```

### Over-standardizing working stacks

```text
Consistency is not worth introducing outages.
```

### Publishing private infrastructure details

```text
Documentation does not need to disclose the network topology to be useful.
```

---

## 🧰 64. Useful Commands Reference

Check repository state:

```bash
git status
```

Inspect unstaged changes:

```bash
git diff
```

Inspect staged changes:

```bash
git diff --cached
```

Stage selected files:

```bash
git add path/to/file
```

Unstage a file:

```bash
git restore --staged path/to/file
```

Discard an unstaged change:

```bash
git restore path/to/file
```

Commit:

```bash
git commit -m "Describe the change"
```

Push:

```bash
git push
```

Pull only if fast-forward is possible:

```bash
git pull --ff-only
```

Create a branch:

```bash
git switch -c branch-name
```

Switch branches:

```bash
git switch main
```

Inspect recent history:

```bash
git log --oneline --decorate --graph -20
```

Inspect branch tracking:

```bash
git branch -vv
```

Inspect remotes:

```bash
git remote -v
```

Run repository validation:

```bash
pre-commit run --all-files
```

---

## 🔗 Related Guides

The Git workflow is only one part of making infrastructure reproducible.

Continue with:

- [Docker Infrastructure Standards](/homelab/docker-infrastructure-standards/) — structure and maintain Docker stacks consistently
- [Backup & Recovery](/homelab/backup-and-recovery/) — protect persistent application data
- [Disaster Recovery](/homelab/disaster-recovery/) — rebuild after a larger failure
- [Monitoring & Management](/homelab/monitoring-and-management/) — verify that deployed infrastructure remains healthy

---

## 🧠 Final Principle

The value of Git in a homelab is not that it makes infrastructure look professional.

It is that it replaces **memory and guesswork** with evidence.

When something changes, you can see what changed.

When something breaks, you can compare it to the last working state.

When a machine needs to be rebuilt, the configuration is not trapped on that machine.

And when the homelab evolves over years, its history evolves with it.

> **Version the configuration, document the reasoning, back up the state, and keep the workflow simple enough that you actually use it.**
