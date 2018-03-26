var express = require('express');
var path = require('path');
require('dotenv').config();
var favicon = require('serve-favicon');
var logger = require('morgan');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var seller = require('./routes/seller');
var dashboard = require('./routes/dashboard');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/auth', auth);
app.use('/seller', seller);
app.use('/dashboard', dashboard);

//for user Logout
app.get('/logout',function (req,res) {
    res.clearCookie(process.env.TOKEN_NAME);
    res.redirect('/');
});
//CREATING A DATA BASE OBJECT
var db = mongoose.connection;

//CONNECTING TO MONGODB ON START
mongoose.connect(process.env.MONGODB, function(err) {
    if (err) {
        console.log(err);
        // process.exit(1);
    } else {
        console.log('Database ready to use.');
    }
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
console.log('App running. Setting up db..');
module.exports = app;
