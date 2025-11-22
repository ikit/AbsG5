# Database Backup Script for AbsG5 Migration
# This script creates a comprehensive backup of the PostgreSQL database

param(
    [string]$BackupDir = "backups",
    [switch]$SkipVerification
)

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
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $BackupDir "pre-migration-$timestamp"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "AbsG5 Database Backup Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Create backup directory
Write-Host "[1/6] Creating backup directory..." -ForegroundColor Yellow
if (-not (Test-Path $backupPath)) {
    New-Item -ItemType Directory -Force -Path $backupPath | Out-Null
    Write-Host "✓ Created: $backupPath" -ForegroundColor Green
} else {
    Write-Host "✓ Directory exists: $backupPath" -ForegroundColor Green
}

# Check PostgreSQL connection
Write-Host ""
Write-Host "[2/6] Checking database connection..." -ForegroundColor Yellow
$dbHost = $env:DB_HOST_DEFAULT
$dbPort = $env:DB_PORT_DEFAULT
$dbUser = $env:DB_USER_DEFAULT
$dbName = $env:DB_NAME_DEFAULT

if (-not $dbHost -or -not $dbPort -or -not $dbUser -or -not $dbName) {
    Write-Host "✗ Error: Database environment variables not set" -ForegroundColor Red
    Write-Host "  Please ensure .env file exists with DB_HOST_DEFAULT, DB_PORT_DEFAULT, DB_USER_DEFAULT, DB_NAME_DEFAULT" -ForegroundColor Red
    exit 1
}

Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Port: $dbPort" -ForegroundColor Gray
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  User: $dbUser" -ForegroundColor Gray

# Test connection
$env:PGPASSWORD = $env:DB_PASSWORD_DEFAULT
$testConnection = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT version();" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error: Cannot connect to database" -ForegroundColor Red
    Write-Host "  $testConnection" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Database connection successful" -ForegroundColor Green

# Full database backup (custom format)
Write-Host ""
Write-Host "[3/6] Creating full database backup (custom format)..." -ForegroundColor Yellow
$fullBackupFile = Join-Path $backupPath "absg5_full.backup"
pg_dump -h $dbHost -p $dbPort -U $dbUser -F c -b -v -f $fullBackupFile $dbName 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    $fileSize = (Get-Item $fullBackupFile).Length / 1MB
    Write-Host "✓ Full backup created: $fullBackupFile ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "✗ Error creating full backup" -ForegroundColor Red
    exit 1
}

# SQL format backup
Write-Host ""
Write-Host "[4/6] Creating SQL format backup..." -ForegroundColor Yellow
$sqlBackupFile = Join-Path $backupPath "absg5_full.sql"
pg_dump -h $dbHost -p $dbPort -U $dbUser -F p -b -v -f $sqlBackupFile $dbName 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    $fileSize = (Get-Item $sqlBackupFile).Length / 1MB
    Write-Host "✓ SQL backup created: $sqlBackupFile ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "✗ Error creating SQL backup" -ForegroundColor Red
    exit 1
}

# Schema only backup
Write-Host ""
Write-Host "[5/6] Creating schema-only backup..." -ForegroundColor Yellow
$schemaBackupFile = Join-Path $backupPath "absg5_schema.sql"
pg_dump -h $dbHost -p $dbPort -U $dbUser -s -f $schemaBackupFile $dbName 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Schema backup created: $schemaBackupFile" -ForegroundColor Green
} else {
    Write-Host "✗ Error creating schema backup" -ForegroundColor Red
}

# Create backup manifest
Write-Host ""
Write-Host "[6/6] Creating backup manifest..." -ForegroundColor Yellow
$manifestFile = Join-Path $backupPath "BACKUP_MANIFEST.txt"
$gitBranch = git branch --show-current
$gitCommit = git rev-parse HEAD
$nodeVersion = node --version
$pgVersion = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT version();" | Out-String

$manifest = @"
AbsG5 Database Backup Manifest
================================

Backup Information
------------------
Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Backup Directory: $backupPath
Backup Type: Pre-Migration Full Backup

Database Information
--------------------
Host: $dbHost
Port: $dbPort
Database: $dbName
User: $dbUser
PostgreSQL Version: $($pgVersion.Trim())

Application Information
-----------------------
Git Branch: $gitBranch
Git Commit: $gitCommit
Node.js Version: $nodeVersion

Backup Files
------------
Full Backup (Custom): absg5_full.backup
Full Backup (SQL): absg5_full.sql
Schema Only: absg5_schema.sql

Backup Statistics
-----------------
Full Backup Size: $([math]::Round((Get-Item $fullBackupFile).Length / 1MB, 2)) MB
SQL Backup Size: $([math]::Round((Get-Item $sqlBackupFile).Length / 1MB, 2)) MB
Schema Backup Size: $([math]::Round((Get-Item $schemaBackupFile).Length / 1KB, 2)) KB

Restoration Instructions
------------------------
To restore this backup, use:
  pg_restore -h <host> -p <port> -U <user> -d <database> -v $fullBackupFile

Or for SQL format:
  psql -h <host> -p <port> -U <user> -d <database> -f $sqlBackupFile

Verification
------------
To verify backup integrity:
  pg_restore -l $fullBackupFile

================================
"@

$manifest | Out-File -FilePath $manifestFile -Encoding UTF8
Write-Host "✓ Manifest created: $manifestFile" -ForegroundColor Green

# Verify backup (optional)
if (-not $SkipVerification) {
    Write-Host ""
    Write-Host "[Verification] Verifying backup integrity..." -ForegroundColor Yellow
    $verifyOutput = pg_restore -l $fullBackupFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        $tableCount = ($verifyOutput | Select-String "TABLE DATA").Count
        Write-Host "✓ Backup verified successfully" -ForegroundColor Green
        Write-Host "  Tables found: $tableCount" -ForegroundColor Gray
    } else {
        Write-Host "✗ Warning: Backup verification failed" -ForegroundColor Yellow
        Write-Host "  Backup may still be valid, but manual verification recommended" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Backup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backup Location: $backupPath" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Verify backup files exist and have reasonable sizes" -ForegroundColor Gray
Write-Host "  2. Test restoration in a staging environment" -ForegroundColor Gray
Write-Host "  3. Store backup in a secure location" -ForegroundColor Gray
Write-Host "  4. Proceed with migration" -ForegroundColor Gray
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = $null
