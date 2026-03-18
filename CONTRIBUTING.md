# Contributing to ProScreenCam

Thanks for your interest in contributing.

## Quick start (local dev)

### Prerequisites

- Node.js 20+ (LTS recommended)

### Install

```bash
npm ci
```

### Run (web)

```bash
npm run dev
```

### Run (desktop)

```bash
npm run desktop:dev
```

## Project structure

- `src/` — React app
- `electron/` — Electron main/preload
- `.github/workflows/release.yml` — GitHub Releases build pipeline

## Reporting bugs

Please open an issue with:

- OS (Windows/macOS/Linux) + version
- Browser (if web) and version
- Steps to reproduce
- Expected vs actual result
- A short screen recording if possible

## Pull requests

- Keep PRs focused (one change per PR)
- Run checks before opening a PR:

```bash
npm run lint
npm run build
```

- If you change the recording pipeline, test:
  - Screen-only recording
  - Mic-only recording
  - System/tab audio recording (Chrome/Edge)
  - Webcam PiP compositing

## Code style

- TypeScript + React functional components
- Prefer small, readable helpers over large functions
- Avoid adding new UI dependencies unless necessary

## Commit messages

Use clear messages, e.g.

- `fix: ...`
- `feat: ...`
- `chore: ...`

## Release process (maintainers)

1. Ensure `main` is green (lint/build)
2. Update version in `package.json`
3. Commit the version bump
4. Tag and push `vX.Y.Z`:

```bash
git tag v0.1.0
git push origin v0.1.0
```

GitHub Actions will build and attach installers to the GitHub Release.
