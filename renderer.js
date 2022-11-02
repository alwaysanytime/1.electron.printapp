/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

const initPage = async() => {
    const printersList = await window.versions.printersList();
    console.log({ printersList });

    let printerList = '';
    printersList.forEach(printer => {
        printerList += '<option value="' + printer.name + '">' + printer.name + '</option>'
    });
    document.getElementById('printlist').innerHTML = printerList;
}

initPage();

const calltomain = async () => {
    const pname = document.getElementById('printlist').value;
    window.versions.pname = pname;
    const response = await window.versions.connect(pname)
    console.log(response) // prints out 'pong'
}

document.getElementById('printlist').addEventListener('change', calltomain);