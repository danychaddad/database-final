const mysql = require('mysql')

con = () => {
    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password1234",
        database: "markit"
    })
    return db;
};

module.exports = con();