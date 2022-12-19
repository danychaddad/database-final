const express = require('express');
const router = express.Router();
const con = require('../util/database');
const util = require('util');
const { getCurrentUser, generateJWT, findUser, isUserExists } = require('../util/user');
const query = util.promisify(con.query).bind(con);
const { findCartId, createCart, clearCart, addToCart, updateCartItem, getCartItems, getCartItemsById } = require('../util/cartUtil');
const { findItem } = require('../util/itemUtil');
const { clear } = require('console');
const { createOrder } = require('../util/orderUtil');

// View cart items if user is logged in, and if it doesnt exist, create one, then send the cart items
router.get('/', async function (req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if (currentUserId != -1) {
        let response = await findCartId(currentUserId);
        if (response == -1) {
            response = await createCart(currentUserId);
        }
        const cartItems = await getCartItemsById(response);
        res.send(cartItems);
    } else {
        res.status(400).send("You are not logged in!");
    }
});

// Clear Cart
router.delete('/', async function (req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if (currentUserId != -1) {
        let response = await getCartItemsByUserId(currentUserId);
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


// Checkout cart and make an order for the items in the cart using createOrder function
router.post('/checkout', async function (req, res) {
    const addressId = req.body.addressId;
    const currentUserId = await getCurrentUser(req.headers.token);
    if (currentUserId) {
        try {
            const orderId = await createOrder(currentUserId, addressId);
            return res.send({ orderId });
        } catch (err) {
            res.status(400).send(err.message);
        }
    } else {
        res.status(400).send("You are not logged in!");
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
router.delete('/:shoppingCartItemId', async function (req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if (currentUserId != -1) {
        const itemId = req.params.shoppingCartItemId;
        if (itemId) {
            
            try {
                const response = await query("DELETE FROM shopping_cart_item WHERE shoppingCartItemId = ?", [itemId]);
                res.send("Item deleted from cart!");
            } catch (err) {
                res.status(400).send(err.message);
            }
        } else {
            res.status(400).send("Please enter an item id!");
        }
    } else {
        res.status(400).send("You are not logged in!");
    }
});


router.get('/order-history', async function (req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if (currentUserId != -1) {
        const orders = await query("SELECT * FROM shop_order WHERE userId = ?", [currentUserId]);
        for(const order of orders) {
            order.items = await query("SELECT * FROM order_item, product_item_with_details_and_image_path A WHERE order_item.shopOrderId = ? AND A.productItemId = order_item.productItemId", [order.shopOrderId]);
            console.log(order.items);
            if(order.items.length == 0) {
                //Remove order if it has no items
            }
        }
        res.send(orders);
    } else {
        res.status(400).send("You are not logged in!");
    }
});

router.get('/sales-history', async function (req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if (currentUserId != -1) {
        const orders = await query("SELECT * FROM shop_order, address WHERE address.addressId = shop_order.shippingAddress AND shopOrderId IN (SELECT DISTINCT shopOrderId FROM order_item, product_item_with_details A WHERE A.sellerId = ? AND A.productItemId = order_item.productItemId)", [currentUserId]);
        for(const order of orders) {
            order.items = await query("SELECT * FROM order_item, product_item_with_details_and_image_path P WHERE order_item.shopOrderId = ? AND P.productItemId = order_item.productItemId", [order.shopOrderId]);
            console.log(order.items);
            if(order.items.length == 0) {
                //Remove order if it has no items
            }
        }
        res.send(orders);
    } else {
        res.status(400).send("You are not logged in!");
    }
});

module.exports = router;