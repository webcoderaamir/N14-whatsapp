var express = require('express');
var router = express.Router();
var userModel = require("./users");
var msgModel = require("./msg")
var passport = require("passport");
var mongoose = require("mongoose");
var localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

mongoose.connect("mongodb://0.0.0.0/socket-passport")
  .then(result => {
    console.log("connected to mongodb database")
  }).catch(err => {
    console.log(err)
  })

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect("/login");
}

/* GET home page. */
router.get('/', isLoggedIn, function (req, res, next) {
  userModel.findOne({
    username: req.session.passport.user
  }).then(function (loggedInUser) {
    res.render('index', { user: loggedInUser });
  })
});

//user authentication
router.post('/register', function (req, res, next) {
  var newUser = new userModel({
    username: req.body.username,
    pic: req.body.pic
  })
  userModel.register(newUser, req.body.password)
    .then(function () {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/') //register user go to / page
      })
    })
});

router.get("/register", function (req, res, next) {
  res.render("register")
})

router.post("/login", passport.authenticate("local",
  {
    successRedirect: "/",
    failureRedirect: "/login"
  }), function (req, res, next) { });

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

router.get("/login", function (req, res, next) {
  res.render("login")
})

router.post("/findUser", isLoggedIn, async (req, res, next) => {
  var findUsername = req.body.username
  var findUser = await userModel.findOne({
    username: findUsername
  })
  if (findUser) {
    res.status(200).json({
      user: findUser
    })
  }
  else {
    res.status(404).json({
      message: 'User not found'
    })
  }
})

router.post("/findChats", isLoggedIn, async (req, res, next) => {

  var oppositeUser = await userModel.findOne({
    username: req.body.oppositeUser
  })

  var chats = await msgModel.find({
    $or: [
      {
        toUser: req.user.username,
        fromUser: oppositeUser.username
      },
      {
        toUser: oppositeUser.username,
        fromUser: req.user.username
      }
    ]
  })
  res.status(200).json({ chats })
  console.log(chats)

  // res.json({ chats })
})
//user authentication

module.exports = router;
