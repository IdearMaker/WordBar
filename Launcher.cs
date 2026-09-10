using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

class Program
{
    [STAThread]
    static void Main()
    {
        try
        {
            string dir = Path.GetDirectoryName(Application.ExecutablePath);
            string wordsDir = Directory.Exists(Path.Combine(dir, "node_modules"))
                ? dir
                : Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "words");

            string electronExe = Path.Combine(wordsDir, @"node_modules\electron\dist\electron.exe");

            if (!File.Exists(electronExe))
            {
                MessageBox.Show("未找到 Electron 运行时：\n" + electronExe, "WordBar 错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = electronExe;
            psi.Arguments = ".";
            psi.WorkingDirectory = wordsDir;
            psi.UseShellExecute = true; // Crucial: detach from launcher so it remains alive permanently
            psi.WindowStyle = ProcessWindowStyle.Normal;

            Process.Start(psi);
        }
        catch (Exception ex)
        {
            MessageBox.Show("启动失败: " + ex.Message, "WordBar 错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
