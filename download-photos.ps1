# ANAAKA: download distinct catalogue photos for local/offline site assets.
$ErrorActionPreference = 'Stop'
$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifest = Get-Content -LiteralPath (Join-Path $base 'catalog-download-manifest.json') -Raw | ConvertFrom-Json
$map = @{}
$hashes = @{}
$failed = @()
$items = @($manifest.PSObject.Properties)
$done = 0
foreach ($entry in $items) {
  $done++
  $key = $entry.Name
  $image = $entry.Value
  $rel = [string]$image.file
  $file = Join-Path $base ($rel -replace '/', '\')
  $folder = Split-Path -Parent $file
  if (-not (Test-Path $folder)) { New-Item -ItemType Directory -Path $folder -Force | Out-Null }
  try {
    $needsDownload = (-not (Test-Path $file)) -or ((Get-Item $file).Length -lt 2000)
    if ($needsDownload) {
      $success = $false
      for ($attempt=0; $attempt -lt 3; $attempt++) {
        try {
          Invoke-WebRequest -Uri $image.url -OutFile $file -TimeoutSec 25 -UseBasicParsing -Headers @{'User-Agent'='Mozilla/5.0'}
          $success = $true
          break
        } catch {
          if ($attempt -lt 2) { Start-Sleep -Seconds (2+$attempt) }
        }
      }
      if (-not $success) { throw 'Image URL could not be downloaded' }
    }
    if ((Get-Item $file).Length -lt 2000) { throw 'Image download is empty' }
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $looksValid = ($bytes[0] -eq 255 -and $bytes[1] -eq 216 -and $bytes[2] -eq 255) -or
      ([System.Text.Encoding]::ASCII.GetString($bytes,0,4) -eq 'RIFF')
    if (-not $looksValid) { throw 'Downloaded file is not a valid JPEG or WebP' }
    $sha = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash
    if ($hashes.ContainsKey($sha)) { throw 'Identical photograph already assigned to another product' }
    $hashes[$sha] = $key
    $map[$key] = $rel
    Write-Host "[$done/$($items.Count)] OK $key" -ForegroundColor DarkGreen
  } catch {
    $failed += $key
    Write-Host "[$done/$($items.Count)] FAILED $key -- $($_.Exception.Message)" -ForegroundColor Yellow
  }
  $mapJson = ConvertTo-Json -InputObject $map -Compress -Depth 5
  [System.IO.File]::WriteAllText((Join-Path $base 'downloaded-media.js'), "window.ANAAKA_DOWNLOADED_MEDIA=$mapJson;`n", [System.Text.Encoding]::UTF8)
}
Write-Host "Finished: $($map.Count) local photos. $($failed.Count) unavailable."
if ($failed.Count -gt 0) { Write-Host 'Unavailable photos will continue to load online until the downloader succeeds.' }
