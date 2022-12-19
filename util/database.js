const mysql = require('mysql')

con = () => {
    const db = mysql.createConnection({
        host: "127.0.0.1",
        user: "admin",
        password: "password",
        database: "MARKIT"
    })
    var del = db._protocol._delegateError;
    db._protocol._delegateError = function (err, sequence) {
        if (err.fatal) {
            console.trace('fatal error: ' + err.message);
        }
        return del.call(this, err, sequence);
    };
    return db;
};

module.exports = con();