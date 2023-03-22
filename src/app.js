import express from 'express';
import EventEmitter from 'events';
import  pkg from 'body-parser'
const { json, urlencoded } = pkg
const serveStatic = express.static;
import { join, dirname } from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
// import  connect  from '../config/connection.js'
import { connect } from '../config/connection.js'
import { engine } from 'express-handlebars'
// import handlebar from 'handlebars'
// import handlebars from 'handlebars/lib/handlebars/runtime.js';
// const { registerHelper } = handlebars
import handlebars from 'handlebars';

handlebars.registerHelper('inc', function (value, options) {
  return parseInt(value) + 1;
});

// Register other helpers...
import session from 'express-session'
import nocache from 'nocache'
import dotenv from 'dotenv';   
dotenv.config();
import usersRouter from '../routes/users.js'
import adminRouter from '../routes/admin.js'
const app = express()
import { MulterError } from 'multer'
import CustomError from '../middlewares/errorHandler.js'
import { schedule } from 'node-cron'
import  adminHelpers  from '../helpers/admin-helpers.js'
import { fileURLToPath } from 'url';

EventEmitter.defaultMaxListeners = 20;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// view engine setup
app.set('views', join(__dirname, '../views'));
app.set('view engine', 'hbs');

app.engine(
  'hbs',
  engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: join(__dirname, '../views/', 'layout'),
    partialsDir: join(__dirname, '../views/', 'partials'),
  })
);


app.use(logger('dev')) 
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())
app.use(serveStatic(join(__dirname, '../public/')))
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

connect()
  .then(() => {
    console.log('Successfully connected to the database')
  })
  .catch((err) => {
    console.log('Connection failed', err)
  })

handlebars.registerHelper('inc', function (value, options) {
  return parseInt(value) + 1
})

handlebars.registerHelper('eq', function (a, b) {
  return a === b
})

handlebars.registerHelper('or', function (a, b, options) {
  if (a || b) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

handlebars.registerHelper('multiply', function (a, b) {
  return a * b
})

handlebars.registerHelper('-', function (a, b) {
  return a - b
})

handlebars.registerHelper('notNull', function (value, options) {
  if (value !== null) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})
handlebars.registerHelper('JSONstringify', (obj) => {
  return JSON.stringify(obj);
});


// cron library to run the offer query every day
schedule('0 0 * * *', () => {
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
  } else if (err instanceof MulterError) {
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

export default app
