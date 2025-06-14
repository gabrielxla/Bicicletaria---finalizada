const {contextBridge, ipcRenderer} = require('electron')

ipcRenderer.send('db-connect')

contextBridge.exposeInMainWorld('api',{
    clientWindow: () => ipcRenderer.send('client-window'),
    osWindow: () => ipcRenderer.send('os-window'),
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    newClient: (client) => ipcRenderer.send('new-client', client),
    newOs: (os) => ipcRenderer.send('new-os', os),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
    searchNameClient: (name) => ipcRenderer.send('search-name', name),
    renderClient: (dataClient) => ipcRenderer.on('render-client', dataClient),
    validateSearch: () => ipcRenderer.send('validate-search'),
    setClient: (args) => ipcRenderer.on('set-client',args),
    deleteClient: (id) => ipcRenderer.send('delete-client', id),
    deleteOS: (id) => ipcRenderer.send('delete-OS', id),
    updateClient: (client) => ipcRenderer.send('update-client', client),
    updateOS: (OSupd) => ipcRenderer.send('update-OS', OSupd),
    searchOS: () => ipcRenderer.send('search-os'),
    searchClients: (clients) => ipcRenderer.send ('search-clients',clients),
    listClients: (clients) => ipcRenderer.on('list-clients',clients),
    validateClient: () => ipcRenderer.send('validate-client'),
    setSearch: (args) => ipcRenderer.on('set-search', args),
    renderOS: (dataOS) => ipcRenderer.on('render-os', dataOS),
    printOS: () => ipcRenderer.send('print-os'),
    showErrorBox: (message) => ipcRenderer.send('show-error-box', message)
    //searchOsClient: (nameOs) => ipcRenderer.send('search-os', nameOs) teste,
})