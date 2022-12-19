const con = require('./database');
const util = require('util');
const query = util.promisify(con.query).bind(con);
const { findCartId, createCart, clearCart, addToCart, updateCartItem, getCartItems, getCartTotal } = require('./cartUtil');
const { findItem, findProductByItemId } = require('./itemUtil');

// Find order by id
const findOrderById = async (orderId) => {
    const sql = "SELECT shopOrderId, dateCreated FROM SHOP_ORDER WHERE shopOrderId = ? AND dateDeleted IS NULL";
    const response = await query(sql, [orderId]);
    return response;
}

// find orders by userId
const findOrdersByUserId = async (userId) => {
    const sql = "SELECT shopOrderId, dateCreated FROM SHOP_ORDER WHERE userId = ? AND dateDeleted IS NULL ORDER BY dateCreated DESC";
    const response = await query(sql, [userId]);
    return response;
}

// find items in order
const findItemsInOrder = async (orderId) => {
    const sql = "SELECT productItemId, qty, totalPrice FROM ORDER_ITEM WHERE shopOrderId = ? AND dateDeleted IS NULL";
    const response = await query(sql, [orderId]);
    return response;
}

// Create order
const createOrder = async (userId, addressId, cartId) => {
    try {
        const cartItems = await getCartItems(userId);
        // Make sure that the user has enough money to buy the items in the cart
        const total = await getCartTotal(userId);
        const userBalance = await query('SELECT balance FROM SITE_USER WHERE userId = ?', [userId]);
        if (userBalance[0].balance < total) {
            return -1;
        }
        // Make sure that there are enough items in stock 
        for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems[i];
            const productItem = await findItem(item.productItemId);
            if (productItem[0].qtyInStock < item.qty) {
                return -1;
            }
        }
        // Create the shop_order entity first, then create the order_item entities
        const response = await query('INSERT INTO shop_order (userId, shippingAddress) VALUES (?,?)', [userId, addressId]);
        const orderId = response.insertId;
        // UPDATE the buyer's balance
        await query('UPDATE SITE_USER SET balance = balance - ? WHERE userId = ?', [total, userId]);
        for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems[i];
            console.log(item);
            const product = await findProductByItemId(item.productItemId);
            console.log(await product);
            const itemPrice = await item.qty * product.price;
            console.log(itemPrice);
            // UPDATE the seller's balance and create the order_item entity
            await query('UPDATE SITE_USER SET balance = balance + ? WHERE userId = ?', [itemPrice, product.sellerId]);
            await query(`INSERT INTO order_item (productItemId, shopOrderId, qty, totalPrice) VALUES (?, ?, ?, ?)`, [item.productItemId, orderId, item.qty, itemPrice]);
        }
        await clearCart(userId);
        return orderId;
        // return "Order created successfully!";
        // TODO: jad redirect to order page
    } catch (e) {
        console.log(e);
        return -1;
    }

}

// Export all functions
module.exports = {
    findOrderById,
    findOrdersByUserId,
    findItemsInOrder,
    createOrder
}