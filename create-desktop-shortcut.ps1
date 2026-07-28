$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$batchPath = Join-Path $scriptRoot "start-app.bat"
$hiddenLauncherPath = Join-Path $scriptRoot "start-app-hidden.vbs"
$iconPath = Join-Path $scriptRoot "shop-dashboard-test\public\brand\aans-fabric-logo.ico"

if (-not (Test-Path $batchPath)) {
    throw "Could not find start-app.bat at $batchPath"
}

if (-not (Test-Path $hiddenLauncherPath)) {
    throw "Could not find start-app-hidden.vbs at $hiddenLauncherPath"
}

$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Shop Dashboard.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "$env:SystemRoot\System32\wscript.exe"
$shortcut.Arguments = "`"$hiddenLauncherPath`""
$shortcut.WorkingDirectory = $scriptRoot
$shortcut.IconLocation = $iconPath
$shortcut.Description = "Open the Shop Dashboard in the browser without showing a terminal"
$shortcut.Save()

Write-Host "Created shortcut: $shortcutPath"
