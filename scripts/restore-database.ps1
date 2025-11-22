# Database Restoration Script for AbsG5 Migration
# This script restores a PostgreSQL database from backup

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    
    [switch]$Force,
    [switch]$DropExisting
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "AbsG5 Database Restoration Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# Configuration
$dbHost = $env:DB_HOST_DEFAULT
$dbPort = $env:DB_PORT_DEFAULT
$dbUser = $env:DB_USER_DEFAULT
$dbName = $env:DB_NAME_DEFAULT
$env:PGPASSWORD = $env:DB_PASSWORD_DEFAULT

# Validate backup file
Write-Host "[1/5] Validating backup file..." -ForegroundColor Yellow
if (-not (Test-Path $BackupFile)) {
    Write-Host "✗ Error: Backup file not found: $BackupFile" -ForegroundColor Red
    exit 1
}

$fileSize = (Get-Item $BackupFile).Length / 1MB
Write-Host "✓ Backup file found: $BackupFile ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green

# Determine backup format
$backupFormat = "unknown"
if ($BackupFile -match '\.backup$') {
    $backupFormat = "custom"
} elseif ($BackupFile -match '\.sql$') {
    $backupFormat = "sql"
}
Write-Host "  Format: $backupFormat" -ForegroundColor Gray

# Safety check
if (-not $Force) {
    Write-Host ""
    Write-Host "WARNING: This will restore the database '$dbName'" -ForegroundColor Yellow
    Write-Host "         All current data will be replaced!" -ForegroundColor Yellow
    Write-Host ""
    $confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
    if ($confirmation -ne "yes") {
        Write-Host "Restoration cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Check database connection
Write-Host ""
Write-Host "[2/5] Checking database connection..." -ForegroundColor Yellow
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Port: $dbPort" -ForegroundColor Gray
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  User: $dbUser" -ForegroundColor Gray

$testConnection = psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error: Cannot connect to PostgreSQL server" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Connection successful" -ForegroundColor Green

# Terminate existing connections (if dropping)
if ($DropExisting) {
    Write-Host ""
    Write-Host "[3/5] Terminating existing connections..." -ForegroundColor Yellow
    $terminateQuery = @"
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$dbName'
  AND pid <> pg_backend_pid();
"@
    psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c $terminateQuery 2>&1 | Out-Null
    Write-Host "✓ Connections terminated" -ForegroundColor Green
    
    # Drop database
    Write-Host ""
    Write-Host "[4/5] Dropping existing database..." -ForegroundColor Yellow
    dropdb -h $dbHost -p $dbPort -U $dbUser $dbName 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database dropped" -ForegroundColor Green
    } else {
        Write-Host "⚠ Warning: Could not drop database (may not exist)" -ForegroundColor Yellow
    }
    
    # Create new database
    Write-Host ""
    Write-Host "Creating new database..." -ForegroundColor Yellow
    createdb -h $dbHost -p $dbPort -U $dbUser $dbName 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database created" -ForegroundColor Green
    } else {
        Write-Host "✗ Error: Could not create database" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "[3/5] Skipping database drop (use -DropExisting to drop)" -ForegroundColor Yellow
    Write-Host "[4/5] Using existing database" -ForegroundColor Yellow
}

# Restore database
Write-Host ""
Write-Host "[5/5] Restoring database..." -ForegroundColor Yellow
Write-Host "  This may take several minutes..." -ForegroundColor Gray

if ($backupFormat -eq "custom") {
    # Restore from custom format
    pg_restore -h $dbHost -p $dbPort -U $dbUser -d $dbName -v $BackupFile 2>&1 | Out-Null
    $restoreResult = $LASTEXITCODE
} elseif ($backupFormat -eq "sql") {
    # Restore from SQL format
    psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $BackupFile 2>&1 | Out-Null
    $restoreResult = $LASTEXITCODE
} else {
    Write-Host "✗ Error: Unknown backup format" -ForegroundColor Red
    exit 1
}

if ($restoreResult -eq 0) {
    Write-Host "✓ Database restored successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Warning: Restoration completed with errors" -ForegroundColor Yellow
    Write-Host "  Check the output above for details" -ForegroundColor Yellow
}

# Verify restoration
Write-Host ""
Write-Host "[Verification] Verifying restoration..." -ForegroundColor Yellow

# Count tables
$tableCountQuery = @"
SELECT COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
"@
$tableCount = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c $tableCountQuery | Out-String
$tableCount = $tableCount.Trim()

Write-Host "✓ Tables found: $tableCount" -ForegroundColor Green

# Sample data verification
$userCountQuery = "SELECT COUNT(*) FROM ""user"";"
$userCount = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c $userCountQuery 2>&1 | Out-String
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ User records: $($userCount.Trim())" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Restoration Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database: $dbName" -ForegroundColor White
Write-Host "Tables: $tableCount" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Verify critical data is present" -ForegroundColor Gray
Write-Host "  2. Test application connectivity" -ForegroundColor Gray
Write-Host "  3. Run application tests" -ForegroundColor Gray
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = $null
