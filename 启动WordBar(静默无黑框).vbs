Set ws = CreateObject("Wscript.Shell")
ws.CurrentDirectory = "C:\Users\Administrator\Desktop\words"
ws.Run """C:\Users\Administrator\Desktop\words\node_modules\electron\dist\electron.exe"" .", 0, False
