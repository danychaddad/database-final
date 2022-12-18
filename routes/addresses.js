const express = require('express');
const router = express.Router();
const con = require('../util/database');
const util = require('util');
const { getCurrentUser, generateJWT, findUser, isUserExists } = require('../util/user');
const { response } = require('express');
const query = util.promisify(con.query).bind(con);

// Create a new address and redirect to viewing page
router.post('/new', async function (req, res) {
    let userId = await getCurrentUser(req.headers.token);
    if (userId == -1)
        return res.send("You are not logged in!");
    let { phoneNumber, region, city, street, building, floor, apartment, description } = req.body;
    if (!(phoneNumber && region && city && street && building && floor && apartment)) {
        return res.send("Please fill out all required fields!");
    }
    await query('INSERT INTO ADDRESS (userId, phoneNumber, region, city, street, building, floor, apartment, description) VALUES (?,?,?,?,?,?,?,?,?);', [userId, phoneNumber, region, city, street, building, floor, apartment, description]);
    res.send("Successfully added address!");
    //TODO: JAD REDIRECT IN FRONTEND TO VIEWING PAGE (PREVIOUS PAGE)
})

// View all addresses of current user
router.get('/', async function (req, res) {
    let userId = await getCurrentUser(req.headers.token);
    if (userId == -1)
        return res.send("You are not logged in!");
    const response = await query('SELECT A.addressId, A.region, A.city, A.street, A.building, A.floor, A.description, A.phoneNumber, A.apartment, A.dateCreated, A.dateUpdated FROM ADDRESS A, SITE_USER U WHERE A.userId = U.userId AND A.userId = ? AND A.dateDeleted IS NULL', [userId])
    if (response.length == 0) {
        res.send("No addresses found!").end();
    } else {
        res.send(response);
    }
})

// View address specified by addressId
router.route('/:id')
    .get(async function (req, res) {
        let userId = await getCurrentUser(req.headers.token);
        if (userId == -1)
            return res.send("You are not logged in!");
        const addressId = req.params.id;
        const response = await query('SELECT A.phoneNumber, A.region, A.city, A.street, A.building, A.floor, A.apartment, A.description FROM ADDRESS A, SITE_USER U WHERE A.userId = U.userId AND A.userId = ? AND A.addressId = ? AND A.dateDeleted IS NULL;', [userId, addressId]);
        if (response.length == 0) {
            res.send("Address doesn't exist!").end();
        } else {
            res.send(response[0]);
        }
    })
    // Update address specified by addressId
    .put(async function (req, res) {
        //Check if user is logged in, and if the address exists in the first place
        let userId = await getCurrentUser(req.headers.token);
        if (userId == -1)
            return res.send("You are not logged in!");
        const addressId = req.params.id;
        let response = await query('SELECT A.phoneNumber, A.region, A.city, A.street, A.building, A.floor, A.apartment, A.description FROM ADDRESS A, SITE_USER U WHERE A.userId = U.userId AND A.userId = ? AND A.addressId = ? AND A.dateDeleted IS NULL;', [userId, addressId]);
        if (response.length == 0) {
            res.send("Address doesn't exist!").end();
        }
        //Take parameters from request body, if they are not specified, take the old values
        let { phoneNumber, region, city, street, building, floor, apartment, description } = req.body;

        if (!phoneNumber)
            phoneNumber = response[0].phoneNumber;
        if (!region)
            region = response[0].region;
        if (!city)
            city = response[0].city;
        if (!street)
            street = response[0].street;
        if (!building)
            building = response[0].building;
        if (!floor)
            floor = response[0].floor;
        if (!apartment)
            apartment = response[0].apartment;
        if (!description)
            description = response[0].description;

        //Create the New Address, then delete the old one
        const newAddressId = await query('INSERT INTO ADDRESS (userId, phoneNumber, region, city, street, building, floor, apartment, description) VALUES (?,?,?,?,?,?,?,?,?);', [userId, phoneNumber, region, city, street, building, floor, apartment, description]);
        await query('UPDATE ADDRESS SET dateDeleted = NOW() WHERE userId = ? AND addressId = ?;', [userId, addressId]);
        res.send("Successfully updated address!");
        //We can send the new address ID, but I don't think it's necessary
        //res.send(newAddressId);
        //TODO: JAD REDIRECT IN FRONTEND TO VIEWING PAGE (PREVIOUS PAGE)
    })
    // Delete address specified by addressId making sure that the user is the owner of the address
    .delete(async function (req, res) {
        let userId = await getCurrentUser(req.headers.token);
        if (userId == -1)
            return res.send("You are not logged in!");
        const addressId = req.params.id;
        const response = await query('UPDATE ADDRESS SET dateDeleted = NOW() WHERE userId = ? AND addressId = ? AND dateDeleted IS NULL', [userId, addressId]);
        if (response.affectedRows == 0) {
            return res.send("Address doesn't exist!");
        } else {
            return res.send("Address deleted successfully!");
        }
    })

module.exports = router;