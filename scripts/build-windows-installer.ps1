param(
    [string]$CargoHome = $env:CARGO_HOME,
    [string]$RustupHome = $env:RUSTUP_HOME,
    [string]$RtoolsBin = $env:RTOOLS_BIN,
    [string]$RustupToolchain = $env:RUSTUP_TOOLCHAIN,
    [string]$RuntimeRoot = (Join-Path $PSScriptRoot "..\.rho\runtime"),
    [string]$TauriCliVersion = "2.11.4",
    [string]$TauriConfigOverlayPath = "",
    [ValidateRange(1, 3)]
    [int]$MaximumTauriBuildAttempts = 1,
    [ValidateRange(0, 60)]
    [int]$TauriBuildRetryDelaySeconds = 10
)

$ErrorActionPreference = "Stop"

$repo = (Resolve-Path (Split-Path -Parent $PSScriptRoot)).Path

if (-not $CargoHome) {
    $userCargoHome = Join-Path $env:USERPROFILE ".cargo"
    $CargoHome = if (Test-Path -LiteralPath $userCargoHome) {
        $userCargoHome
    } else {
        "E:\software-data\scoop\persist\rustup\.cargo"
    }
}
if (-not $RustupHome) {
    $userRustupHome = Join-Path $env:USERPROFILE ".rustup"
    $RustupHome = if (Test-Path -LiteralPath $userRustupHome) {
        $userRustupHome
    } else {
        "E:\software-data\scoop\persist\rustup\.rustup"
    }
}
if (-not $RtoolsBin) {
    $RtoolsBin = "C:\rtools45\x86_64-w64-mingw32.static.posix\bin"
}
if (-not $RustupToolchain) {
    $RustupToolchain = "stable-x86_64-pc-windows-gnu"
}

$cargoBin = Join-Path $CargoHome "bin"
if (-not (Test-Path -LiteralPath $cargoBin)) {
    throw "Cargo bin directory not found at $cargoBin."
}
if (-not (Test-Path -LiteralPath $RtoolsBin)) {
    throw "Rtools bin directory not found at $RtoolsBin."
}

$env:CARGO_HOME = $CargoHome
$env:RUSTUP_HOME = $RustupHome
$env:RUSTUP_TOOLCHAIN = $RustupToolchain
$env:PATH = "$RtoolsBin;$cargoBin;$env:PATH"
$sourceRemap = "--remap-path-prefix=$CargoHome=/cargo --remap-path-prefix=$repo=/rho"
$env:RUSTFLAGS = "$sourceRemap $env:RUSTFLAGS".Trim()

if (-not (Get-Command npx.cmd -ErrorAction SilentlyContinue)) {
    throw "npx.cmd was not found on PATH after applying Cargo and Rtools paths."
}

$tauriConfigPath = Join-Path $repo "desktop\src-tauri\tauri.conf.json"
$tauriConfig = Get-Content $tauriConfigPath -Raw | ConvertFrom-Json
$productName = $tauriConfig.productName
$version = $tauriConfig.version
$installerDirectory = Join-Path $repo "target\release\bundle\nsis"
$releaseExecutable = Join-Path $repo "target\release\rho-desktop.exe"

function Test-RhoTransientTauriBundleFailure {
    param(
        [AllowEmptyCollection()]
        [object[]]$Output,
        [string]$InstallerDirectory,
        [string]$ReleaseExecutable
    )

    if (-not (Test-Path -LiteralPath $ReleaseExecutable -PathType Leaf)) {
        return $false
    }
    if (Test-Path -LiteralPath $InstallerDirectory) {
        $existingInstaller = Get-ChildItem -LiteralPath $InstallerDirectory -Filter "*-setup.exe" -File -ErrorAction SilentlyContinue |
            Select-Object -First 1
        if ($existingInstaller) {
            return $false
        }
    }

    $message = (($Output | ForEach-Object { "$_" }) -join "`n")
    if ($message -notmatch '(?i)failed to bundle project') {
        return $false
    }

    return $message -match '(?i)(http status:\s*(?:408|425|429|5\d{2})\b|peer disconnected|connection (?:reset|closed)|error sending request|timed out|timeout)'
}

