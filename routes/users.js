var express = require('express');
var passport = require('passport');
var ceLogin = require('connect-ensure-login');
var router = express.Router();

/* GET users listing. */
/*router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

// Define routes.
router.get('/', function (req, res) {
  res.render('home', {user: req.user});
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/users/login'}), function (req, res) {
  res.redirect('/users');
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/users');
});

router.get('/profile', ceLogin.ensureLoggedIn('/users/login'), function (req, res) {
  res.render('profile', {user: req.user});
});
router.use('/*', function (req, res) {
  res.redirect('/users/login');
});

module.exports = router;
