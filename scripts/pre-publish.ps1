param([switch]$Fix)
$root = Split-Path -Parent $PSScriptRoot
$errors = @()
Write-Host "=== QKYuD pre-pub check ===" -ForegroundColor Cyan

Write-Host "`n[1/5] index.html..." -NoNewline
$html = Get-Content (Join-Path $root "index.html") -Raw -Encoding UTF8
if ($html -match 'type=\"module\" src=\"js/app\.js') { Write-Host " module OK" -ForegroundColor Green }
else { Write-Host " MODULE MISSING" -ForegroundColor Red; $errors += "index.html: no module load" }
if ($html -match 'src=\"script\.js\"') { Write-Host " has old script.js" -ForegroundColor Red; $errors += "index.html: has old script.js" }
else { Write-Host " no old script.js" -ForegroundColor Green }

Write-Host "`n[2/5] JS modules..."
$jsDir = Join-Path $root "js"
$expected = @("app.js","state.js","utils.js","calendar.js","bazi.js","liuyao.js","fengshui.js","chat.js","xingming.js","meihua.js","hehun.js","ziwei.js")
$found = Get-ChildItem $jsDir -Filter "*.js" | Select-Object -ExpandProperty Name
foreach ($f in $expected) {
    if ($found -contains $f) { Write-Host "  $f OK" -ForegroundColor Green }
    else { Write-Host "  $f MISSING" -ForegroundColor Red; $errors += "js/$f missing" }
}
foreach ($f in $found) {
    if ($expected -notcontains $f) { Write-Host "  extra: $f" -ForegroundColor Yellow }
}

Write-Host "`n[3/5] Service Worker..." -NoNewline
$sw = Get-Content (Join-Path $root "sw.js") -Raw -Encoding UTF8
if ($sw -match 'qkyd-v\d') { 
    $ver = [regex]::Match($sw, 'qkyd-v(\d)').Groups[1].Value
    Write-Host " cache qkyd-v$ver" -ForegroundColor Green 
} else { Write-Host " NO CACHE VER" -ForegroundColor Red; $errors += "sw.js: no cache ver" }
foreach ($f in $expected) {
    if ($sw -notmatch "js/$f") { Write-Host "  warn: js/$f not cached" -ForegroundColor Yellow }
}

Write-Host "`n[4/5] manifest.json..." -NoNewline
$manifest = Join-Path $root "manifest.json"
if (Test-Path $manifest) { 
    try { $m = Get-Content $manifest -Raw -Encoding UTF8 | ConvertFrom-Json; Write-Host " OK $($m.name)" -ForegroundColor Green }
    catch { Write-Host " PARSE FAIL" -ForegroundColor Red; $errors += "manifest.json parse fail" }
} else { Write-Host " MISSING" -ForegroundColor Red; $errors += "manifest.json missing" }

Write-Host "`n[5/5] style.css..." -NoNewline
$css = Join-Path $root "style.css"
if (Test-Path $css) {
    $len = (Get-Content $css -Raw -Encoding UTF8).Length
    if ($len -gt 100) { Write-Host " OK ($len chars)" -ForegroundColor Green }
    else { Write-Host " SHORT ($len chars)" -ForegroundColor Yellow }
} else { Write-Host " MISSING" -ForegroundColor Red; $errors += "style.css missing" }

Write-Host "`n========"
if ($errors.Count -eq 0) {
    Write-Host "ALL CHECKS PASSED. Ready to publish." -ForegroundColor Green
    exit 0
} else {
    Write-Host "$($errors.Count) issues to fix:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    exit 1
}
