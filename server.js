//Filename: express_bootstrap.js
var express = require('express'),
  DowJonesStrategy = require('passport-dowjones'),
  passport = require('passport'),
  uuid = require('uuid'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  exphbs  = require('express-handlebars'),
  app = express();

//NPM Module to integrate Handlerbars UI template engine with Express

//Declaring Express to use Handlerbars template engine with main.handlebars as
//the default layout
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Defining middleware to serve static files
app.use('/static', express.static('public'));

///////////////////////
// The following
app.use(cookieParser());
app.use(session({
  genid: function(req) {
    return uuid() // use UUIDs for session IDs
  },
  secret: 'cookieSecret'
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
//
///////////////////////


// Setup of connection parameters from DowJones
var connectionParameters = {
  clientID: '08vQuQyNrLR7ypS4irMbiE33LPLev37V',
  clientSecret: 'gz7ROgaztVbjqQJeelCTcy4xC2dRGvfAam0BQUo1L6ZfXXfwzHKG5p454sje38_X',
  callbackURL: 'http://localhost:3000/callback',
  scope: 'openid given_name family_name'
};

var strategy= new DowJonesStrategy(
  connectionParameters,
  function(accessToken, refreshToken, extraParams, profile, done) {
    this.getDelegationToken(extraParams.id_token, 'venture_source', function(a,b) {
      session.id_token = extraParams.id_token;
      return done(null, profile);
    });
  });

passport.use(strategy);

app.get('/callback', passport.authenticate('dowjones', {}), function(req,res) {
  res.redirect('/');
});

app.get('/login', passport.authenticate('dowjones', {connection:'dj-piboauthv2'}), function(req,res) {
  if(!req.user) {
    throw new Error('user empty');
  }
  console.log('user:', req.user);

  res.redirect('/');
});

app.get('/logout', function(req,res) {
  req.logout();
  res.redirect('/');
});

app.get("/home", function(req, res){
  var body = {user: {loggedIn:req.isAuthenticated()}};
  res.render('home', body );
});

app.get("/", function(req, res) {
  res.redirect(302, '/home');
});

app.listen(3000, function(){
  console.log('Server up: http://localhost:3000');
});
