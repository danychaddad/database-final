const saltRounds = 7;
const bcrypt = require('bcrypt');

module.exports = { saltRounds };
module.exports.checkPass = async (passwordHash, password) => {
    const result = await bcrypt.compare(password + '', passwordHash);
    return result;
};
module.exports.hashPass = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function(err, hash) {
            if(err) reject(err);
            resolve(hash);
        });
    });
};