const express = require('express');
const router = express.Router();
const con = require('../util/database');
const util = require('util');

const query = util.promisify(con.query).bind(con);

router.get('/:id', async function (req, res) {
    const itemId = req.params.id;
    const respon = await query('SELECT sellerId, name, description FROM product WHERE productId = ?', [itemId])
    if (await respon.length == 0) {
        res.send("No such item").end();
    } else {
        res.send(respon[0]);
    }
})

module.exports = router;
