' Lanzador para Inicio de Windows: ejecuta el .bat sin mostrar una ventana de CMD.
Option Explicit

Dim shell, fileSystem, folder, command

Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")
folder = fileSystem.GetParentFolderName(WScript.ScriptFullName)
command = Chr(34) & folder & "\iniciar-bot-telegram.bat" & Chr(34)

' 0 = ventana oculta; False = no esperar a que el bot termine.
shell.Run command, 0, False
