# ProScreenCam

[![Animated ProScreenCam heading](https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=26&duration=2500&pause=900&color=22D3EE&center=true&vCenter=true&width=920&lines=%F0%9F%96%A5%EF%B8%8F+ProScreenCam+%E2%80%94+Professional+Screen+Recorder;%F0%9F%8E%99%EF%B8%8F+Screen+%2B+System+Audio+%2B+Mic+%2B+Webcam+PiP;%E2%9A%A1+Desktop-first+capture+workflow+for+creators+and+teams)](https://github.com/Creativity-Freaks/pro-screen-cam)

[![Latest Release](https://img.shields.io/github/v/release/Creativity-Freaks/pro-screen-cam?style=for-the-badge&logo=github&label=Latest%20Release)](https://github.com/Creativity-Freaks/pro-screen-cam/releases)
[![Desktop Build](https://img.shields.io/github/actions/workflow/status/Creativity-Freaks/pro-screen-cam/release.yml?style=for-the-badge&logo=githubactions&label=Desktop%20Build)](https://github.com/Creativity-Freaks/pro-screen-cam/actions/workflows/release.yml)
[![MIT License](https://img.shields.io/badge/License-MIT-0ea5e9?style=for-the-badge)](LICENSE)

ProScreenCam is a modern screen recorder for web and desktop that captures:

- Screen, window, or tab video
- System or tab audio (when available)
- Optional microphone audio
- Optional webcam picture-in-picture overlay

Built with Vite, React, and TypeScript, then packaged with Electron for production desktop distribution.

## Why ProScreenCam

- Studio-style capture controls with a clean interface
- Desktop source picker with screen and window views
- Floating mini recording controller (pause/resume/stop with timer)
- Browser mode for instant usage without installation
- One-click release pipeline for Windows, macOS, and Linux

## Desktop Install Guide

Download all official installers from the Releases page:

- [GitHub Releases](https://github.com/Creativity-Freaks/pro-screen-cam/releases)

### OS Matrix

| Platform | Installer | File Type | Recommended For |
| --- | --- | --- | --- |
| Windows | NSIS setup | .exe | Standard install experience |
| macOS | Disk image | .dmg | Drag-and-drop app installation |
| Linux | Portable package | .AppImage | Quick run without system install |
| Linux (Debian/Ubuntu) | Debian package | .deb | Native package management |

### Windows Installation

1. Open the latest release.
2. Download the Windows .exe installer.
3. Run the installer and complete setup.
4. If SmartScreen appears, choose More info, then Run anyway.

### macOS Installation

1. Open the latest release.
2. Download the .dmg file.
3. Open the DMG and drag ProScreenCam into Applications.
4. If macOS blocks launch on first run:
   Open System Settings > Privacy and Security and allow the app.

### Linux Installation

AppImage (portable):

```bash
chmod +x ProScreenCam-*.AppImage
./ProScreenCam-*.AppImage
```

Deb package (Debian or Ubuntu):

```bash
sudo apt install ./ProScreenCam_*_amd64.deb
```

## First Run Checklist (Desktop)

For best results on any OS:

1. Allow screen capture permission when prompted.
2. Allow microphone and camera only if you want voice or face video.
3. For system audio, enable share audio in the source picker when supported.
4. Use Start Preview before Start Recording to verify source and audio.

## Web Usage

Use directly in browser if you do not want desktop installation.

Basic flow:

1. Click Start Preview.
2. Select what to share.
3. Enable voice or face video if needed.
4. Click Start Recording.
5. Stop and download your recording file.

Browser note:

- System audio support varies by browser and OS.
- Chrome and Edge typically provide the best screen or tab audio support.

## Developer Setup

### Prerequisites

- Node.js 20 or newer
- npm

### Install Dependencies

```bash
npm ci
```

### Web Development

```bash
npm run dev
```

### Desktop Development

```bash
npm run desktop:dev
```

If port 5173 is occupied, free it and run again. Desktop dev mode requires port 5173 for Electron to attach correctly.

### Production Build

Web build:

```bash
npm run build
```

Desktop installers (local):

```bash
npm run desktop:build
```

Desktop artifacts are generated in the release directory.

## Release Pipeline

This repository publishes desktop installers through GitHub Actions for all major platforms:

- Windows
- macOS
- Linux

Workflow trigger:

- Push a git tag starting with v (example: v0.1.2)

Release steps:

1. Update the version in package.json.
2. Commit changes to main.
3. Create and push a new tag.

```bash
git tag v0.1.3
git push origin v0.1.3
```

1. Monitor workflow execution in Actions.
2. Download installers from the generated release assets.

Workflow file:

- [.github/workflows/release.yml](.github/workflows/release.yml)

## Deployment (Web)

Deploy to Vercel:

1. Import repository in Vercel.
2. Select Vite preset.
3. Build command: npm run build.
4. Output directory: dist.

SPA fallback is configured in [vercel.json](vercel.json).

## Contributing

Contributions are welcome.

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Security

Please report vulnerabilities responsibly.

- [SECURITY.md](SECURITY.md)

## License

MIT License

- [LICENSE](LICENSE)

## Developer

Crafted by [Hridoy Sarker](https://hcsarker.me)

[![Portfolio](https://img.shields.io/badge/Portfolio-hcsarker.me-0ea5e9?style=for-the-badge&logo=firefoxbrowser&logoColor=white)](https://hcsarker.me)
[![GitHub](https://img.shields.io/badge/GitHub-@hcsarker-111827?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hcsarker)
