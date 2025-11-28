# Database Backup Script for AbsG5 Migration
# This script creates a complete backup of the PostgreSQL database before migration

param(
    [string]$BackupDir = ".\backups",
    [string]$DbName = "absg5",
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432
)

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Created backup directory: $BackupDir" -ForegroundColor Green
}

# Generate timestamp for backup file
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $BackupDir "absg5_backup_$timestamp.sql"

Write-Host "`n=== AbsG5 Database Backup ===" -ForegroundColor Cyan
Write-Host "Database: $DbName"
Write-Host "Host: $DbHost:$DbPort"
Write-Host "User: $DbUser"
Write-Host "Backup file: $backupFile"
Write-Host ""

# Check if pg_dump is available
try {
    $pgDumpVersion = & pg_dump --version 2>&1
    Write-Host "PostgreSQL tools found: $pgDumpVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: pg_dump not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Perform backup
Write-Host "Starting backup..." -ForegroundColor Yellow

try {
    # Set PGPASSWORD environment variable (prompt user if not set)
    if (-not $env:PGPASSWORD) {
        $securePassword = Read-Host "Enter PostgreSQL password for user '$DbUser'" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        $env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }

    # Execute pg_dump
    $pgDumpArgs = @(
        "-h", $DbHost,
        "-p", $DbPort,
        "-U", $DbUser,
        "-F", "p",  # Plain text format
        "-b",       # Include large objects
        "-v",       # Verbose
        "-f", $backupFile,
        $DbName
    )

    & pg_dump @pgDumpArgs

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nBackup completed successfully!" -ForegroundColor Green
        
        # Get backup file size
        $fileSize = (Get-Item $backupFile).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        
        Write-Host "`nBackup Details:" -ForegroundColor Cyan
        Write-Host "  File: $backupFile"
        Write-Host "  Size: $fileSizeMB MB"
        Write-Host "  Timestamp: $timestamp"
        
        # Verify backup file is not empty
        if ($fileSize -gt 0) {
            Write-Host "`n✓ Backup file verified (non-empty)" -ForegroundColor Green
        } else {
            Write-Host "`n✗ WARNING: Backup file is empty!" -ForegroundColor Red
            exit 1
        }
        
        # Create a backup manifest
        $manifestFile = Join-Path $BackupDir "backup_manifest.json"
        $manifest = @{
            timestamp = $timestamp
            database = $DbName
            host = $DbHost
            port = $DbPort
            user = $DbUser
            backupFile = $backupFile
            fileSizeMB = $fileSizeMB
            pgVersion = $pgDumpVersion
        } | ConvertTo-Json
        
        $manifest | Out-File -FilePath $manifestFile -Encoding UTF8
        Write-Host "  Manifest: $manifestFile" -ForegroundColor Cyan
        
        Write-Host "`n=== Backup Complete ===" -ForegroundColor Green
        Write-Host "To restore this backup, run:" -ForegroundColor Yellow
        Write-Host "  .\scripts\restore-database.ps1 -BackupFile '$backupFile'" -ForegroundColor White
        
    } else {
        Write-Host "`nERROR: Backup failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "`nERROR: Backup failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    $env:PGPASSWORD = $null
}

exit 0
