const express = require('express');
const router = express.Router();
const con = require('../util/database');
const util = require('util');

const query = util.promisify(con.query).bind(con);

router.get('/:id', function (req, res) {
    res.send(req.params.id);
})

module.exports = router;
