let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let db = require('./config/connection')
let hbs = require('express-handlebars')
let Handlebars = require('handlebars')
let fileUpload = require('express-fileupload')
let session = require('express-session');
let nocache = require('nocache');
require('dotenv').config();

let usersRouter = require('./routes/users');
let adminRouter = require('./routes/admin');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/'
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
  secret: "eppudraa",
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}));
app.use(nocache());
app.use('/', usersRouter);
app.use('/admin', adminRouter);

db.connect((err) => {
  err ? console.log("Connection failed") : console.log("successfully connected to the database");
})

Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
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
