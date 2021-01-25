//jshint esversion:6

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");
const { Schema } = mongoose;
const session = require('express-session');
const passport = require('passport');


//const md5 = require("md5");
// const bcrypt = require('bcrypt');
// const saltRounds = 10;



const app = express();

//define static folder
app.use(express.static('public'));

// Define template engine
app.set('view engine', 'ejs');


const Routes = require('./routes');



// app.use(express.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 


// for session
app.set('trust proxy', 1)
app.use(session({
    secret: 'Behruz',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }  //http uchun bunu false eledim.. https de true elemey lazimdi
}));

app.use(passport.initialize());
app.use(passport.session());


//routes
app.use(Routes);


//connect to mongodb

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);







app.listen(3000, function(){
    console.log("3000 portuna baglanti ugurludur")
});
