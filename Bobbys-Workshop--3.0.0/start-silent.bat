@echo off
REM Start Bobby's Workshop without showing console windows
cd /d "%~dp0"
REM Use VBScript to run completely hidden
cscript //nologo start-hidden.vbs
exit
