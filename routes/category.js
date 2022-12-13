const express = require('express');
const router = express.Router();
const con = require('../util/database');
const util = require('util');
const query = util.promisify(con.query).bind(con);

router.post('/new', async function (req, res) {
    const { parentCatName, catName } = req.body;
    const parentCatId = await getCatId(parentCatName);
    try {
        await query('INSERT INTO product_category (parentCategoryId, categoryName) VALUES (?,?)', [parentCatId, catName]);
    } catch (e) {
        console.log(e);
        return res.send("Something went wrong!");
    }
    return res.send(`Successfully added category ${catName}`);
})

let getCatId = async (catName) => {
    const respon = await query('SELECT productCategoryId FROM product_category WHERE categoryName = ?', [catName]);
    if (await respon.length == 0) {
        return null;
    }
    return respon[0].productCategoryId;
}

module.exports = router;