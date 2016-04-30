using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms;

namespace WinFormHost
{
    public partial class FormMain : Form
    {
        private ChromiumWebBrowser browser;

        public FormMain()
        {
            InitializeComponent();

            InitBrowser();
        }

        public void InitBrowser()
        {
            Cef.Initialize(new CefSettings());
            this.browser = new ChromiumWebBrowser("http://localhost:49485/");
            this.browser.Margin = new Padding(25);
            this.browser.Dock = DockStyle.Fill;
            this.toolStripContainer1.ContentPanel.Controls.Add(this.browser);
            this.browser.RegisterAsyncJsObject("nativeHost", new NativeHost());
        }

        private void toolStripButtonRefresh_Click(object sender, System.EventArgs e)
        {
            this.browser.Load(this.browser.Address);
        }

        private void toolStripButtonDevTools_Click(object sender, System.EventArgs e)
        {
            this.browser.GetBrowser().ShowDevTools();
        }
    }
}
