/**
 * Created by Raj Chandra on 17-11-2017.
 */
var express = require('express');
var router = express.Router();

var customer = require('../models/customers.js');
var authenticate = require('../authenticate');

var bcrypt = require('bcrypt-nodejs');
var cheerio = require('cheerio');
var extend = require('util')._extend;
var path = require('path');
var nodemailer = require('nodemailer');
var fs = require('fs');
var async = require('async');
var crypto = require('crypto');


router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/* GET login/register page. */
router.get('/', function(req, res, next) {
    res.render('register', {
        title: 'Login or Register',
        header:'vBookStore',
        message : ''
    });
});

//This is for verification on each login

router.post('/verifyCustomer', function (req, res) {
    authenticate.authenticate(req, res);
});

//Post Registration - EMAIL AUTHENTICATION (Sending EMAIL)
router.post('/save', function (req, res, next) {
    var success=true;
    var rand = Math.random().toString(36).slice(2);
    var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    var data = new customer({
        name:req.body.name,
        password: hash,
        email: req.body.email,
        phone: req.body.phone,
        hashcode : rand,
        authcomp : false
    });
    var re = /^[A-Za-z ]+$/;
    if (!re.test(req.body.name)) {
        res.json({code: '0', message: 'Please enter a valid name'});
        success=false;
    }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(req.body.email)) {
        res.json({code: '0', message: 'Please enter a valid email.'});
        success=false;
    }
    re = /^[\d -]*/;
    if (!re.test(req.body.phone)) {
        res.json({code: '0', message: 'Your mobile number is invalid'});
        success=false;
    }
    re = /^([a-zA-Z0-9]{2,15})$/;
    if (!re.test(req.body.password)) {
        res.json({code: '0', message: 'Your password must contain 1 uppercase,1 lowercase, 1 digit and 1 special(@*#) character'});
        success=false;
    }
    if(success) {
        data.save(function (err, doc) {
            if (err && err.code == 11000) {
                res.json({code: '0', message: 'You have already registered'})
            }
            else if (err && err.code != 66) {
                res.json({code: '0', message: 'Something went wrong please try after sometime'})
            }
            else if (err) {
                res.json({code: '0', message: 'Something went wrong please try after sometime'})
            }
            else {
                var myobj = {email: req.body.email, hashcode: rand, authcomp: false};
                var s = req.headers.host + '/auth/' + "verifyMail?code=" + myobj.hashcode + "&email=" + myobj.email;
                var smtpTransport = nodemailer.createTransport("smtps://"+process.env.EMAIL+":" + encodeURIComponent(process.env.PASSWORD) + "@smtp.gmail.com:465");
                var mailOptions = {
                    to: req.body.email,
                    from: '"VIT Online BookStore" support.vBookStore@gmail.com',
                    subject: 'Email Authentication',
                    text: "You are receiving this because you have registered for vBookStore." + "\n\n" +
                    "Please click on the following link, or paste this into your browser to complete the process:\n\n" + s + "\n\n" +
                    "If you did not request this, please ignore this email."
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    if (err)
                        throw err;
                    else{
                        res.json({code: '1', message: "Please verify your email"});
                        console.log("Email Sent successfully !");
                    }
                });
                // Invoke the next step here however you like
                // Put all of the code here (not the best solution)
            }
        });
    }
});

router.get('/verifyMail', function(req, res, next) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(req.query.email)) {
        res.render('errorPage',{
            code: '0',
            message: 'Incorrect Link!'
        });
    }
    else {
        customer.findOne({email: req.query.email}, function (err, result) {
            if (err) throw err;
            if (!result) {
                res.render('errorPage', {
                    code: '0',
                    message: 'You have not registered'
                });
            }
            else if (result.authcomp) {
                res.render('errorPage', {
                    code: '0',
                    message: 'Your email is already verified'
                });
            }
            else {
                var re = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/;
                if (re.test(req.query.code)) {
                    if (req.query.code !== result.hashcode)
                        res.render('errorPage', {
                            code: '0',
                            message: 'The hash code we sent you has either expired or has been tampered'
                        });
                    // res.json({code: '0', message: 'Incorrect Hash Code/Hash Code expired'});
                    else {
                        var myquery = extend({}, result);
                        customer.update({'_id' : myquery._doc._id}, {$set:{authcomp:true}}, function (err, res1) {
                            if (err) throw err;
                            res.render('register', {
                                code: '0',
                                title : 'login or Register | vBookStore',
                                header : 'vBookStore',
                                message : 'Welcome ! Your email was verified successfully.'
                            });
                        });
                    }
                }
                else {
                    res.render('errorPage', {
                        code: 0,
                        message: 'The hashcode we sent you has been tampered. It is incorrect.'
                    });
                }
                //res.json({code: '0', message: 'Incorrect HashCode!'});
            }
        });
    }
});