$resolvedTauriConfigOverlayPath = $null
if ($TauriConfigOverlayPath) {
    $overlayCandidate = if ([System.IO.Path]::IsPathFullyQualified($TauriConfigOverlayPath)) {
        $TauriConfigOverlayPath
    } else {
        Join-Path $repo $TauriConfigOverlayPath
    }
    $resolvedTauriConfigOverlayPath = (Resolve-Path -LiteralPath $overlayCandidate -ErrorAction Stop).Path
    if (-not (Test-Path -LiteralPath $resolvedTauriConfigOverlayPath -PathType Leaf)) {
        throw "Tauri config overlay is not a file: $resolvedTauriConfigOverlayPath"
    }
    $separator = [System.IO.Path]::DirectorySeparatorChar.ToString()
    $trimCharacters = [char[]]@(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    )
    $repoPrefix = $repo.TrimEnd($trimCharacters) + $separator
    if (-not $resolvedTauriConfigOverlayPath.StartsWith($repoPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Resolved Tauri config overlay must be inside the repository: $resolvedTauriConfigOverlayPath"
    }
}
if ($MaximumTauriBuildAttempts -gt 1) {
    $issue33AcceptanceOverlay = (Resolve-Path -LiteralPath (Join-Path $repo "desktop\src-tauri\tauri.issue33-acceptance.conf.json") -ErrorAction Stop).Path
    if (-not $resolvedTauriConfigOverlayPath -or
        -not $resolvedTauriConfigOverlayPath.Equals($issue33AcceptanceOverlay, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Multiple Tauri build attempts are restricted to the Issue #33 acceptance overlay."
    }
}

& (Join-Path $PSScriptRoot "prepare-runtime-resources.ps1") -RuntimeRoot $RuntimeRoot

Push-Location (Join-Path $repo "desktop\src-tauri")
try {
    $tauriArguments = @("-y", "@tauri-apps/cli@$TauriCliVersion", "build")
    if ($resolvedTauriConfigOverlayPath) {
        $tauriArguments += @("--config", $resolvedTauriConfigOverlayPath)
    }
    $buildSucceeded = $false
    for ($attempt = 1; $attempt -le $MaximumTauriBuildAttempts; $attempt += 1) {
        $tauriOutput = @()
        & npx.cmd @tauriArguments 2>&1 | Tee-Object -Variable tauriOutput
        $tauriExitCode = $LASTEXITCODE
        if ($tauriExitCode -eq 0) {
            $buildSucceeded = $true
            break
        }

        $transientBundleFailure = Test-RhoTransientTauriBundleFailure `
            -Output $tauriOutput `
            -InstallerDirectory $installerDirectory `
            -ReleaseExecutable $releaseExecutable
        if (-not $transientBundleFailure -or $attempt -ge $MaximumTauriBuildAttempts) {
            throw "Tauri build failed with exit code $tauriExitCode on attempt $attempt of $MaximumTauriBuildAttempts."
        }

        Write-Warning "Tauri bundling hit a recognized transient transport failure on attempt $attempt of $MaximumTauriBuildAttempts; retrying after $TauriBuildRetryDelaySeconds seconds."
        if ($TauriBuildRetryDelaySeconds -gt 0) {
            Start-Sleep -Seconds $TauriBuildRetryDelaySeconds
        }
    }
    if (-not $buildSucceeded) {
        throw "Tauri build did not complete successfully."
    }
}
finally {
    Pop-Location
}

$installer = Get-ChildItem -LiteralPath $installerDirectory -Filter "*-setup.exe" -ErrorAction Stop |
    Sort-Object LastWriteTimeUtc -Descending |
    Select-Object -First 1
if (-not $installer) {
    throw "Installer not found under $installerDirectory after building $productName $version."
}

Write-Host "Rho installer: $($installer.FullName)"
if ($env:GITHUB_OUTPUT) {
    Add-Content -LiteralPath $env:GITHUB_OUTPUT -Value "installer_path=$($installer.FullName)"
    Add-Content -LiteralPath $env:GITHUB_OUTPUT -Value "installer_name=$($installer.Name)"
    Add-Content -LiteralPath $env:GITHUB_OUTPUT -Value "product_name=$productName"
    Add-Content -LiteralPath $env:GITHUB_OUTPUT -Value "app_version=$version"
}
