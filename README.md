<p align="center">
  <img src="icon.png" width="128" alt="Yapper logo" />
</p>

# Yapper

**Yapper is an open source, free-to-use Discord alternative.**

This repository is the **Android port** of Yapper for mobile. It opens Yapper full screen, like a native app.

🌐 Website: https://www.yapper.website/

## Download

Grab the latest APK from the [Releases page](../../releases/latest) (`Yapper.apk`), open it on your Android device and install it. You may need to allow installs from unknown sources.

Every push to `main` is built automatically by GitHub Actions. You can also download the APK from the **Actions** tab (artifact `Yapper-apk`).

## Build it yourself

Requirements: JDK 17, Android SDK, Gradle 8.7+.

```bash
gradle assembleRelease
```

The APK will be at `app/build/outputs/apk/release/app-release.apk`.

## Contributing

Yapper is open source — issues and pull requests are welcome.
