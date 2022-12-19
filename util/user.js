const con = require('./database')
const jwt = require('jsonwebtoken');
const util = require('util')
const query = util.promisify(con.query).bind(con);

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

const getCurrentUser = async (token) => {
    const decode = jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) 
            return null;
        
        return decoded.userId;
    })
    return decode;
}

// Checks if the user ID is = -1 and returns false if it is
const isUserExists = async (username) => {
    const userId = await findUser(username);
    return userId != -1;
}

const generateJWT = (userId) => {
    return jwt.sign({ userId: userId }, process.env.TOKEN_SECRET, { expiresIn: "7 days" });
}

module.exports = {
    findUser,
    getCurrentUser,
    isUserExists,
    generateJWT
}
