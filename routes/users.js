const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const util = require('util')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const { checkPass, hashPass } = require('../util/hashing');
const con = require('../util/database')
dotenv.config();

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
      await query(`INSERT INTO site_user (firstName, lastName, email, username, password, phoneNumber, gender, dateOfBirth) VALUES (?,?,?,?,?,?,?,?)`, [fname, lname, email, username, hashedPassword, phone, gender, dob]);
      res.send("Registered");
    } catch (err) {
      res.send("Something went wrong.");
    }
  }
});

// Tries to log the user in using the specified username and password
router.post('/login', async function (req, res) {
  let isTokenValid = false;
  const token = req.body.token;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
      if (!err) {
        isTokenValid = true;
        res.send("Logged in!");
      }
    })
  }
  if (!isTokenValid) {
    const { username, password } = req.body;
    if (!username || !password) return res.send(`Please enter username and password`);
    if (!await isUserExists(username)) {
      return res.send("User does not exist!");
    }
    const userId = await findUser(username);
    const respon = await query(`SELECT password FROM site_user WHERE userId = ?`, [userId]);
    const passwordHash = await respon[0].password;
    if (await checkPass(passwordHash, password)) {
      const token = generateJWT(username);
      res.json({ token: token });
    } else {
      res.send("Wrong password!")
    }
  }
}
);

router.get('/listings/:userId?', async function (req, res) {
  let userId = req.params.userId;
  if (!userId) {
    // TODO refactor header name
    const token = req.headers.token;
    userId = await getCurrentUser(token);
    if (userId == -1) {
      return res.status(401).send("You are not logged in!");
    }
  }
  const respon = await query('SELECT P.productId AS prodId, P.categoryId AS catId, P.name, P.description, G.imagePath, I.qtyInStock, I.price FROM product_item I, (product AS P LEFT JOIN product_gallery AS G ON P.productId = G.productId) WHERE ((P.sellerId = ?) AND (I.productId = P.productId));', [userId]);
  await respon.forEach(element => {
    console.log(JSON.stringify(element));
  });
  res.send("done")
})

const getCurrentUser = async (token) => {
  const decode = jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err)
      return -1;
    return decoded.username;
  })
  return await findUser(decode);
}

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
    return response[0].userId;
  } catch (e) {
    return -1;
  }
}

const generateJWT = (username) => {
  return jwt.sign({ username: username }, process.env.TOKEN_SECRET, { expiresIn: 1800 });
}

module.exports = router;
