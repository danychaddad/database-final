var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var saltRounds = 5;
var mysql = require('mysql')
const util = require('util')

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "final-project-scratch"
})

let endConnection = () => {
  con.end();
}

const query = util.promisify(con.query).bind(con);

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/register/:username/:password', async function (req, res, next) {
  let username = req.params.username;
  let password = req.params.password;
  let userId = await findUser(username);
  console.log(userId)
  res.send("hey");
})


let findUser = async (username) => {
  try {
    let q = `SELECT * FROM new_table WHERE username = \"${username}\"`
    const respon = await query(q)
    let userEntry = respon[0].userId;
    // console.log(userEntry)
    return userEntry;
  } catch (e) {
      // console.log(-1);
      return -1;
  }
}

// router.get('/login', function (req,res,next) {

// })

module.exports = router;
