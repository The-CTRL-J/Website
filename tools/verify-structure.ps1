Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

$checks = @(
  @{ Source = "website\public\assets\css\base.css"; Target = "assets\css\base.css" },
  @{ Source = "website\public\assets\js\site.js"; Target = "assets\js\site.js" },
  @{ Source = "website\public\assets\js\translations.js"; Target = "assets\js\translations.js" },
  @{ Source = "website\public\assets\js\ninconvert.js"; Target = "assets\js\ninconvert.js" },
  @{ Source = "website\src\index.html"; Target = "index.html" },
  @{ Source = "website\src\resources\index.html"; Target = "resources\index.html" },
  @{ Source = "website\src\credit\index.html"; Target = "credit\index.html" },
  @{ Source = "website\src\ninconvert\index.html"; Target = "ninconvert\index.html" }
)

$errors = @()

foreach ($check in $checks) {
  $srcPath = Join-Path $repoRoot $check.Source
  $dstPath = Join-Path $repoRoot $check.Target

  if (-not (Test-Path $srcPath)) {
    $errors += "Missing source: $($check.Source)"
    continue
  }
  if (-not (Test-Path $dstPath)) {
    $errors += "Missing publish target: $($check.Target)"
    continue
  }

  $srcHash = (Get-FileHash -Algorithm SHA256 -Path $srcPath).Hash
  $dstHash = (Get-FileHash -Algorithm SHA256 -Path $dstPath).Hash

  if ($srcHash -ne $dstHash) {
    $errors += "Out of sync: $($check.Source) != $($check.Target)"
  }
}

if ($errors.Count -gt 0) {
  Write-Host "[verify] Structure check FAILED:" -ForegroundColor Red
  $errors | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

Write-Host "[verify] Structure check OK." -ForegroundColor Green
