const Store = require('electron-store');
const store = new Store();

var db = {};

db.storeDataIntoArray = async function(key, data) {
    console.log("store.get(key)", store.get(key))
    let old = store.get(key) ? store.get(key) : [];
    old.push(data);
    store.set(key, old);
}


db.getData = async function(key) {
    return store.get(key)
}

//store.delete('backup_path')


module.exports = db;


