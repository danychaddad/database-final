const con = require('./database')
const util = require('util')
const query = util.promisify(con.query).bind(con);

// Searches for the cart in the database. If found, return the cart Id, else create a new cart
const findCartId = async (userId) => {
    try {
        const response = await query(`SELECT shoppingCartId FROM SHOPPING_CART WHERE userId = ? AND dateDeleted IS NULL`, [userId]);
        if (response.length == 0) {
            return -1;
        }
        return response[0].shoppingCartId;
    } catch (e) {
        return -1;
    }
}

// create a new cart
const createCart = async (userId) => {
    try {
        const response = await query('INSERT INTO shopping_cart (userId) VALUES (?)', [userId]);
        return response.insertId;
    } catch (e) {
        return -1;
    }
}

// Clear Cart
const clearCart = async (userId) => {
    try {
        const cartId = await findCartId(userId);
        if (cartId == -1) {
            return "Your cart is already empty!";
        }
        // soft delete all items in cart, then delete the cart itself
        await query(`UPDATE SHOPPING_CART_ITEM SET dateDeleted = NOW() WHERE shoppingCartId = ?`, [cartId]);
        await query(`UPDATE SHOPPING_CART SET dateDeleted = NOW() WHERE shoppingCartId = ?`, [cartId]);
        return true;
    } catch (e) {
        return false;
    }
}

// Add item to cart
const addToCart = async (userId, itemId, qty) => {
    try {
        const cartId = await findCartId(userId);
        if (cartId == -1) {
            cartId = createCart(userId);
        }
        await query(`INSERT INTO SHOPPING_CART_ITEM (shoppingCartId, productItemId, qty) VALUES (?, ?, ?)`, [cartId, itemId, qty]);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

// Update item in cart
const updateCartItem = async (userId, itemId, qty) => {
    try {
        const cartId = await findCartId(userId);
        if (cartId == -1) {
            return false;
        }
        await query(`UPDATE SHOPPING_CART_ITEM SET qty = ?, dateUpdated = NOW() WHERE shoppingCartId = ? AND productItemId = ? AND dateDeleted IS NULL`, [qty, cartId, itemId]);
        return true;
    } catch (e) {
        return false;
    }
}

// Remove item from cart
const removeFromCart = async (userId, itemId) => {
    try {
        const cartId = await findCartId(userId);
        if (cartId == -1) {
            return false;
        }
        await query(`UPDATE SHOPPING_CART_ITEM SET dateDeleted = NOW() WHERE shoppingCartId = ? AND productItemId = ? AND dateDeleted IS NULL`, [cartId, itemId]);
        return true;
    } catch (e) {
        return false;
    }
}

// Get all items in cart
const getCartItems = async (userId) => {
    try {
        const cartId = await findCartId(userId);
        if (cartId == -1) {
            return false;
        }
        const response = await query(`SELECT productItemId, qty FROM SHOPPING_CART_ITEM WHERE shoppingCartId = ? AND dateDeleted IS NULL`, [cartId]);
        return response;
    } catch (e) {
        return false;
    }
}

// Get total price of cart
const getCartTotal = async (userId) => {
    try {
        const cartId = await findCartId(userId);
        if (cartId == -1) {
            return false;
        }
        const response = await query(`SELECT SUM(P.price * S.qty) AS total FROM PRODUCT_ITEM P, SHOPPING_CART_ITEM S, SHOPPING_CART C WHERE C.userId = ? AND C.shoppingCartId = S.shoppingCartId AND S.productItemId = P.productItemId AND S.dateDeleted IS NULL AND P.dateDeleted is NULL`, [userId, cartId]);
        return response[0].total;
    } catch (e) {
        return false;
    }
}

module.exports = {
    findCartId,
    clearCart,
    addToCart,
    createCart,
    updateCartItem,
    removeFromCart,
    getCartItems,
    getCartTotal
}