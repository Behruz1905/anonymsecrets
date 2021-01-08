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
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

//const md5 = require("md5");
// const bcrypt = require('bcrypt');
// const saltRounds = 10;



const app = express();

//define static folder
app.use(express.static('public'));

// Define template engine
app.set('view engine', 'ejs');

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

//connect to mongodb
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

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

passport.use(User.createStrategy());
 
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get('/', function(req, res){
  res.render('home');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });  


app.get('/login', function(req, res){
    res.render('login');
});

app.get('/register', function(req, res){
    res.render('register');
});

app.get('/secrets', function(req, res){
   User.find({"secret": {$ne:null}}, function(err, foundUsers){
       if(err){
           console.log(err);
       }else{
           if(foundUsers){
               res.render("secrets", {userwithSecrets: foundUsers})
           }
       }
   });
   
});

app.get("/submit",function(req,res){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        res.render('submit');
    } else{
        res.redirect("/login");
    }
});

app.post("/submit", function(req,res){
    const submittedSecret = req.body.secret;
    console.log(req.user._id);
    User.findById(req.user._id, function(err,foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                foundUser.secret = submittedSecret;
                foundUser.save(function(){
                    res.redirect("/secrets");
                });
            }
        }
    })
});


app.post('/register', function(req, res){

    User.register({ username: req.body.username},req.body.password, function(err, user){
        if (err) {  
            console.log(err + "  problem bash verdi")
            res.redirect("/register");
        }else{
        
            passport.authenticate("local")(req, res, function(){  
                res.redirect("/secrets"); 
            })
        }
    });

    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     const newUser = new User({
    //         email: req.body.email,
    //         password: hash
    //     });
    //     newUser.save(function(err) {
    //         if(err) {   
    //             console.log(err)
    //         }else{
    //             console.log("save edildi")
    //             res.render("secrets");
    //         }  
            
    //     });
    // });
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });


app.post('/login', function(req, res){

    const user = new User({
        username: req.body.email,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) { 
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })

        }
        
      });

    // User.findOne({email: email }, function(err,foundUser){
    //     if(err){
    //         console.log(err);
    //     }else{
    //         if(foundUser){
    //             bcrypt.compare(password, foundUser.password, function(err, result) {
    //                if(result === true){
    //                 console.log("dogru##")
    //                 res.render("secrets");
    //                }else{
    //                    console.log("yoxdu user")
    //                }
    //             });
             
    //         }
    //     }
    // })
});








app.listen(3000, function(){
    console.log("3000 portuna baglanti ugurludur")
});