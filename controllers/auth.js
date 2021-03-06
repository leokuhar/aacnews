// Load required packages
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var jwt = require('jwt-simple');
var moment = require('moment');

passport.use(new LocalStrategy(
  function(username, password, callback) {

    User.findOne({ username: username.toLowerCase() }, function (err, user) {
      if (err) { return callback(err); }

      // No user found with that username
      if (!user) { return callback(null, false); }

      // Make sure the password is correct
      user.verifyPassword(password, function(err, isMatch) {
        if (err) { return callback(err); }

        // Password did not match
        if (!isMatch) { return callback(null, false); }

        // Success
        return callback(null, user);
      });
    });
  }
));

passport.serializeUser(function(user, callback) {
  callback(null, user.username);
});

passport.deserializeUser(function(username, callback) {
  User.findOne({ username: username.toLowerCase() }, function (err, user) {
    if (err) { return callback(err); }
    callback(null, user);
  });
});

exports.isAuthenticated = passport.authenticate('local', { session : true });

exports.jwtLogin = function(req, res) {
  var user = req.user;

  var expires = moment().add(7,'days').valueOf();
  var token = jwt.encode({
    iss: user.username,
    exp: expires
  }, "BARCELONA");

  return res.json({
    "login": 1,
    "user_id": user._id,
    "role": user.role,
    "token" : token,
    "expires": expires
  });
};
