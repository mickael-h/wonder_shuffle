# WSL2 Port Forwarding Script for Vite Dev Server
# Run this in Windows PowerShell as Administrator

# Get WSL2 IP address (you may need to update this)
$wslIP = (wsl hostname -I).Trim().Split()[0]

Write-Host "WSL2 IP: $wslIP" -ForegroundColor Green

# Remove existing forwarding rule if it exists
netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=0.0.0.0 2>$null

# Add port forwarding
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=$wslIP

Write-Host "Port forwarding set up!" -ForegroundColor Green
Write-Host "Forwarding: 0.0.0.0:5173 -> $wslIP`:5173" -ForegroundColor Cyan

# Get Windows host IP
$windowsIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*" } | Select-Object -First 1).IPAddress

Write-Host "`nAccess from mobile device using:" -ForegroundColor Yellow
Write-Host "http://$windowsIP`:5173" -ForegroundColor White

Write-Host "`nTo remove forwarding, run:" -ForegroundColor Gray
Write-Host "netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=0.0.0.0" -ForegroundColor Gray

