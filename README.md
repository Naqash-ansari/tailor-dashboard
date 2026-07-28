# Shop Dashboard Test

This workspace contains a Windows-ready Next.js tailor dashboard app in `shop-dashboard-test`.

## What Is Included

- Next.js app named `shop-dashboard-test`
- TypeScript
- Tailwind CSS
- Production build script
- Browser-based dashboard at `http://localhost:3000`
- Tailor customer measurement form
- Saved customers table with search, edit, and delete
- Local SQLite database saving
- `start-app.bat` Windows launcher
- `create-desktop-shortcut.ps1` shortcut creator

## Install Dependencies

Open PowerShell in this folder and run:

```powershell
cd shop-dashboard-test
npm install
```

## Build For Production

```powershell
npm run build
```

## Start The App Manually

From this parent folder:

```powershell
.\start-app.bat
```

The batch file changes into `shop-dashboard-test`, runs `npm start`, and opens `http://localhost:3000` in your default browser.

The desktop shortcut uses `start-app-hidden.vbs`, so clicking the icon starts the app in the background and opens the browser without showing a terminal window.

## App Pages

- Dashboard: `http://localhost:3000`
- New customer and measurements form: `http://localhost:3000/customers/new`
- Saved customer list: `http://localhost:3000/customers`

## Create The Desktop Shortcut

From this parent folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\create-desktop-shortcut.ps1
```

This creates a desktop shortcut named `Shop Dashboard`. Double-clicking the shortcut runs `start-app.bat`, starts the Next.js production server, and opens the app in the browser.

## Data Storage

Customer records are saved in the local SQLite database:

```text
shop-dashboard-test\data\tailor-dashboard.db
```

Back up this file to keep customer data safe.

## Important Notes

- No Electron is used.
- The app opens in the browser.
- The configured address is `http://localhost:3000`.
- Run `npm run build` before using `npm start`.
