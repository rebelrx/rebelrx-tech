# RebelRx Tech v2

Source for **https://docs.rebelrx.tech**, rebuilt with Astro + Starlight.

The site is English-only. Historical Spanish, Russian, and Chinese content is retained under `archive/translations/` but is not published.

## Everyday workflow on Windows

### 1. Get the latest copy

Open the repository folder in VS Code, then open **Terminal → New Terminal**:

```powershell
git pull
```

### 2. Edit a guide

Production content lives in:

```text
src/content/docs/
```

Examples:

```text
src/content/docs/homelab/tailscale.md
src/content/docs/privacy/mobile.md
src/content/docs/health/non-toxic-grocery-guide/produce.md
```

Edit Markdown normally and save with **Ctrl+S**.

### 3. Preview locally

From the repository root:

```powershell
.\preview.ps1
```

Open **http://localhost:4321**. Astro refreshes the browser as files change. Press **Ctrl+C** in the terminal to stop the preview server.

### 4. Publish

```powershell
.\publish.ps1 "Update Tailscale guide"
```

The script:

1. installs dependencies if needed;
2. runs a full production build;
3. stops if the build fails;
4. stages the changes;
5. commits with your message;
6. pushes to Forgejo.

Forgejo Actions then builds `dist/` and rsyncs it to the existing VPS.

## First-time setup on a Windows PC

Install:

- **Git for Windows**
- **Node.js 22 LTS or newer**
- **Visual Studio Code**

Clone the repository and enter it:

```powershell
git clone <YOUR-FORGEJO-REPOSITORY-URL>
cd <REPOSITORY-FOLDER>
```

Install dependencies:

```powershell
npm install
```

This creates `package-lock.json`. Commit that file immediately so all future builds are reproducible:

```powershell
npm run build
git add package.json package-lock.json
git commit -m "Lock Astro and Starlight dependencies"
git push
```

Afterward, normal updates only need `git pull`, editing, and `publish.ps1`.

## Create a new page

Create a `.md` file under `src/content/docs/`. Every page needs frontmatter:

```markdown
---
title: My New Guide
description: A one-sentence description used by search engines and link previews.
---

Start writing here.
```

To keep an unfinished page out of production:

```yaml
---
title: Work in Progress
draft: true
---
```

When the guide is ready, remove `draft: true` and add it to the `sidebar` array in `astro.config.mjs` if you want it in navigation.

## Add images

Put reusable site artwork in `src/assets/`. For article-specific static images, create an `images` directory near the relevant content or use `src/assets/` and reference it using Astro/Starlight image syntax.

Do not put generated build files in Git. `dist/` is produced by `npm run build`.

## Callouts

Use Starlight asides instead of MkDocs admonitions:

```markdown
:::tip[Recommended]
This is the preferred approach.
:::

:::caution[Before you continue]
Back up the configuration first.
:::

:::danger[Destructive operation]
This command permanently removes data.
:::
```

## Useful commands

```powershell
npm run dev      # live local editing
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

## Deployment

`.forgejo/workflows/deploy-docs.yml` runs on every push to `main`. It preserves the existing VPS deployment model and expects the same Forgejo secrets:

- `VPS_SSH_KEY`
- `VPS_HOST`
- `VPS_USER`
- `VPS_TARGET_DIR`

The VPS remains a static web server. It does not need Astro or Node.js installed.

## Legal pages

These pages remain published but are hidden from the documentation sidebar:

- `/privacy-policy/`
- `/terms-of-service/`
- `/disclaimer/`

## Reverting a bad update

Find the commit in Forgejo or locally:

```powershell
git log --oneline
```

Revert it safely:

```powershell
git revert <commit-id>
git push
```

Forgejo will redeploy the restored version automatically.

## Updating Astro/Starlight

Do not routinely delete `package-lock.json`. On an intentional dependency update:

```powershell
npm outdated
npm update
npm run build
```

Review the site locally, then commit both `package.json` and `package-lock.json`.

## Repository structure

```text
.
├── src/
│   ├── assets/
│   ├── content/docs/       # live English content
│   └── styles/             # RebelRx visual design
├── archive/translations/   # historical translations, not deployed
├── .forgejo/workflows/
├── astro.config.mjs
├── package.json
├── preview.ps1
└── publish.ps1
```


## Current branding

- Site title: `RebelRx Tech`
- Core palette: monochrome black/white
- Homepage hero art: `src/assets/rebelrx-tech-hero.png`


## Production-cleanup changes

Version 2.4 adds a custom `404.md`, explicitly configures Starlight's optional English UI `i18n` collection, and replaces the unsupported `env` syntax-highlighting fence with `text`. These changes are intended to keep production build logs clean and actionable.
