const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  wslOsList: () => ipcRenderer.invoke('get:wslOsList'),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  startWSL: (wslName) => ipcRenderer.invoke('put:startWSL', wslName),
  stopWSL: (wslName) => ipcRenderer.invoke('put:stopWSL', wslName),
  makeBackup: (data) => ipcRenderer.invoke('put:makeBackup', data), // {name and file path},
  showFile: (data) => ipcRenderer.invoke('dialog:openFileWindow', data)
})

