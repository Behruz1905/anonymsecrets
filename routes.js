const express = require('express');
const  router = express.Router();
const User = require('./models/user');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');





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




router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
});  





// Home page route.

router.get('/', function(req, res){
    res.render('home');
});

router.get('/login', function(req, res){
    res.render('login');
});


router.get('/register', function(req, res){
    res.render('register');
});

router.get('/secrets', function(req, res){
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


router.get("/submit",function(req,res){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        res.render('submit');
    } else{
        res.redirect("/login");
    }
});

router.post("/submit", function(req,res){
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


router.post('/register', function(req, res){

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

});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });


router.post('/login', function(req, res){

    const user = new User({
        username: req.body.email,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) { 
            console.log(err+ " loginde problem");
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




module.exports = router;