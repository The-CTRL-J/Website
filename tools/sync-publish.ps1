Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

$sourceRoot = Join-Path $repoRoot "website\src"
$sourcePublic = Join-Path $repoRoot "website\public"
$sourceAssets = Join-Path $sourcePublic "assets"

$publishRoot = $repoRoot
$publishAssets = Join-Path $publishRoot "assets"

if (-not (Test-Path $sourceRoot)) {
  throw "Missing source directory: $sourceRoot"
}
if (-not (Test-Path $sourcePublic)) {
  throw "Missing public directory: $sourcePublic"
}

Write-Host "[sync] Copy assets..." -ForegroundColor Cyan
if (-not (Test-Path $sourceAssets)) {
  throw "Missing source assets directory: $sourceAssets"
}
if (Test-Path $publishAssets) {
  Remove-Item -Recurse -Force $publishAssets
}
Copy-Item -Recurse -Force $sourceAssets $publishAssets

Write-Host "[sync] Copy pages..." -ForegroundColor Cyan
Copy-Item -Force (Join-Path $sourceRoot "index.html") (Join-Path $publishRoot "index.html")

$pages = @("resources", "credit", "ninconvert")
foreach ($page in $pages) {
  $targetDir = Join-Path $publishRoot $page
  if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir | Out-Null
  }
  Copy-Item -Force (Join-Path $sourceRoot "$page\index.html") (Join-Path $targetDir "index.html")
}

Write-Host "[sync] Done." -ForegroundColor Green
