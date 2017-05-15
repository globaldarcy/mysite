var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var ceLogin = require('connect-ensure-login');

var db = require('./routes');
// var index = require('./routes/index');
// var users = require('./routes/users');
passport.use(new Strategy(
  function (username, password, cb) {
    db.users.findByUsername(username, function (err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false);
      }
      if (user.password !== password) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  }));

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: false}));

app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/', function (req, res) {
  res.render('home', {user: req.user});
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), function (req, res) {
  res.redirect('/');
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/profile', ceLogin.ensureLoggedIn(), function (req, res) {
  res.render('profile', {user: req.user});
});

// app.use('/', index);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
