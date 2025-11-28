# Rollback Migration Script for AbsG5
# This script rolls back the migration to the pre-migration state

param(
    [string]$BackupFile,
    [string]$GitTag = "v5.2.0-pre-migration",
    [switch]$DatabaseOnly,
    [switch]$CodeOnly,
    [switch]$Force
)

Write-Host "`n=== AbsG5 Migration Rollback ===" -ForegroundColor Cyan
Write-Host ""

# Warning
if (-not $Force) {
    Write-Host "WARNING: This will rollback the migration!" -ForegroundColor Red
    Write-Host "This action will:" -ForegroundColor Yellow
    if (-not $CodeOnly) {
        Write-Host "  - Restore the database from backup" -ForegroundColor Yellow
    }
    if (-not $DatabaseOnly) {
        Write-Host "  - Reset code to tag: $GitTag" -ForegroundColor Yellow
    }
    Write-Host ""
    $confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
    
    if ($confirmation -ne "yes") {
        Write-Host "Rollback cancelled." -ForegroundColor Yellow
        exit 0
    }
}

$rollbackSuccess = $true

# Rollback database
if (-not $CodeOnly) {
    Write-Host "`n--- Database Rollback ---" -ForegroundColor Cyan
    
    if (-not $BackupFile) {
        # Try to find the most recent backup
        $backupDir = ".\backups"
        if (Test-Path $backupDir) {
            $latestBackup = Get-ChildItem -Path $backupDir -Filter "absg5_backup_*.sql" | 
                            Sort-Object LastWriteTime -Descending | 
                            Select-Object -First 1
            
            if ($latestBackup) {
                $BackupFile = $latestBackup.FullName
                Write-Host "Using most recent backup: $BackupFile" -ForegroundColor Green
            } else {
                Write-Host "ERROR: No backup file found in $backupDir" -ForegroundColor Red
                $rollbackSuccess = $false
            }
        } else {
            Write-Host "ERROR: Backup directory not found: $backupDir" -ForegroundColor Red
            $rollbackSuccess = $false
        }
    }
    
    if ($BackupFile -and (Test-Path $BackupFile)) {
        Write-Host "Restoring database from: $BackupFile" -ForegroundColor Yellow
        
        try {
            & .\scripts\restore-database.ps1 -BackupFile $BackupFile -Force
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Database restored successfully" -ForegroundColor Green
            } else {
                Write-Host "✗ Database restore failed" -ForegroundColor Red
                $rollbackSuccess = $false
            }
        } catch {
            Write-Host "✗ Database restore failed: $($_.Exception.Message)" -ForegroundColor Red
            $rollbackSuccess = $false
        }
    }
}

# Rollback code
if (-not $DatabaseOnly) {
    Write-Host "`n--- Code Rollback ---" -ForegroundColor Cyan
    
    # Check if we're in a git repository
    try {
        $gitStatus = & git status 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Not in a git repository" -ForegroundColor Red
            $rollbackSuccess = $false
        } else {
            # Check if tag exists
            $tagExists = & git tag -l $GitTag
            
            if (-not $tagExists) {
                Write-Host "ERROR: Git tag '$GitTag' not found" -ForegroundColor Red
                Write-Host "Available tags:" -ForegroundColor Yellow
                & git tag -l
                $rollbackSuccess = $false
            } else {
                Write-Host "Checking out tag: $GitTag" -ForegroundColor Yellow
                
                # Stash any uncommitted changes
                Write-Host "Stashing uncommitted changes..." -ForegroundColor Yellow
                & git stash push -m "Pre-rollback stash $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                
                # Checkout the tag
                & git checkout $GitTag
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✓ Code rolled back to $GitTag" -ForegroundColor Green
                    
                    # Reinstall dependencies
                    Write-Host "`nReinstalling backend dependencies..." -ForegroundColor Yellow
                    Push-Location absg-core
                    & npm install
                    Pop-Location
                    
                    Write-Host "Reinstalling frontend dependencies..." -ForegroundColor Yellow
                    Push-Location absg-client
                    & npm install
                    Pop-Location
                    
                    Write-Host "✓ Dependencies reinstalled" -ForegroundColor Green
                } else {
                    Write-Host "✗ Failed to checkout tag $GitTag" -ForegroundColor Red
                    $rollbackSuccess = $false
                }
            }
        }
    } catch {
        Write-Host "✗ Code rollback failed: $($_.Exception.Message)" -ForegroundColor Red
        $rollbackSuccess = $false
    }
}

# Summary
Write-Host "`n=== Rollback Summary ===" -ForegroundColor Cyan

if ($rollbackSuccess) {
    Write-Host "✓ Rollback completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Verify the application is working correctly"
    Write-Host "  2. Check database integrity"
    Write-Host "  3. Review logs for any issues"
    Write-Host ""
    Write-Host "To restart the migration:" -ForegroundColor Yellow
    Write-Host "  git checkout migration/modernization-stack"
    exit 0
} else {
    Write-Host "✗ Rollback completed with errors" -ForegroundColor Red
    Write-Host "Please review the errors above and take corrective action." -ForegroundColor Yellow
    exit 1
}
