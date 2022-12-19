const express = require('express');
const router = express.Router();
const con = require('../util/database');
const util = require('util');
const { getCurrentUser, generateJWT, findUser, isUserExists } = require('../util/user');
const query = util.promisify(con.query).bind(con);
const { findCartId, createCart, clearCart, addToCart, updateCartItem, getCartItems } = require('../util/cartUtil');
const { findItem } = require('../util/itemUtil');
const { clear } = require('console');
const { createOrder } = require('../util/orderUtil');

// View cart items if user is logged in, and if it doesnt exist, create one, then send the cart items
router.get('/', async function (req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if (currentUserId != -1) {
        let response = await findCartId(currentUserId)
        if (await response == -1) {
            response = await createCart(currentUserId);
        }
        const cartItems = await getCartItems(currentUserId);
        if (await cartItems.length == 0) {
            res.send("Your cart is empty!");
        } else {
            res.send(cartItems);
        }
    } else {
        res.send("You are not logged in!");
    }
});

// Clear Cart
router.delete('/', async function (req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if (currentUserId != -1) {
        let response = await getCartItems(currentUserId);
        if (response.length == []) {
            res.send("Your cart is already empty!");
        } else {
            await clearCart(currentUserId);
            res.send("Your cart has been cleared!");
        }
    } else {
        res.send("You are not logged in!");
    }
});


// Add item to cart
router.post('/:itemId', async function (req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if (currentUserId != -1) {
        const itemId = req.params.itemId;
        let quantity = req.body.quantity;
        if (!quantity)
            quantity = 1;
        if (itemId && quantity) {
            const item = await findItem(itemId);
            if (item.length == 0) {
                res.send("Item does not exist!");
            } else {
                const response = await addToCart(currentUserId, itemId, quantity);
                if (response) {
                    res.send("Item added to cart!");
                } else {
                    res.send("Item could not be added to cart!");
                }
            }
        } else {
            res.send("Please enter an item id and quantity!");
        }
    } else {
        res.send("You are not logged in!");
    }
});

// Update item in cart
router.put('/:itemId', async function (req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if (currentUserId != -1) {
        const itemId = req.params.itemId;
        const quantity = req.body.quantity;
        if (itemId && quantity) {
            const item = await findItem(itemId);
            if (item.length == 0) {
                res.send("Item does not exist!");
            } else {
                const response = await updateCartItem(currentUserId, itemId, quantity);
                if (response) {
                    res.send("Item updated in cart!");
                } else {
                    res.send("Item could not be updated in cart!");
                }
            }
        } else {
            res.send("Please enter an item id and quantity!");
        }
    } else {
        res.send("You are not logged in!");
    }
});

// Delete item from cart
router.delete('/:itemId', async function (req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if (currentUserId != -1) {
        const itemId = req.params.itemId;
        if (itemId) {
            const item = await findItem(itemId);
            if (item.length == 0) {
                res.send("Item does not exist!");
            } else {
                const response = await removeFromCart(currentUserId, itemId);
                if (response) {
                    res.send("Item deleted from cart!");
                } else {
                    res.send("Item could not be deleted from cart!");
                }
            }
        } else {
            res.send("Please enter an item id!");
        }
    } else {
        res.send("You are not logged in!");
    }
});


// Checkout cart and make an order for the items in the cart using createOrder function
router.post('/checkout', async function (req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if (currentUserId != -1) {
        const response = await createOrder(currentUserId);
        if (response != -1) {
            res.send("Order created!");
        } else {
            res.send("Something Went Wrong!");
        }
    } else {
        res.send("You are not logged in!");
    }
});

module.exports = router;