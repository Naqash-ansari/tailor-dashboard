Set-Location -LiteralPath $PSScriptRoot

while ($true) {
  "[$(Get-Date -Format s)] starting next dev" | Out-File -FilePath dev-server.log -Append
  node node_modules\next\dist\bin\next dev -H 0.0.0.0 *>> dev-server.log
  "[$(Get-Date -Format s)] next dev exited; restarting in 2 seconds" | Out-File -FilePath dev-server.log -Append
  Start-Sleep -Seconds 2
}
