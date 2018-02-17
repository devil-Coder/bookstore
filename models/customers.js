var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var customerSchema = new Schema({
    name : {
        type:String,
        required: true,
        lowercase : true
    },
    password: {//password to secure the account
        type : String,
        required: true
    },
    email:{//to verify the Registration
        type : String,
        unique : true,
        required: true,
        lowercase : true
    },
    phone:{//mobile number
        type : String,
        required : true
    },
    cart:[{
        productId : {type:String}
    }],
    memberFrom:{//to track the time of registration
        type:Date,
        default: Date.now
    },
    authcomp:{ //make it true wen customer authenticates the email
        type: Boolean,
        default: false
    },
    hashcode:{
        type : String
    },
    productsBought : [{ //save the id of products bought
        type: String
    }],
    productsViewed : [{ //save the ids of products the customer views
        type:String
    }],
    productForSell : [{
        type: String
    }],
    seller : { //make it true for the sellers
        type : Boolean,
        default : false
    },
    developer : { //make it true for the admin
        type : Boolean,
        default : false
    },
    points : {
        type : Number,
        default : 0
    },
    resetPasswordToken: String, //token sent to customers for reset password
    resetPasswordExpires: Date //expire time for resetting the password

});
customerSchema.methods.verifyPassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (err, res) {
        if (err) {
            callback(err, null)
        }
        else {
            callback(null, res);
        }
    });
};

var customers =module.exports = mongoose.model('customers', customerSchema);

