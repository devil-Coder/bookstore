/**
 * Created by Raj Chandra on 10/14/2017.
 */

var jwt = require('jsonwebtoken');
var customer = require('./models/customers.js');
var bcrypt = require('bcrypt-nodejs');


function authenticate(req, res) {
    if (req.body.email && req.body.password) {
        authenticate_user(req.body.email.toLowerCase(), req.body.password, function (err, user, auth) {
            if(err){
                res.send({code: 0,message: "Please verify your email."});
            }
            else if(user && !auth){
                res.send({code: 0,message : 'Incorrect Password.'})
            }
            else if(!user){
                res.send({code: 0,message : 'You have not registered. Please register and try logging in.'});
            }
            else {
                user.password = '&bcdji8658vybfgejch9736#26&&T63458%32';
                var token = jwt.sign(user.toJSON(),process.env.SECRET,{expiresIn: 60*60*1}); //expires in one day

                res.cookie(process.env.TOKEN_NAME,token);

                // return the information including token as JSON
                res.json({
                    code: 1 ,
                    user : user
                });
            }
        })
    }
}

function authenticate_user(email, password, callback) {
    customer.findOne({ email: email }, function (err, user) {
        if (err) {
            return callback(err, null,false);
        }
        else if (!user) {
            return callback(null, null,false);
        }
        else if(!user.authcomp){
            return callback("Please verify your email", null,false);
        }
        else{
            user.verifyPassword(password, function (error, flag) { //flag is true for correct password, false otherwise.
                if(error){ //if error occurs
                    return callback(error, null, flag);
                }
                else if(flag) { //elseif no error occurs and password is correct
                    return callback(null, user, flag);
                }
                else if(!flag){ //else if no error and password is incorrect
                    return callback(null,user,flag)
                }
            });
        }
    });
}

function check_token(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.cookies[process.env.TOKEN_NAME];
    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, process.env.SECRET, function(err, decoded) {
            if (err) {
                res.redirect('/');
                // return res.json({code: 0,message: "Your session expired or You haven't logged in! Please try logging in :)"});
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
        res.redirect('/');
        // var error = {stack : 'To hack our website meet Raj Chandra. He will teach you XD. \nAlso we offer website hacking techniques for beginners.\nVisit our website for more.',status : 403};
        // return res.status(403).render('error',{
        //     message: 'You do not belong here :/',
        //     error : error
        // });
        //    json({code :0,message: "You are not authorized to visit this URL."});
    }
}

module.exports = {authenticate: authenticate, verify_token: check_token};