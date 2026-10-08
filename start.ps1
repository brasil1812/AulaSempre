param([switch]$SkipBuild)
$ErrorActionPreference = 'Stop'
$projectPath = $PSScriptRoot
$backendPath = Join-Path $projectPath 'Back-end'
$runtimePath = Join-Path $projectPath '.runtime'
New-Item -ItemType Directory -Path $runtimePath -Force | Out-Null
function PortOpen([string]$HostName, [int]$PortNumber) {
    if ($HostName -eq 'localhost') { $HostName = '127.0.0.1' }
    $client = New-Object System.Net.Sockets.TcpClient
    try { $task = $client.ConnectAsync($HostName, $PortNumber); if (-not $task.Wait(1000)) { return $false }; return $client.Connected }
    catch { return $false }
    finally { $client.Dispose() }
}
$envPath = Join-Path $backendPath '.env'
if (-not (Test-Path -LiteralPath $envPath)) {
    $bytes = New-Object byte[] 48
    $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $generator.GetBytes($bytes); $generator.Dispose()
    $secret = [BitConverter]::ToString($bytes).Replace('-', '')
    $content = (Get-Content (Join-Path $backendPath '.env.example') -Raw) -replace '(?m)^JWT_SECRET=.*$', "JWT_SECRET=$secret"
    [IO.File]::WriteAllText($envPath, $content, (New-Object Text.UTF8Encoding $false))
}
$settings = @{}
foreach ($line in (Get-Content -LiteralPath $envPath)) {
    if ($line -match '^\s*([A-Z_]+)\s*=(.*)$') { $settings[$Matches[1]] = $Matches[2].Trim().Trim('"').Trim("'") }
}
$dbHost = if ($settings.DB_HOST) { $settings.DB_HOST } else { '127.0.0.1' }
$dbPort = if ($settings.DB_PORT) { [int]$settings.DB_PORT } else { 3306 }
if (-not (PortOpen $dbHost $dbPort)) {
    if ($dbHost -notin @('localhost','127.0.0.1') -or $dbPort -ne 3306) { throw 'O banco configurado no .env não está acessível. Inicie esse banco antes de continuar.' }
    $mysqlPath = Join-Path $projectPath 'Data-base/.runtime/mysql-8.4.9-winx64'
    $dataPath = Join-Path $projectPath 'Data-base/.runtime/data'
    if ((Test-Path "$mysqlPath/bin/mysqld.exe") -and (Test-Path "$dataPath/mysql")) {
        Start-Process -FilePath "$mysqlPath/bin/mysqld.exe" -ArgumentList @("--basedir=`"$mysqlPath`"", "--datadir=`"$dataPath`"", '--port=3306', '--bind-address=127.0.0.1', '--console') -WindowStyle Hidden -RedirectStandardOutput "$runtimePath/mysql-out.log" -RedirectStandardError "$runtimePath/mysql-err.log" | Out-Null
    } elseif (Get-Command docker -ErrorAction SilentlyContinue) {
        & docker compose -f (Join-Path $projectPath 'Data-base/docker-compose.yml') up -d
        if ($LASTEXITCODE -ne 0) { throw 'Não foi possível iniciar o MySQL pelo Docker.' }
    } else { throw 'Inicie o MySQL 8.x ou instale/inicie o Docker Desktop e execute novamente.' }
    $ready = $false
    for ($attempt = 0; $attempt -lt 45; $attempt++) { if (PortOpen $dbHost $dbPort) { $ready = $true; break }; Start-Sleep -Seconds 1 }
    if (-not $ready) { throw 'O MySQL não iniciou. Verifique os logs em .runtime.' }
}
Push-Location $projectPath
try {
    foreach ($folder in @('Back-end','Front-end')) {
        if (-not (Test-Path "$folder/node_modules")) { & npm.cmd --prefix $folder ci; if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar dependências de $folder." } }
    }
    & npm.cmd run db:ensure
    if ($LASTEXITCODE -ne 0) { throw 'Falha na preparação do banco. Verifique o .env e os logs.' }
    if (-not $SkipBuild) { & npm.cmd run build; if ($LASTEXITCODE -ne 0) { throw 'Falha na compilação do front-end.' } }
} finally { Pop-Location }
$apiPort = if ($settings.PORT) { [int]$settings.PORT } else { 3000 }
if (-not (PortOpen '127.0.0.1' $apiPort)) {
    $nodePath = (Get-Command node).Source
    Start-Process -FilePath $nodePath -ArgumentList @('src/server.js') -WorkingDirectory $backendPath -WindowStyle Hidden -RedirectStandardOutput "$runtimePath/api-out.log" -RedirectStandardError "$runtimePath/api-err.log" | Out-Null
}
$healthy = $false
for ($attempt = 0; $attempt -lt 15; $attempt++) {
    try { $health = Invoke-RestMethod "http://localhost:$apiPort/health"; if ($health.ok -and $health.database) { $healthy = $true; break } } catch {}
    Start-Sleep -Seconds 1
}
if (-not $healthy) { throw 'A API não confirmou a conexão ao banco. Verifique .runtime/api-err.log.' }
Write-Host "AulaSempre pronto em http://localhost:$apiPort"
