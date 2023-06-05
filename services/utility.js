const { dialog, shell } = require('electron')
const path = require("path")

var utility = {}

utility.handleFileOpen = async function() {
    const { canceled, filePaths } = await dialog.showOpenDialog()
    if (canceled) {

    } else {
        return filePaths[0]
    }
}

utility.handleShowFile = async function(event, filepath) {
    try {
        shell.openPath(path.parse(filepath).dir)
    } catch(e) {
        console.log("XXXXx", e)
    }
}
 
module.exports = utility;