const con = require('./database')
const util = require('util')
const query = util.promisify(con.query).bind(con);

const findItem = async (itemId) => {
    try {
        const response = await query(`SELECT * FROM product WHERE productId = ? AND dateDeleted IS NULL`, [itemId]);
        return await response[0];
    } catch (e) {
        console.log(e);
        return [];
    }
}

module.exports = {
    findItem
}