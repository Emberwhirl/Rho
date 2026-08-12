param(
    [string]$RuntimeRoot = (Join-Path $PSScriptRoot "..\.rho\runtime"),
    [string]$RscriptPath = $env:RHO_RSCRIPT
)

$ErrorActionPreference = "Stop"
if (-not $IsWindows -and $PSVersionTable.PSEdition -eq "Core") {
    throw "This bootstrap script supports Windows only."
}
if ([System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture -ne "X64") {
    throw "Phase 0 currently pins the Windows x64 Ark artifact."
}

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$manifest = Get-Content (Join-Path $repositoryRoot "runtime\ark.json") -Raw | ConvertFrom-Json
$artifact = $manifest.'windows-x64'
$installRoot = Join-Path $RuntimeRoot ("ark-" + $manifest.version)
$archive = Join-Path $RuntimeRoot ("ark-" + $manifest.version + "-windows-x64.zip")
$downloadPath = $archive + ".partial"
$maximumDownloadAttempts = 4
$ark = Join-Path $installRoot "ark.exe"
$kernelSpec = Join-Path $installRoot "kernel.json"
$log = Join-Path $installRoot "ark.log"
$emptyRenviron = Join-Path $installRoot "empty.Renviron"
$rscriptCommand = if ($RscriptPath) { $RscriptPath } else { "Rscript" }
if (-not (Get-Command $rscriptCommand -ErrorAction SilentlyContinue)) {
    throw "Rscript was not found. Set RHO_RSCRIPT or pass -RscriptPath explicitly."
}
$rHome = (& $rscriptCommand -e "cat(normalizePath(R.home(), winslash='/', mustWork=TRUE))").Trim()
$rBin = (& $rscriptCommand -e "cat(normalizePath(R.home('bin'), winslash='/', mustWork=TRUE))").Trim()
$libraryExpression = 'cat(paste(normalizePath(.libPaths(), winslash=''/'' ,mustWork=TRUE), collapse=.Platform$path.sep))'
$rLibraries = (& $rscriptCommand -e $libraryExpression).Trim()
if (-not $rHome -or -not $rBin -or -not $rLibraries) {
    throw "Unable to resolve R_HOME, the R DLL directory and R libraries through $rscriptCommand."
}

New-Item -ItemType Directory -Path $RuntimeRoot -Force | Out-Null
if (-not (Test-Path -LiteralPath $ark)) {
    $downloadSucceeded = $false
    $lastDownloadFailure = $null
    for ($attempt = 1; $attempt -le $maximumDownloadAttempts; $attempt += 1) {
        if (Test-Path -LiteralPath $downloadPath) {
            Remove-Item -LiteralPath $downloadPath -Force
        }
        try {
            Invoke-WebRequest -Uri $artifact.url -OutFile $downloadPath
            $actualHash = (Get-FileHash -LiteralPath $downloadPath -Algorithm SHA256).Hash
            if ($actualHash -ne $artifact.sha256) {
                throw "Ark archive checksum mismatch: expected $($artifact.sha256), got $actualHash"
            }
            Move-Item -LiteralPath $downloadPath -Destination $archive -Force
            $downloadSucceeded = $true
            break
        }
        catch {
            $lastDownloadFailure = $_
            if (Test-Path -LiteralPath $downloadPath) {
                Remove-Item -LiteralPath $downloadPath -Force -ErrorAction SilentlyContinue
            }
            if ($attempt -lt $maximumDownloadAttempts) {
                $retryDelaySeconds = 5 * [math]::Pow(2, $attempt - 1)
                Write-Warning ("Ark download attempt {0}/{1} failed; retrying in {2}s: {3}" -f $attempt, $maximumDownloadAttempts, $retryDelaySeconds, $_.Exception.Message)
                Start-Sleep -Seconds $retryDelaySeconds
            }
        }
    }
    if (-not $downloadSucceeded) {
        $lastMessage = if ($lastDownloadFailure) { $lastDownloadFailure.Exception.Message } else { "unknown download failure" }
        throw "Unable to download and verify the pinned Ark archive after $maximumDownloadAttempts attempts. Last error: $lastMessage"
    }
    Expand-Archive -LiteralPath $archive -DestinationPath $installRoot -Force
}
[System.IO.File]::WriteAllText($emptyRenviron, "", (New-Object System.Text.UTF8Encoding($false)))

$spec = [ordered]@{
    argv = @(
        $ark,
        "--connection_file",
        "{connection_file}",
        "--session-mode",
        "console",
        "--log",
        $log,
        "--",
        "--interactive",
        "--no-environ",
        "--no-init-file",
        "--no-site-file"
    )
    display_name = "Ark R $($manifest.version) (Rho)"
    language = "R"
    interrupt_mode = "message"
    kernel_protocol_version = "5.4"
    env = [ordered]@{
        R_HOME = $rHome
        R_LIBS = $rLibraries
        R_ENVIRON_USER = $emptyRenviron
        PATH = $rBin + ";" + $env:PATH
    }
}
$specJson = $spec | ConvertTo-Json -Depth 4
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($kernelSpec, $specJson, $utf8WithoutBom)

Write-Output $kernelSpec
