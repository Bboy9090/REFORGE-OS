Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the script directory
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Change to the project directory
WshShell.CurrentDirectory = scriptDir

' Run npm command without showing console window
WshShell.Run "cmd /c npm run tauri:dev", 0, False

Set WshShell = Nothing
Set fso = Nothing
