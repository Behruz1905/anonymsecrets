const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");
const { Schema } = mongoose;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


//define schema
const userSchema = new Schema({
    email:  String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });


// Define Model (User model)
const User = new mongoose.model('User', userSchema);

module.exports = User;


