$ErrorActionPreference = "SilentlyContinue"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$appFolder = Join-Path $scriptRoot "shop-dashboard-test"
$url = "http://localhost:3000"
$nextCli = Join-Path $appFolder "node_modules\next\dist\bin\next"

function Test-AppRunning {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    }
    catch {
        return $false
    }
}

function Open-AppBrowser {
    Start-Process -FilePath "rundll32.exe" -ArgumentList "url.dll,FileProtocolHandler $url" -WindowStyle Hidden
}

if (Test-AppRunning) {
    Open-AppBrowser
    exit
}

Start-Process -FilePath "node.exe" -ArgumentList "`"$nextCli`" start -H 127.0.0.1 -p 3000" -WorkingDirectory $appFolder -WindowStyle Hidden

Start-Sleep -Seconds 2
Open-AppBrowser

for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 1
    if (Test-AppRunning) {
        exit
    }
}
