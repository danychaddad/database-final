const con = require('./database')
const util = require('util')
const query = util.promisify(con.query).bind(con);

const findItem = async (itemId) => {
    try {
        const response = await query(`SELECT productItemId, productId, qtyInStock, price FROM PRODUCT_ITEM WHERE productItemId = ? AND dateDeleted IS NULL`, [itemId]);
        return response[0];
    } catch (e) {
        console.log(e);
        return [];
    }
}

const findProductByItemId = async (itemId) => {
    try {
        const productId = await findItem(itemId).productId;
        const response = await query(`SELECT productId, sellerId, categoryId, name, description FROM PRODUCT WHERE productItemId = ? AND dateDeleted IS NULL`, [productId]);
        return response[0].productId;
    } catch (e) {
        console.log(e);
        return [];
    }
}

module.exports = {
    findItem,
    findProductByItemId
}