# validate-after-agent.ps1
# Hook: runs lint + tsc checks after an agent finishes implementation.
# If errors are found, returns them formatted for the agent to fix.
#
# Usage:
#   .opencode\hooks\validate-after-agent.ps1 -Layer frontend
#   .opencode\hooks\validate-after-agent.ps1 -Layer backend
#
# Exit code: 0 if clean, 1 if errors found

param(
  [Parameter(Mandatory)]
  [ValidateSet("frontend", "backend")]
  [string]$Layer
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Output "`n# [$Layer] $msg" }
function Write-ErrorBlock($title, $lines) {
  if (-not $lines) { return }
  Write-Output "`n### $title"
  Write-Output '```'
  foreach ($line in $lines) { Write-Output $line }
  Write-Output '```'
}

$hasErrors = $false

if ($Layer -eq "frontend") {
  # --- Lint ---
  Write-Step "Running pnpm --filter frontend lint..."
  $lintOut = & pnpm --filter frontend lint 2>&1
  $lintExit = $LASTEXITCODE
  $lintLines = @($lintOut) | Where-Object { $_ }

  if ($lintExit -ne 0) {
    $hasErrors = $true
    Write-ErrorBlock "ESLint errors" $lintLines
  } else {
    Write-Output "Lint: OK"
  }

  # --- TypeScript check (tsc -b) ---
  Write-Step "Running pnpm --filter frontend build (tsc -b)..."
  $tscOut = & pnpm --filter frontend build 2>&1
  $tscExit = $LASTEXITCODE
  $tscLines = @($tscOut) | Where-Object { $_ }

  if ($tscExit -ne 0) {
    $hasErrors = $true
    Write-ErrorBlock "TypeScript errors" $tscLines
  } else {
    Write-Output "TypeScript: OK"
  }

} elseif ($Layer -eq "backend") {
  # --- Lint ---
  Write-Step "Running pnpm --filter backend lint..."
  $lintOut = & pnpm --filter backend lint 2>&1
  $lintExit = $LASTEXITCODE
  $lintLines = @($lintOut) | Where-Object { $_ }

  if ($lintExit -ne 0) {
    $hasErrors = $true
    Write-ErrorBlock "Lint errors" $lintLines
  } else {
    Write-Output "Lint: OK"
  }

  # --- TypeScript check ---
  Write-Step "Running pnpm --filter backend typecheck (tsc --noEmit)..."
  $tscOut = & pnpm --filter backend typecheck 2>&1
  $tscExit = $LASTEXITCODE
  $tscLines = @($tscOut) | Where-Object { $_ }

  if ($tscExit -ne 0) {
    $hasErrors = $true
    Write-ErrorBlock "TypeScript errors" $tscLines
  } else {
    Write-Output "TypeScript: OK"
  }
}

Write-Step "Result: $(if ($hasErrors) { 'ERRORS FOUND — agent must fix before proceeding' } else { 'ALL CHECKS PASSED' })"

if ($hasErrors) {
  exit 1
}
exit 0
