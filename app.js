const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const db = require('./config/connection')
const hbs = require('express-handlebars')
const Handlebars = require('handlebars')
const session = require('express-session')
const nocache = require('nocache')
require('dotenv').config()
const usersRouter = require('./routes/users')
const adminRouter = require('./routes/admin')
const app = express()
const multer = require('multer')
const CustomError = require('./middlewares/errorHandler')
const cron = require('node-cron')
const adminHelpers = require('./helpers/admin-helpers')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views', 'layout'),
  partialsDir: path.join(__dirname, 'views', 'partials')
}))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
const oneDay = 1000 * 60 * 60 * 24
app.use(session({
  secret: 'eppudraa',
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}))
app.use(nocache())

app.use('/', usersRouter)
app.use('/admin', adminRouter)

db.connect()
  .then(() => {
    console.log('Successfully connected to the database')
  })
  .catch((err) => {
    console.log('Connection failed', err)
  })

Handlebars.registerHelper('inc', function (value, options) {
  return parseInt(value) + 1
})

Handlebars.registerHelper('eq', function (a, b) {
  return a === b
})

Handlebars.registerHelper('or', function (a, b, options) {
  if (a || b) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

Handlebars.registerHelper('multiply', function (a, b) {
  return a * b
})

Handlebars.registerHelper('-', function (a, b) {
  return a - b
})

Handlebars.registerHelper('notNull', function (value, options) {
  if (value !== null) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

// cron library to run the offer query every day
cron.schedule('0 0 * * *', () => {
  adminHelpers.checkOfferExpiration()
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.render('users/page-404')
  // next(createError(404));
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // determine error status and message
  let status, message
  if (err instanceof CustomError) {
    status = err.status
    message = err.message
  } else if (err instanceof multer.MulterError) {
    status = 400
    message = 'File upload error: ' + err.message
  } else {
    status = err.status || 500
    message = err.message || 'Internal Server Error'
  }

  // send error response
  res.status(status).json({
    error: {
      message,
      code: err.code, // include any custom error codes you may have defined
      stack: err.stack // include stack trace of the error
    }
  })
})

module.exports = app
