# Desktop executable

The app can run as a desktop window instead of a website.

## Run from source

```bash
npm install
npm run desktop
```

This builds `dist/`, starts an internal static server, and opens an Electron
window. No browser or external web server is involved.

## Package Linux

```bash
npm run package:linux
```

Output: `release/SiliconPulse-3D-0.1.0.AppImage`.

The AppImage is a single executable file. Make it executable and run it:

```bash
chmod +x release/SiliconPulse-3D-0.1.0.AppImage
./release/SiliconPulse-3D-0.1.0.AppImage
```

`electron-builder` downloads Electron and the AppImage runtime on the first
build. On a normal desktop/CI runner this works; in a restricted container the
download or Chromium sandbox may fail.

## Portable folder

`release/SiliconPulse-3D-linux-x64.zip` is a portable build:

```bash
unzip SiliconPulse-3D-linux-x64.zip
cd SiliconPulse-3D
./SiliconPulse-3D.sh
```

The launcher starts the bundled Electron binary with the Chromium sandbox
disabled, because the sandbox helper inside a copied portable folder is not
setuid-root. The app still only serves local files on 127.0.0.1.

## GitHub Actions

`.github/workflows/desktop.yml` builds the AppImage on an Ubuntu runner and
uploads it as a workflow artifact. Use **Actions → Build desktop app → Run
workflow**, then download `SiliconPulse-3D-linux`.

## Data

Uploaded diagrams, nested modules and edits use localStorage in the Electron
profile. They are local to that user/machine.
