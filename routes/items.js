const express = require('express');
const router = express.Router();
const con = require('../util/database');
const util = require('util');

const query = util.promisify(con.query).bind(con);

// View item specified by id
router.get('/:id', async function (req, res) {
    const itemId = req.params.id;
    const respon = await query('SELECT P.sellerId, P.name, P.description, I.price, I.qtyInStock FROM product P, product_item I WHERE P.productId = I.productId AND P.productId = ?', [itemId])
    if (await respon.length == 0) {
        res.send("No such item").end();
    } else {
        res.send(respon[0]);
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

router.put('/update/:id', async function (req, res) {
    let itemId = req.body;
    
})

module.exports = router;
