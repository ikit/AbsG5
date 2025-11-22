# Rollback Script for AbsG5 Migration
# This script rolls back the migration to the pre-migration state

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupPath,
    
    [switch]$Force,
    [switch]$SkipDatabase,
    [switch]$SkipCode
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "AbsG5 Migration Rollback Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Safety check
if (-not $Force) {
    Write-Host "WARNING: This will rollback the migration!" -ForegroundColor Red
    Write-Host "         - Code will be reverted to master branch" -ForegroundColor Yellow
    Write-Host "         - Database will be restored from backup" -ForegroundColor Yellow
    Write-Host "         - All migration changes will be lost" -ForegroundColor Yellow
    Write-Host ""
    $confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
    if ($confirmation -ne "yes") {
        Write-Host "Rollback cancelled." -ForegroundColor Yellow
        exit 0
    }
}

$rollbackSuccess = $true

# Step 1: Code Rollback
if (-not $SkipCode) {
    Write-Host ""
    Write-Host "[1/3] Rolling back code changes..." -ForegroundColor Yellow
    
    # Check current branch
    $currentBranch = git branch --show-current
    Write-Host "  Current branch: $currentBranch" -ForegroundColor Gray
    
    if ($currentBranch -eq "migration/modernization-stack") {
        # Stash any uncommitted changes
        Write-Host "  Stashing uncommitted changes..." -ForegroundColor Gray
        git stash save "Rollback stash $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" 2>&1 | Out-Null
        
        # Switch to master
        Write-Host "  Switching to master branch..." -ForegroundColor Gray
        git checkout master 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Switched to master branch" -ForegroundColor Green
        } else {
            Write-Host "✗ Error: Could not switch to master branch" -ForegroundColor Red
            $rollbackSuccess = $false
        }
    } else {
        Write-Host "  Already on master branch" -ForegroundColor Gray
    }
    
    # Restore dependencies
    if ($rollbackSuccess) {
        Write-Host ""
        Write-Host "  Restoring backend dependencies..." -ForegroundColor Gray
        Push-Location absg-core
        npm ci 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Backend dependencies restored" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Error restoring backend dependencies" -ForegroundColor Red
            $rollbackSuccess = $false
        }
        Pop-Location
        
        Write-Host "  Restoring frontend dependencies..." -ForegroundColor Gray
        Push-Location absg-client
        npm ci 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Frontend dependencies restored" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Error restoring frontend dependencies" -ForegroundColor Red
            $rollbackSuccess = $false
        }
        Pop-Location
    }
} else {
    Write-Host ""
    Write-Host "[1/3] Skipping code rollback" -ForegroundColor Yellow
}

# Step 2: Database Rollback
if (-not $SkipDatabase) {
    Write-Host ""
    Write-Host "[2/3] Rolling back database..." -ForegroundColor Yellow
    
    # Validate backup path
    if (-not (Test-Path $BackupPath)) {
        Write-Host "✗ Error: Backup path not found: $BackupPath" -ForegroundColor Red
        $rollbackSuccess = $false
    } else {
        # Find backup file
        $backupFile = Get-ChildItem -Path $BackupPath -Filter "absg5_full.backup" -ErrorAction SilentlyContinue
        if (-not $backupFile) {
            $backupFile = Get-ChildItem -Path $BackupPath -Filter "absg5_full.sql" -ErrorAction SilentlyContinue
        }
        
        if ($backupFile) {
            Write-Host "  Found backup: $($backupFile.Name)" -ForegroundColor Gray
            
            # Call restore script
            $restoreScript = Join-Path $PSScriptRoot "restore-database.ps1"
            if (Test-Path $restoreScript) {
                & $restoreScript -BackupFile $backupFile.FullName -Force -DropExisting
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✓ Database restored from backup" -ForegroundColor Green
                } else {
                    Write-Host "✗ Error: Database restoration failed" -ForegroundColor Red
                    $rollbackSuccess = $false
                }
            } else {
                Write-Host "✗ Error: Restore script not found" -ForegroundColor Red
                $rollbackSuccess = $false
            }
        } else {
            Write-Host "✗ Error: No backup file found in $BackupPath" -ForegroundColor Red
            $rollbackSuccess = $false
        }
    }
} else {
    Write-Host ""
    Write-Host "[2/3] Skipping database rollback" -ForegroundColor Yellow
}

# Step 3: Verification
Write-Host ""
Write-Host "[3/3] Verifying rollback..." -ForegroundColor Yellow

# Check git branch
$currentBranch = git branch --show-current
if ($currentBranch -eq "master" -or $currentBranch -eq "main") {
    Write-Host "✓ On correct branch: $currentBranch" -ForegroundColor Green
} else {
    Write-Host "⚠ Warning: Not on master branch (current: $currentBranch)" -ForegroundColor Yellow
}

# Check Node.js version (should be old version)
$nodeVersion = node --version
Write-Host "  Node.js version: $nodeVersion" -ForegroundColor Gray

# Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
if ($rollbackSuccess) {
    Write-Host "Rollback Complete!" -ForegroundColor Green
} else {
    Write-Host "Rollback Completed with Errors" -ForegroundColor Yellow
}
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

if ($rollbackSuccess) {
    Write-Host "System has been rolled back to pre-migration state" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Verify application starts correctly" -ForegroundColor Gray
    Write-Host "  2. Test critical functionality" -ForegroundColor Gray
    Write-Host "  3. Review rollback logs for any issues" -ForegroundColor Gray
    Write-Host "  4. Investigate migration failure causes" -ForegroundColor Gray
} else {
    Write-Host "Rollback encountered errors!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Action Required:" -ForegroundColor Yellow
    Write-Host "  1. Review error messages above" -ForegroundColor Gray
    Write-Host "  2. Manually verify system state" -ForegroundColor Gray
    Write-Host "  3. Contact support if needed" -ForegroundColor Gray
}
Write-Host ""
