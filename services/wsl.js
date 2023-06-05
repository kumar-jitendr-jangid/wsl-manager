const PowerShell = require("powershell");
var cmd = require('node-cmd');
const fs = require("fs");
const service_db = require("./db");

var wsl = {}

wsl.handleWslWindowList = async function () {
    let rr = await runPowerShellCommand('wsl --list --verbose ')
    rr = arrayStringgCsvToJSON(rr);
    let data = await service_db.getData('backup_path');
    let backupPathList = [];
    data.map(x=> {
        if(fs.existsSync(x.path)) {
            backupPathList.push(x)
        } else {
            
        }
    })
    return {wslOsList : rr, backupPathList};
}

wsl.handleMakeBackup = async function (event, obj) {
    return new Promise((resolve) => {
        let { backupName, path, wslName } = obj;
        let command = `wsl --export ${wslName} ${path}/${backupName}.tar`;
        cmd.run(command, function (err, data, stderr) {
            data = data.split("").filter(char => char.codePointAt(0)).join("")
            if ((data.toString()).indexOf("An install, uninstall, or conversion is in progress for this distribution.") > -1) {
                return resolve(data.toString());
            } else {
                service_db.storeDataIntoArray('backup_path', {
                    path: `${path}/${backupName}.tar`,
                    file_name : `${backupName}.tar`,
                    date: new Date()
                });
                return resolve("done")
            }
        })
    })
}

wsl.handleStartWSL = async function (event, wslName) {
    return await startWSL(wslName);
}

wsl.handleStopWSL = async function (event, wslName) {
    return await stopWSL(wslName);
}

async function runPowerShellCommand(commad) {
    return new Promise((resolve) => {

        let out = null
        // Start the process
        let ps = new PowerShell(commad);

        // Handle process errors (e.g. powershell not found)
        ps.on("error", err => {
            console.error(err);
            //return err
        });

        // Stdout
        ps.on("output", data => {
            out = data;
            //return data
        });

        // Stderr
        ps.on("error-output", data => {
            // return data
        });

        // End
        ps.on("end", code => {
            // Do Something on end
            return resolve(out)
        });

    })
}

// custom for single use only
function arrayStringgCsvToJSON(data) {

    data = data.split("").filter(char => char.codePointAt(0)).join("")

    data = (data.split("\n")).map(x => (x.replace(/[, ]+/g, " ").trim()).split(" "))

    let json = [];


    data.map((d, index) => {
        if (index != 0) {
            if (d[0] != "") {
                json.push({
                    [data[0][0]]: d[0] != "*" ? d[0] : d[1],
                    [data[0][1]]: d[0] != "*" ? d[1] : d[2],
                    [data[0][2]]: d[0] != "*" ? d[2] : d[3],
                })
            }
        }

    })

    return json
}

function startWSL(name) {
    var cp = require('child_process');
    const child = cp.spawn('cmd', ['/C', 'start cmd.exe /k wsl.exe -d ' + name]);
}

function stopWSL(name) {
    var cp = require('child_process');
    cp.spawn('cmd', ['/C', 'start cmd.exe /c wsl.exe --shutdown ' + name]);
}
module.exports = wsl;