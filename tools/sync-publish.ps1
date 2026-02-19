Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

$sourceRoot = Join-Path $repoRoot "website\src"
$sourcePublic = Join-Path $repoRoot "website\public"

$publishRoot = $repoRoot
$publishAssets = Join-Path $publishRoot "assets"

if (-not (Test-Path $sourceRoot)) {
  throw "Missing source directory: $sourceRoot"
}
if (-not (Test-Path $sourcePublic)) {
  throw "Missing public directory: $sourcePublic"
}

Write-Host "[sync] Copy assets..." -ForegroundColor Cyan
Copy-Item -Recurse -Force (Join-Path $sourcePublic "assets") $publishAssets

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
