const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const util = require('util')
const { checkPass, hashPass } = require('../util/hashing');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "markit"
});

// call query(q) with q being an SQL query instead of con.query to make it work async, and await result
const query = util.promisify(con.query).bind(con);


// Ends connection to the DB, just in case we need it
const endConnection = () => {
  con.end();
};

// When a POST request is sent on /register, check if user exists in DB. If doesn't exist, create new user using provided info. Else send an error
router.post('/register', async function (req, res) {
  const { fname, lname, email, username, password, phone, gender, dob } = req.body;
  if (!fname || !lname || !email || !username || !password || !phone || !gender || !dob) {
    res.status(401).send("Fill all fields!");
  } else {
    try {
      console.log(username);
      if (await isUserExists(username)) {
        return res.send(`User ${username} already exists!`);
      }
      const hashedPassword = await hashPass(password);
      await query(`INSERT INTO site_user (first_name, last_name, email_address, username, password, phone_nb, gender, date_of_birth) VALUES (?,?,?,?,?,?,?,?)`, [fname, lname, email, username, hashedPassword, phone, gender, dob]);
      res.send("Registered");
    } catch (err) {
      res.send("Something went wrong.");
    }
  }
});

// Tries to log the user in using the specified username and password
router.post('/login', async function (req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.send(`Please enter username and password`);
  if (!await isUserExists(username)) {
    return res.send("User does not exist!");
  }
  const userId = await findUser(username);
  const respon = await query(`SELECT password FROM site_user WHERE user_id = ?`, [userId]);
  const passwordHash = await respon[0].password.trim();
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
    const response = await query(`SELECT * FROM site_user WHERE username = ?`, [username]);
    if (response.length == 0) return -1;
    return response[0].user_id;
  } catch (e) {
    return -1;
  }
}

module.exports = router;
