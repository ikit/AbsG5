# Database Restore Script for AbsG5 Migration
# This script restores a PostgreSQL database backup

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$DbName = "absg5",
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [switch]$Force
)

Write-Host "`n=== AbsG5 Database Restore ===" -ForegroundColor Cyan
Write-Host "Database: $DbName"
Write-Host "Host: $DbHost:$DbPort"
Write-Host "User: $DbUser"
Write-Host "Backup file: $BackupFile"
Write-Host ""

# Check if backup file exists
if (-not (Test-Path $BackupFile)) {
    Write-Host "ERROR: Backup file not found: $BackupFile" -ForegroundColor Red
    exit 1
}

# Get backup file size
$fileSize = (Get-Item $BackupFile).Length
$fileSizeMB = [math]::Round($fileSize / 1MB, 2)
Write-Host "Backup file size: $fileSizeMB MB" -ForegroundColor Green

# Check if psql is available
try {
    $psqlVersion = & psql --version 2>&1
    Write-Host "PostgreSQL tools found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: psql not found. Please install PostgreSQL client tools." -ForegroundColor Red
    exit 1
}

# Warning prompt
if (-not $Force) {
    Write-Host "`nWARNING: This will DROP and recreate the database '$DbName'!" -ForegroundColor Red
    Write-Host "All current data will be LOST!" -ForegroundColor Red
    $confirmation = Read-Host "`nAre you sure you want to continue? (yes/no)"
    
    if ($confirmation -ne "yes") {
        Write-Host "Restore cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Get password
if (-not $env:PGPASSWORD) {
    $securePassword = Read-Host "Enter PostgreSQL password for user '$DbUser'" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

try {
    Write-Host "`nStep 1: Terminating active connections..." -ForegroundColor Yellow
    
    # Terminate active connections to the database
    $terminateQuery = @"
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DbName'
  AND pid <> pg_backend_pid();
"@
    
    $terminateQuery | & psql -h $DbHost -p $DbPort -U $DbUser -d postgres -q 2>&1 | Out-Null
    
    Write-Host "Step 2: Dropping existing database..." -ForegroundColor Yellow
    & psql -h $DbHost -p $DbPort -U $DbUser -d postgres -c "DROP DATABASE IF EXISTS $DbName;" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to drop database" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Step 3: Creating new database..." -ForegroundColor Yellow
    & psql -h $DbHost -p $DbPort -U $DbUser -d postgres -c "CREATE DATABASE $DbName;" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create database" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Step 4: Restoring backup..." -ForegroundColor Yellow
    & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $BackupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n=== Restore Complete ===" -ForegroundColor Green
        Write-Host "Database '$DbName' has been restored successfully!" -ForegroundColor Green
        
        # Get row counts for verification
        Write-Host "`nVerifying restore..." -ForegroundColor Yellow
        $countQuery = @"
SELECT 
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC
LIMIT 10;
"@
        
        Write-Host "`nTop 10 tables by row count:" -ForegroundColor Cyan
        $countQuery | & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName
        
    } else {
        Write-Host "`nERROR: Restore failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "`nERROR: Restore failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    $env:PGPASSWORD = $null
}

exit 0
