const mysql = require('mysql')

con = () => {
    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "markit"
    })
    return db;
};

module.exports = con();