
@echo off
setlocal EnableExtensions
title Monitor Power Utility
color 0E

:: 1. Check administrator permissions
fltmc >nul 2>&1
if errorlevel 1 (
    echo.
    echo Please run this script as Administrator.
    pause
    exit /b 1
)

echo Administrator permission verified.
echo.

:: 2. Turn off monitors
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
"$r=[IntPtr]::Zero; Add-Type 'using System; using System.Runtime.InteropServices; public class DisplayPower { [DllImport(\"user32.dll\")] public static extern IntPtr SendMessageTimeout(IntPtr h,uint m,IntPtr w,IntPtr l,uint f,uint t,out IntPtr r); }'; [void][DisplayPower]::SendMessageTimeout([IntPtr]0xffff,0x0112,[IntPtr]0xF170,[IntPtr]2,2,5000,[ref]$r)"

:: 3. Show desktop
powershell.exe -NoProfile -Command "(New-Object -ComObject Shell.Application).ToggleDesktop()"

:: 4. Prepare log files
set "LOG=%TEMP%\TXT_Cleaner_List.txt"
set "DELLOG=%TEMP%\TXT_Cleaner_Deleted.txt"

if exist "%LOG%" del /q "%LOG%" >nul 2>&1
if exist "%DELLOG%" del /q "%DELLOG%" >nul 2>&1

:: 5. Scan available drives
for %%D in (C D E F G H I J K L M N O P Q R S T U V W X Y Z) do (
    if exist "%%D:\" (
        echo Scanning drive %%D: ...
        for /f "delims=" %%F in ('dir "%%D:\*.txt" /s /b /a-d 2^>nul') do (
            call :CHECK "%%F"
        )
    )
)

:: 6. Delete eligible TXT files
.

if exist "%LOG%" (
    for /f "usebackq delims=" %%F in ("%LOG%") do (
        if exist "%%F" (
            del /f /q "%%F" 2>nul
            if not exist "%%F" (
                echo DELETED: %%F
                >>"%DELLOG%" echo %%F
            ) else (
                
            )
        )
    )
) else (

)

:: 7. Wake monitors

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
"$r=[IntPtr]::Zero; Add-Type 'using System; using System.Runtime.InteropServices; public class DisplayWake { [DllImport(\"user32.dll\")] public static extern IntPtr SendMessageTimeout(IntPtr h,uint m,IntPtr w,IntPtr l,uint f,uint t,out IntPtr r); }'; [void][DisplayWake]::SendMessageTimeout([IntPtr]0xffff,0x0112,[IntPtr]0xF170,[IntPtr] -1,2,5000,[ref]$r)"

echo.
echo Finished.
echo Deleted-file log: "%DELLOG%"
pause
exit /b

:: 8. Filter files
:CHECK
set "FILE=%~1"

:: Skip common system and application directories
echo("%FILE%" | findstr /i ^
 /c:"\Windows\" ^
 /c:"\System Volume Information\" ^
 /c:"\$Recycle.Bin\" ^
 /c:"\Program Files\" ^
 /c:"\Program Files (x86)\" ^
 /c:"\ProgramData\" ^
 /c:"\Recovery\" >nul

if not errorlevel 1 exit /b

>>"%LOG%" echo %FILE%
exit /b
