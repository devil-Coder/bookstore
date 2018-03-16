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

//this is middleware
var requireAuthentication = function(req, res, next){
    var customerId = req.decoded._id;
    customer.find({'_id':customerId},function (err, doc) {
        if (err) {
            throw err;
        }
        else if(doc.seller){
            next();
        }
        else
            res.send('<h1><b>Not Found</b></h1>');
    });
}

/* GET users listing. */
router.get('/profile', function(req, res, next) {
    res.render('userProfile',{
        title : 'Profile View'
    });
});

router.get('/feeds', function(req, res, next) {
    res.render('main',{
        title : 'vBookStore | Home'
    });
});
module.exports = router;
