<p align="center">
  <img src="icon.png" width="128" alt="Yapper logo" />
</p>

# Yapper

**Yapper is an open source, free-to-use Discord alternative.**

This repository contains the native app ports of Yapper for **Android, iOS, macOS and Windows**. Each one opens Yapper full screen, like a native app.

🌐 Website: https://www.yapper.website/

## Download (v1.0.0)

Everything is on the [v1.0.0 release page](../../releases/tag/v1.0.0).

| Platform | File | How to install |
| --- | --- | --- |
| Android | `Yapper.apk` | Open it and allow installs from unknown sources. |
| iOS / iPadOS | `Yapper-iOS.ipa` | Unsigned build. Sideload with [AltStore](https://altstore.io) or [Sideloadly](https://sideloadly.io). |
| macOS (Apple Silicon) | `Yapper-macOS-arm64.dmg` | Open the DMG and drag Yapper into Applications. |
| macOS (Intel) | `Yapper-macOS-x64.dmg` | Same as above. |
| Windows | `Yapper-Setup.exe` | Run the installer wizard. |

### Windows installer options

The installer wizard has an options page with two optional checkboxes: **Open Yapper when Windows starts** and **Check for updates automatically**. Both are on by default and can be switched off. Run the installer again to change them.

### First launch warnings

The builds are not code-signed.

- **Windows:** if SmartScreen appears, click *More info* then *Run anyway*.
- **macOS:** if macOS says the app can't be opened, right-click Yapper in Applications and choose *Open*, or run `xattr -cr /Applications/Yapper.app` in Terminal.

## Project layout

| Folder | What it is |
| --- | --- |
| `app/` | Android app (Java, WebView) |
| `ios/` | iOS app (Swift, WKWebView), project generated with XcodeGen |
| `desktop/` | Windows and macOS app (Electron) with installer wizard / DMG |

## Build it yourself

- **Android:** `gradle assembleRelease` (JDK 17, Android SDK).
- **iOS:** `cd ios && xcodegen generate`, then open `Yapper.xcodeproj` in Xcode.
- **Windows / macOS:** `cd desktop && npm install && npx electron-builder --win` (or `--mac`).

Every push to `main` is built by GitHub Actions and published to the v1.0.0 release.

## Contributing

Yapper is open source. Issues and pull requests are welcome.
