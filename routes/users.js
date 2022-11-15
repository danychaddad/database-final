const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const util = require('util')
const { checkPass, hashPass } = require('../util/hashing');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "final-project-scratch"
});

// call query(q) with q being an SQL query instead of con.query to make it work async, and await result
const query = util.promisify(con.query).bind(con);


// Ends connection to the DB, just in case we need it
const endConnection = () => {
  con.end();
};

// When a request is sent on /register/:username/:password, check if user exists in DB. If doesn't exist, create new user using provided info. Else send an error
// TODO change to POST when Jad gives us frontend 
router.get('/register/:username/:password', async function (req, res, next) {
  const { username, password } = req.params;
  if(!username || !password) return res.send(`Please enter username and password`);
  try {
    if(await isUserExists(username)) {
      return res.send(`User ${username} already exists!`);
    }
    const hashedPassword = await hashPass(password);
    await query(`INSERT INTO new_table (username, passwordHash) VALUES (?, ?)`, [username, hashedPassword]);
    res.send("Registered");
  } catch(err) {
    res.send("Something went wrong.");
  }
});

// Tries to log the user in using the specified username and password
// TODO change to post when Jad gives us frontend
router.get('/login/:username/:password', async function (req, res) {
  const { username, password } = req.params;
  if(!username || !password) return res.send(`Please enter username and password`);
  if (!await isUserExists(username)) {
    return res.send("User does not exist!");
  }
  const userId = await findUser(username);
  const respon = await query(`SELECT passwordHash FROM new_table WHERE userId = ?`, [userId]);
  const passwordHash = respon[0].passwordHash;
  if (await checkPass(passwordHash, password)) {
    res.send("Password is correct!");
    //TODO generate jwt token here.
  } else {
    res.send("Wrong password!")
  }
});


// Checks if the user ID is = -1 and returns false if it is
const isUserExists = async (username) => {
  const userId = await findUser(username);
  return userId != -1;
}

// Searches for the username in the database. If found, return the user Id, else return -1
const findUser = async (username) => {
  try {
    const response = await query(`SELECT * FROM new_table WHERE username = ?`, [username]);
    if(response.length == 0) return -1;
    return response[0].userId;
  } catch (e) {
    return -1;
  }
}

module.exports = router;
