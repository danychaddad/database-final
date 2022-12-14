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

router.post('/update', async function (req, res) {
    const catName = req.body.catName;
    const catId = await getCatId(catName);
    if (await catId == null) {
        return res.send("Category does not exist!");
    }
    const parentCatName = req.body.parentCatName;
    let parentCatId = null;
    if (parentCatName != null) {
        parentCatId = await getCatId(parentCatName);
        if (parentCatId == null) {
            return res.send("Parent category does not exist!");
        }
    }
    let newCatName = req.body.newName;
    if (!newCatName) {
        newCatName = catName;
    }
    try {
        await query('UPDATE product_category SET categoryName = ?, parentCategoryId = ?, dateUpdated = now() WHERE productCategoryId = ?', [newCatName, parentCatId, catId]);
    } catch (e) {
        console.log(e)
        return res.send("Something went wrong!");
    }
    return res.send(`Successfully updated category ${catName}`);
})


let getCatId = async (catName) => {
    const respon = await query('SELECT productCategoryId FROM product_category WHERE categoryName = ?', [catName]);
    if (await respon.length == 0) {
        return null;
    }
    return respon[0].productCategoryId;
}

module.exports = router;