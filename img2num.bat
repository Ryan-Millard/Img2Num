@echo off
REM img2num.bat - CMD wrapper for img2num.ps1 (PowerShell script)

REM Get the directory of the batch file
SET "SCRIPT_DIR=%~dp0"

REM Call the PowerShell script with all arguments using Windows PowerShell.
REM All flags (--img, --dh-img, --ghcr-img, --gpu, --no-gpu, ...) are forwarded unchanged,
REM e.g.: img2num.bat build --gpu   /   img2num.bat sh --gpu   /   img2num.bat sh --no-gpu
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%img2num.ps1" %*