router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            customer.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
                if (!user) {
                    res.json({code: '0',message:'No account with this email address exists.'});
                }
                else {
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function (err) {
                        done(err, token, user);
                    });
                }
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport("smtps://"+process.env.EMAIL+":" + encodeURIComponent(process.env.PASSWORD) + "@smtp.gmail.com:465");
            var mailOptions = {
                to: user.email,
                from: '"VIT Online BookStore" support.vBookStore@gmail.com',
                subject: 'vBookStore - Reset Password',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/auth/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                res.json({code: '1', message:'An e-mail has been sent with further instructions.'});
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
    });
});

router.get('/reset/:token', function(req, res) {
    console.log(req.params.token);
    customer.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        console.log(user);
        if(err)
            console.log(err);
        else if (!user) {
            res.render('errorPage',{
                message : 'Password reset token is invalid or has expired.'
            });
            // res.json({code: '0', message:'Password reset token is invalid or has expired.'});
        }
        //this will be sending the user to reset password page
        else{
            res.render('resetPassword',{
                title : "vBookStore | Reset Password",
                header : "Reset Password",
                code: 4
            });
        }
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            customer.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    res.json({code: '0', message: 'Password reset token is invalid or has expired.'});
                }
                else if (req.body.password !== req.body.confirm_password) {
                    res.json({code: '0', message: 'Confirm Password not same as Password'});
                }
                else {
                    var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                    user.password = hash;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    user.save(function (err) {
                        res.json({code: '0', message: 'Your password has been successfully changed.'});
                    });
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport("smtps://"+process.env.EMAIL+":" + encodeURIComponent(process.env.PASSWORD) + "@smtp.gmail.com:465");
            var mailOptions = {
                to: user.email,
                from: '"VIT Online BookStore" support.vBookStore@gmail.com',
                subject: 'vBookStore - Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                res.json({code: '0',message:'Success! Your password has been changed. \n Please wait we will redirect you to login page.'});
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/');
    });
});

router.post('/resend', function(req, res) {
    var email = req.body.email;
    var success = true;
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(email)) {
        res.json({code: '0', message: 'Invalid email!'});
        success = false;
    }
    if (success) {
        customer.findOne({email: email}, function (err, user) {
            if (!user) {
                res.json({code: '0', message: 'No account with this email address exists.'});
            }
            else {
                if (!user.authcomp) {
                    res.json({code: '1', message: "Verify your email address using the link sent to you."});
                    var s = req.headers.host + '/auth/' + "verifyMail?code=" + user.hashcode + "&email=" + user.email;
                    //console.log(req.headers.host);
// load in the json file with the replace values

                    var smtpTransport = nodemailer.createTransport("smtps://"+process.env.EMAIL+":" + encodeURIComponent(process.env.PASSWORD) + "@smtp.gmail.com:465");
                    var mailOptions = {
                        to: req.body.email,
                        from: '"VIT Online BookStore" support.vBookStore@gmail.com',
                        subject: 'vBookStore - Email Authentication',
                        text: "You are receiving this because you have requested us to resend the mail." + "\n\n" +
                        "Please click on the following link, or paste this into your browser to complete the process:\n\n" + s + "\n\n" +
                        "If you did not request this, please ignore this email."
                    };
                    smtpTransport.sendMail(mailOptions, function (err) {
                        if (err)
                            throw err;
                        else
                            console.log("Email Sent");
                    });
                    // Invoke the next step here however you like
                    // Put all of the code here (not the best solution)
                }
                else {
                    res.json({code: '0', message: 'You have already verified this Email-ID'});
                }
            }
        });
    }
});

module.exports = router;