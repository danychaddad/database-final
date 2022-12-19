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

const findProductByItemId = async (productItemId) => {
    try {
        const response = await query(`SELECT productId, sellerId, categoryId, name, description, price FROM PRODUCT_ITEM_WITH_DETAILS WHERE productItemId = ? AND dateDeleted IS NULL`, [productItemId]);
        return response[0];
    } catch (e) {
        console.log(e);
        return [];
    }
}

module.exports = {
    findItem,
    findProductByItemId
}