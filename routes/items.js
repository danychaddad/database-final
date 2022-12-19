const express = require('express');
const router = express.Router();
const con = require('../util/database');
const util = require('util');
const { getCurrentUser, generateJWT, findUser, isUserExists } = require('../util/user');
const query = util.promisify(con.query).bind(con);

// View item specified by id
router.get('/:id', async function (req, res) {
    const itemId = req.params.id;
    const respon = await query('SELECT I.productItemId, P.productId, I.qtyInStock, I.price, P.categoryId, P.name, P.description, P.sellerId FROM product P, product_item I WHERE P.productId = I.productId AND P.productId = ? AND P.dateDeleted IS NULL AND I.dateDeleted IS NULL', [itemId])
    if (await respon.length == 0) {
        return res.send("No such item");
    } else {
        return res.send(respon[0]);
    }
})

// Create a new item listing and redirect to its page
router.post('/new', async function (req, res) {
    let { name, description, stock, price, catId, sellerId } = req.body;
    if (!catId) {
        catId = null;
    }
    if (!(name && description && stock && price && sellerId)) {
        return res.send("Fill out all fields!");
    }
    await query('INSERT INTO product (sellerId, categoryId, name, description) VALUES (?,?,?,?);', [sellerId, catId, name, description]);
    let respon = await query('SELECT last_insert_id() AS id');
    let productId = await respon[0].id;
    try {
        await query('INSERT INTO product_item (productId, qtyInStock, price) VALUES (?,?,?)', [productId, stock, price]);
    } catch (e) {
        return res.send("Something went wrong!")
    }
    res.send("Successfully added item!");
})

router.delete('/:id', async function (req, res) {
    const itemId = req.params.id;
    const currentUserId = await getCurrentUser(req.headers.token);
    let respon;
    try {
        respon = await query('SELECT sellerId AS sellerId FROM product WHERE productId = ? AND dateDeleted IS NULL', [itemId]);
    } catch (e) {
        res.send("Something went wrong!");
    }
    if (respon.length == 0) {
        return res.send(`Item with ID ${itemId} doesn't exist!`);
    }
    if (await currentUserId == await respon[0].sellerId) {
        query('UPDATE product_item SET dateDeleted = now() WHERE productId = ?', [itemId]);
        query('UPDATE product SET dateDeleted = now() WHERE productId = ?', [itemId]);
        return res.send("Deleted items!");
    } else {
        return res.send("You do not own this item");
    }
})
router.route('/update/:id').
    // Checks if item exists, if it does, continue else send error.
    all(async function (req, res, next) {
        res.id = req.params.id;
        res.info = await getItemInfo(res.id);
        if (!await res.info) {
            return res.status(404).send("Item not found!");
        }
        next();
    })
    // Send item info for jad to enter in form
    .get(async function (req, res) {
        res.send(await res.info[0]);
    })
    // Recieve updated item info from form
    .post(async function (req, res) {
        const { catId, name, desc, stock, price } = req.body;
        if (!(name && desc && stock && price)) {
            return res.send("Please fill out all fields!");
        }
        // Update qtyInStock and price and set dateUpdated
        await query('UPDATE product_item SET qtyInStock = ?, price = ?,dateUpdated = now() WHERE productId = ?', [stock, price, res.id])
        // Update catId, name, desc and set dateUpdated
        await query('UPDATE product SET categoryId = ?, name = ?, description = ?, dateUpdated = now() WHERE productId = ?', [catId, name, desc, res.id])
        res.send("Successfully updated")
    })

// Get item info by ID, returns false if item not found
const getItemInfo = async (id) => {
    let respon = await query('SELECT P.categoryId, P.name, P.description, I.qtyInStock, I.price FROM product P LEFT OUTER JOIN product_item I ON P.productId = I.productId WHERE P.productId = ? AND P.dateDeleted IS NULL', [id]);
    if (respon.length == 0) {
        return false;
    }
    return respon;
}

module.exports = router;
