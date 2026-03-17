
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

