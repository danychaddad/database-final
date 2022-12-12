const express = require('express');
const router = express.Router();
const con = require('../util/database');
const util = require('util');
const { getCurrentUser, generateJWT, findUser, isUserExists } = require('../util/user');
const query = util.promisify(con.query).bind(con);

// Create new payment method
router.post('/new', async function (req, res) {
    userId = await getCurrentUser(req.headers.token);
    if (!userId) {
        return res.send("You are not logged in!");
    }
    let {cardName, firstName, lastName, cardNumber, expirationDate, cvv} = req.body;
    if (!(cardName && firstName && lastName && cardNumber && expirationDate && cvv)) {
        return res.send("Please fill out all fields!");
    }
    await query('INSERT INTO PAYMENT_METHOD (userId, cardName, firstName, lastName, cardNumber, expirationDate, cvv) VALUES (?,?,?,?,?,LAST_DATE(?),?);', [userId, cardName, firstName, lastName, cardNumber, expirationDate, cvv]);
    res.send("Successfully added payment method!");
    //redirecting in backend, verify with jad
    res.redirect('/payments');
})

// View all payment methods of current user
router.get('/', async function (req, res) {
    userId = await getCurrentUser(req.headers.token);
    if (!userId) {
        return res.send("You are not logged in!");
    }
    const response = await query('SELECT * FROM PAYMENT_METHOD WHERE userId = ? AND dateDeleted IS NULL', [userId])
    if (response.length == 0) {
        res.send("No payment methods found!").end();
    } else {
        res.send(response);
    }
})

// View payment method specified by paymentId
router.get('/:id', async function (req, res) {
    const paymentId = req.params.id;
    const userId = await getCurrentUser(req.headers.token);
    if (!userId) {
        return res.send("You are not logged in!");
    }
    const response = await query('SELECT * FROM PAYMENT_METHOD WHERE userId = ? AND paymentId = ? AND dateDeleted IS NULL', [userId, paymentId]);
    if (response.length == 0) {
        res.send("Payment method doesn't exist!").end();
    } else {
        res.send(response[0]);
    }
})

// Update payment method specified by paymentId
router.post('/:id', async function (req, res) {
    const paymentId = req.params.id;
    const userId = await getCurrentUser(req.headers.token);
    if (!userId) {
        return res.send("You are not logged in!");
    }
    let {cardName, firstName, lastName, cardNumber, expirationDate, cvv} = req.body;
    if (!(cardName && firstName && lastName && cardNumber && expirationDate && cvv)) {
        return res.send("Please fill out all fields!");
    }
    const response = await query('UPDATE PAYMENT_METHOD SET cardName = ?, firstName = ?, lastName = ?, cardNumber = ?, expirationDate = LAST_DATE(?), cvv = ? WHERE userId = ? AND paymentId = ? AND dateDeleted IS NULL', [cardName, firstName, lastName, cardNumber, expirationDate, cvv, userId, paymentId]);
    if (response.affectedRows == 0) {
        res.send("Payment method doesn't exist!").end();
    }
    res.send("Successfully updated payment method!");
})

// Delete payment method specified by paymentId
router.delete('/:id', async function (req, res) {
    const paymentId = req.params.id;
    const userId = await getCurrentUser(req.headers.token);
    if (!userId) {
        return res.send("You are not logged in!");
    }
    const response = await query('UPDATE PAYMENT_METHOD SET dateDeleted = NOW() WHERE userId = ? AND paymentId = ?', [userId, paymentId]);
    if (response.affectedRows == 0) {
        res.send("Payment method doesn't exist!").end();
    }
    res.send("Successfully deleted payment method!");
})
