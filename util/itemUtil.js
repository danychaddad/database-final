const con = require('./database')
const util = require('util')
const query = util.promisify(con.query).bind(con);

const findItem = async (itemId) => {
    try {
        const response = await query(`SELECT productItemId, productId, qtyInStock, price FROM PRODUCT_ITEM WHERE productId = ? AND dateDeleted IS NULL`, [itemId]);
        return response[0];
    } catch (e) {
        console.log(e);
        return [];
    }
}

const findProductByItemId = async (itemId) => {
    try {
        const item = await findItem(itemId);
        const productId = await item.productItemId;
        const response = await query(`SELECT P.productId AS productId, P.sellerId, P.categoryId, P.name, P.description FROM PRODUCT P, PRODUCT_ITEM I WHERE I.productItemId = ? AND P.dateDeleted IS NULL AND P.productId = I.productId`, [await productId]);
        return await response[0];
    } catch (e) {
        console.log(e);
        return [];
    }
}

module.exports = {
    findItem,
    findProductByItemId
}