
# ProScreenCam

ProScreenCam is a screen recorder that can capture:

- Screen/Window/Tab video
- System/tab audio (when supported)
- Optional microphone audio
- Optional webcam PiP (face video)

Built with Vite + React + TypeScript for web, and bundled as an installable desktop app via Electron.

## Download & Install (Desktop)

You can download installers from GitHub Releases:

- Releases page: https://github.com/Creativity-Freaks/pro-screen-cam/releases

For each version, open the release and download the asset for your OS:

### Windows

- Download the `.exe` installer (NSIS)
- If Windows SmartScreen warns, click “More info” → “Run anyway” (common for unsigned apps)

### macOS

- Download the `.dmg`
- If Gatekeeper blocks it (unsigned app), open **System Settings → Privacy & Security** and allow the app

### Linux

- `.AppImage` (portable):

	```bash
	chmod +x ProScreenCam-*.AppImage
	./ProScreenCam-*.AppImage
	```

- `.deb` (Debian/Ubuntu):

	```bash
	sudo apt install ./ProScreenCam_*_amd64.deb
	```

## Use (Web)

The web app runs in the browser and records to a local `.webm` file.

1. Click **Start**
2. Select what to share (Screen/Window/Tab)
3. If you want system/tab audio, ensure you enable “Share audio” in the share dialog (Chrome-based browsers)
4. Optionally enable mic/webcam in the app before starting
5. Click **Stop** to finish and download

## Browser Support Notes

- Screen capture uses `navigator.mediaDevices.getDisplayMedia()`.
- “System audio” capture availability depends on OS + browser + what you pick (Tab vs Window vs Screen).
	- Chrome/Edge: best support (especially for tab audio)
	- Firefox/Safari: system audio may not be available
- Webcam/microphone always require explicit permissions.

## Deploy (Vercel)

1. Import this GitHub repo in Vercel
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`

React Router SPA fallback is configured via [vercel.json](vercel.json).

## Develop

### Prerequisites

- Node.js 20+ (LTS recommended)

### Install

```bash
npm ci
```

### Run web dev server

```bash
npm run dev
```

### Run desktop app in dev

```bash
npm run desktop:dev
```

### Build web

```bash
npm run build
```

### Build desktop installers locally

```bash
npm run desktop:build
```

Artifacts are generated in `release/` (and are gitignored).

Note: desktop packaging uses a special build mode so asset paths work with `file://`.

## Release (Publish installers to GitHub)

This repo is configured to publish installers automatically via GitHub Actions when you push a tag that starts with `v`.

1. Update version in `package.json`
2. Commit changes to `main`
3. Tag and push:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Then go to GitHub → **Actions** to watch the build, and GitHub → **Releases** to download the generated installers.

## Contributing

Contributions are welcome.

- See [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Security

Please report security issues responsibly.

See [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).

