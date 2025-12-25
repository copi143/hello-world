#!/usr/bin/env pwsh

$lang_env = $env:LANG
if (-not $lang_env) { $lang_env = "en_US" }
$lang_code = $lang_env.Split(".")[0]
$lang_region = $lang_code -replace "_", "-"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$i18nDir = Join-Path $scriptDir "i18n"
$codeDir = Join-Path $scriptDir "code"

$locale_file = if (Test-Path (Join-Path $i18nDir ("$($lang_region.ToLower()).txt"))) {
    "$($lang_region.ToLower()).txt"
} else {
    "en-us.txt"
}

$texts = Get-Content (Join-Path $i18nDir $locale_file)
$replace_text = $texts[0]

function Shuffle-Files {
    $global:files = Get-ChildItem -Name $codeDir | Get-Random -Count ([int](Get-ChildItem $codeDir).Count)
}

Shuffle-Files

Clear-Host

foreach ($line in $texts) {
    foreach ($char in $line.ToCharArray()) {
        Write-Host -NoNewline $char
        Start-Sleep -Milliseconds 40
    }
    Write-Host
    Start-Sleep -Milliseconds 200
}
Write-Host

Start-Sleep -Seconds 2

while ($true) {
    foreach ($file in $files) {
        $code_text = Get-Content (Join-Path $codeDir $file)
        $code_text = $code_text -replace '\$\$\$', [Regex]::Escape($replace_text)
        foreach ($line in $code_text) {
            foreach ($char in $line.ToCharArray()) {
                Write-Host -NoNewline $char
                Start-Sleep -Milliseconds 20
            }
            Write-Host
            Start-Sleep -Milliseconds 100
        }
        Start-Sleep -Seconds 1
        foreach ($line in $code_text) {
            Write-Host -NoNewline "`e[F`e[2K"
        }
    }
    Shuffle-Files
}
