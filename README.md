
# ProScreenCam

A Vite + React + TypeScript screen recorder UI (screen + system audio + optional mic) with optional webcam preview (PiP).

## Features

- Screen capture preview
- Record screen video (WebM)
- Capture system audio (browser support varies)
- Optional microphone audio
- Optional webcam preview (PiP)
- Pause / resume recording
- Download recording

## Getting started

### Prerequisites

- Node.js (LTS recommended)

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:5173`.

### Build

```bash
npm run build
```

## Notes (permissions & browser support)

- Screen capture uses `navigator.mediaDevices.getDisplayMedia()`.
- System audio recording depends on the browser/OS and what you select in the share dialog.
- Microphone/Webcam require explicit user permission.
- If you click “Stop sharing” from the browser UI, recording/preview will stop automatically.

## Deploy (Vercel)

- Import this GitHub repo in Vercel
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

React Router SPA fallback is configured via [vercel.json](vercel.json).

## Desktop App (Windows / macOS / Linux)

This repo includes an Electron wrapper so users can install it like a native app.

### Run desktop app in dev

```bash
npm install
npm run desktop:dev
```

### Build installers locally

```bash
npm install
npm run desktop:build
```

Artifacts will be generated in the `release/` folder.

### Publish installers automatically (GitHub Releases)

Push a version tag like `v1.0.0`:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will build for Windows/macOS/Linux and attach the installers to the Release.

