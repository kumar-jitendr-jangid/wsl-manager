const electron = require('electron')
// Enable live reload for all the files inside your project directory
//require('electron-reload')(__dirname);


const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path');
const url = require('url')
const PowerShell = require("powershell");
var cmd = require('node-cmd');
const fs = require("fs");

const service_wsl = require("./services/wsl");
const service_utility = require("./services/utility");

var mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: true
    })
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
     mainWindow.setResizable(false)
}

app.whenReady().then(() => {
    
    ipcMain.handle('dialog:openFile', service_utility.handleFileOpen)
    ipcMain.handle('get:wslOsList', service_wsl.handleWslWindowList)
    ipcMain.handle('put:makeBackup', service_wsl.handleMakeBackup)
    ipcMain.handle('put:startWSL', service_wsl.handleStartWSL)
    ipcMain.handle('put:stopWSL', service_wsl.handleStopWSL)
    ipcMain.handle('dialog:openDirectory', handleDirPathPicker)
    ipcMain.handle('dialog:openFileWindow', service_utility.handleShowFile)
    
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});


async function handleDirPathPicker() {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    })
    if (canceled) {
        return
    } else {
        return filePaths[0]
    }
}