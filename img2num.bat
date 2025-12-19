@echo off
REM img2num.bat – Windows wrapper for img2num.ps1

REM Get the directory of the batch file
SET "SCRIPT_DIR=%~dp0"

REM Call the PowerShell script with all arguments using Windows PowerShell
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%img2num.ps1" %*
