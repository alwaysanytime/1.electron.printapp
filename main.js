// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { PosPrinter } = require("electron-pos-printer");

// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue, onChildAdded } = require("firebase/database");
let printerName;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCg9PtUex3TiscLu1SjjOaf6pHj6m0nZSw",
    authDomain: "print-test-39d1e.firebaseapp.com",
    databaseURL: "https://print-test-39d1e-default-rtdb.firebaseio.com",
    projectId: "print-test-39d1e",
    storageBucket: "print-test-39d1e.appspot.com",
    messagingSenderId: "379854271911",
    appId: "1:379854271911:web:0936d75cebabd4e2c8f282",
    measurementId: "G-7S98Y7GQSV"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getDatabase(firebaseApp);
const starCountRef = ref(db, 'order');
onChildAdded(starCountRef, (snapshot) => {
    const data = snapshot.val();
    console.log(JSON.stringify(data));
    if (data.order && printerName) {
        createBillLayout(data, printerName)
    }
});

// onChildAdded(starCountRef, (snapshot) => {
//   const data = snapshot.val();
//   console.log(JSON.stringify(data));
// })


function createBillLayout(d, pname) {
    const options = {
        preview: false, // Preview in window or print
        width: '170px', //  width of content body
        margin: '0 0 0 0', // margin of content body
        copies: 1, // Number of copies to print
        printerName: pname, // printerName: string, check with webContent.getPrinters()
        timeOutPerLine: 5000,
        pageSize: { height: 3508, width: 2480 }, // page size
        silent: true
    }
    const data = [];

    data.push({
        type: 'text',
        value: `#${d.order.counter}`,
        style: `text-align:left;`,
        css: { "font-weight": "700", "font-size": "18px" }
    });
    data.push({
        type: 'text',
        value: `Table #${d.order.tableName}`,
        style: `text-align:left;`,
        css: { "font-weight": "400", "font-size": "16px" }
    });
    let list = d.order.items.map(item => [item.amount, item.name, item.price]);
    data.push({
        type: 'table',
        // style the table
        style: 'border: 1px solid #ddd',
        // list of the columns to be rendered in the table header
        tableHeader: ['Qty', 'Item', 'Price'],
        // multi dimensional array depicting the rows and columns of the table body
        tableBody: list,
        // custom style for the table header
        tableHeaderStyle: 'color: #000;',
        // custom style for the table body
        tableBodyStyle: 'border: 0.5px solid #ddd',
        // custom style for the table footer
        tableFooterStyle: 'color: #000;',
    });
    data.push({
        type: 'text',
        value: `Total : $${d.order.total}`,
        style: `text-align:left;`,
        css: { "font-weight": "400", "font-size": "16px" }
    });

    PosPrinter.print(data, options)
        .then(() => {})
        .catch((error) => {
            console.log(error);
            throw error
        });
}

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.ELECTRON_DISABLE_SECURITY_WARNINGS;
    ipcMain.handle('ping', () => 'pong')
    ipcMain.on('connect', async(e, pname) => {
        console.log("connected...", { pname });
        printerName = pname;
    })
    ipcMain.handle('printersList', async() => await mainWindow.webContents.getPrintersAsync())

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    //mainWindow.webContents.openDevTools()
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.