# Shop Dashboard Test

A Windows-ready Next.js tailor dashboard that runs in the browser at `http://localhost:3000`.

## Requirements

- Windows
- Node.js 18.17 or newer
- npm

## Install

Open PowerShell in this folder:

```powershell
cd shop-dashboard-test
npm install
```

## Production Build

```powershell
npm run build
```

## Start The App

From this folder:

```powershell
npm start
```

Then open:

```text
http://localhost:3000
```

## App Pages

- Dashboard: `http://localhost:3000`
- New customer and measurements form: `http://localhost:3000/customers/new`
- Saved customer list: `http://localhost:3000/customers`

Customer records are saved in a local SQLite database file:

```text
data/tailor-dashboard.db
```

The saved customers page supports search by customer name or phone number, plus edit, preview, and delete actions. If older browser `localStorage` records exist, the app migrates them into SQLite on first load.

## Customer Laptop Setup

Install once:

```powershell
npm install
npm run build
```

Daily use:

```powershell
..\start-app.bat
```

To back up customer data, copy this file:

```text
data/tailor-dashboard.db
```

## Windows Browser Launcher

From the parent folder, run:

```powershell
.\start-app.bat
```

The batch file changes into `shop-dashboard-test`, starts the production server with `npm start`, and opens `http://localhost:3000` in the default browser.

## Create Desktop Shortcut

From the parent folder, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\create-desktop-shortcut.ps1
```

This creates a desktop shortcut named `Shop Dashboard`. Double-clicking it runs `start-app.bat`, starts the app, and opens the browser at `http://localhost:3000`.

## Notes

- This project does not use Electron.
- Run `npm run build` before using `npm start`.
- The app uses `localhost:3000`.
