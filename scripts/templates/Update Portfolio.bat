@echo off
setlocal
rem %~dp0 always ends in a backslash; strip it before quoting the path,
rem otherwise "...\" right before a closing quote breaks the argument.
set "HERE=%~dp0"
set "HERE=%HERE:~0,-1%"
set "ROOT=%HERE%\..\..\.."

echo Updating the website with the photos in this folder...
echo.

node "%ROOT%\scripts\sync-portfolio-folder.mjs" --root "%ROOT%" --folder "%HERE%"

echo.
echo (You can close this window now.)
pause >nul
