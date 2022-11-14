var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var saltRounds = 7;
var mysql = require('mysql')
const util = require('util')

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "final-project-scratch"
})

// Ends connection to the DB, just in case we need it
let endConnection = () => {
  con.end();
}

// call query(q) with q being an SQL query instead of con.query to make it work async, and await result
const query = util.promisify(con.query).bind(con);

// When a request is sent on /register/:username/:password, check if user exists in DB. If doesn't exist, create new user using provided info. Else send an error
// TODO change to POST when Jad gives us frontend 
router.get('/register/:username/:password', async function (req, res, next) {
  let username = req.params.username;
  let password = req.params.password;
  if (!await isUserExists(username)) {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      let q = `INSERT INTO new_table (username, passwordHash) VALUES (\"${username}\", \"${hash}\")`
      query(q);
      res.send("added to db")
    })
  } else {
    res.send(`User ${username} already exists!`)
  }
})

// Tries to log the user in using the specified username and password
// TODO change to post when Jad gives us frontend
router.get('/login/:username/:password', async function (req, res) {
  let username = req.params.username;
  let password = req.params.password;
  if (!await isUserExists(username)) {
    res.send("User does not exist!");
  }
  let userId = await findUser(username);
  if (await checkPass(userId, password)) {
    res.send("Password is correct!");
  } else {
    res.send("Wrong password!")
  }
})

// Takes user's ID and a password string then compares the string with the hashed password as stored in DB. Returns the result of the comparison (T/F)
let checkPass = async (userId, password) => {
  let q = `SELECT passwordHash FROM new_table WHERE userId = ${userId}`
  const respon = await query(q);
  let userPass = respon[0].passwordHash;
  const result = await bcrypt.compare(password + '', userPass.trim());
  return result;
}

// Checks if the user ID is = -1 and returns false if it is
let isUserExists = async (username) => {
  let userId = await findUser(username);
  return (userId != -1) ? true : false
}

// Searches for the username in the database. If found, return the user Id, else return -1
let findUser = async (username) => {
  try {
    let q = `SELECT * FROM new_table WHERE username = \"${username}\"`
    const respon = await query(q)
    let userEntry = respon[0].userId;
    return userEntry;
  } catch (e) {
    return -1;
  }
}

module.exports = router;
