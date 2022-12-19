const express = require('express');
const router = express.Router();
const con = require('../util/database');
const util = require('util');
const { getCurrentUser, generateJWT, findUser, isUserExists } = require('../util/user');
const query = util.promisify(con.query).bind(con);

// View item specified by id
router.get('/', async function(req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if(!currentUserId) return res.status(400).send("You are not logged in!");
    try {
        response = await query("SELECT * FROM product_item_with_details_and_image_path WHERE product_item_with_details_and_image_path.sellerId = ?;", [currentUserId]);
        res.send(response);
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});
router.delete('/:id', async function(req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if(!currentUserId) return res.status(400).send("You are not logged in!");
    const itemId = req.params.id;
    try {
        //Get productId from product_item
        response = await query("SELECT productId FROM product_item WHERE productItemId = ?;", [itemId]);
        if(response.length == 0) return res.status(400).send("Item does not exist!");
        //Check if user is the seller of the item
        response = await query("SELECT sellerId FROM product WHERE productId = ?;", [response[0].productId]);
        if(response[0].sellerId != currentUserId) return res.status(400).send("You are not the seller of this item!");
        //Delete item
        response = await query("UPDATE product_item SET dateDeleted = NOW() WHERE productItemId = ?;", [itemId, currentUserId]);
        res.send("Item deleted!");
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});
router.get('/products', async function(req, res) {
    const currentUserId = await getCurrentUser(req.headers.token);
    if(!currentUserId) return res.status(400).send("You are not logged in!");
    try {
        response = await query("SELECT product.productId, product.categoryId, product.name, product.description, product.sellerId, product_gallery.image_path FROM product JOIN (SELECT productId, MIN(imagePath) as image_path FROM product_gallery WHERE dateDeleted IS NULL GROUP BY productId) product_gallery  WHERE product.productId = product_gallery.productId AND product.dateDeleted IS NULL AND product.sellerId = ?;", [currentUserId]);
        res.send(response);
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});
router.get('/:id', async function (req, res) {
    const itemId = req.params.id;
    const respon = await query('SELECT * FROM product_item_with_details WHERE product_item_with_details.dateDeleted IS NULL AND product_item_with_details.productItemId = ?', [itemId])
    if (await respon.length == 0) {
        return res.status(400).send("No such item");
    } else {
        const item = respon[0];
        item.images = await query('SELECT imagePath AS image_path FROM product_gallery WHERE productId = ? AND dateDeleted IS NULL', [item.productId]);
        return res.send(item);
    }
});
// Create a new item listing and redirect to its page
router.post('/new-product', async function(req, res) {
    let { name, description, catId, imagePaths } = req.body;
    if (!catId) {
        catId = 1;
    }
    const currentUserId = await getCurrentUser(req.headers.token);
    if(!currentUserId) return res.status(400).send("You are not logged in!");
    if (!(name && description && imagePaths) || imagePaths.length == 0) {
        return res.status(400).send("Fill out all fields!");
    }
    const productId = await query('INSERT INTO product (sellerId, categoryId, name, description) VALUES (?,?,?,?);', [currentUserId, catId, name, description]);
    for(imagePath of imagePaths) 
        await query('INSERT INTO product_gallery (productId, imagePath) VALUES (?,?)', [productId.insertId, imagePath]);
    res.send({ productId : productId.insertId });
})
router.post('/new-product-item', async function(req, res) {
    let { productId, quantity, price } = req.body;
    if (!(productId && quantity && price)) {
        return res.status(400).send("Fill out all fields!");
    }
    const currentUserId = await getCurrentUser(req.headers.token);
    if(!currentUserId) return res.status(400).send("You are not logged in!");
    const product = await query('SELECT * FROM product WHERE productId = ? AND dateDeleted IS NULL', [productId]);
    if(product.length == 0) return res.status(400).send("Product not found!");
    if(product[0].sellerId != currentUserId) return res.status(400).send("You do not own this product!");
    try {
        await query('INSERT INTO product_item (productId, qtyInStock, price) VALUES (?,?,?)', [productId, quantity, price]);
    } catch (e) {
        return res.status(400).send("Something went wrong!")
    }
    res.send("Successfully added item!");
});

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
