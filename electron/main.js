const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow()
{
    const window = new BrowserWindow({
        width: 1280,
        height: 720,
        fullscreen: false,
        resizable: true,
        backgroundColor: "#000000",
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    if (process.env.NODE_ENV === 'development') {
        window.loadURL('http://localhost:8080')
    } else {
        window.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    window.webContents.openDevTools();
}

app.whenReady().then(createWindow)

app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('force_high_performance_gpu')