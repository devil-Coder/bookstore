/**
 * Created by Raj Chandra on 26-02-2018.
 */
var express = require('express');
var router = express.Router();

var customer = require('../models/customers.js');
var product = require('../models/products.js');

var authenticate = require('../authenticate');
router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, vbookstore-access-token");
    if (req.method === 'OPTIONS') {
        var headers = {};
        headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
        headers["Access-Control-Allow-Credentials"] = false;
        res.writeHead(200, headers);
        res.end();
    } else {
        authenticate.verify_token(req, res, next);
    }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('main');
});

module.exports = router;
