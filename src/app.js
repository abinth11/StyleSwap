import express from 'express'
import EventEmitter from 'events'
import pkg from 'body-parser'
import { join, dirname } from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import { connect } from '../config/connection.js'
import { engine } from 'express-handlebars'
import { helpers } from '../middlewares/handlebarHelpers.js'
import session from 'express-session'
import nocache from 'nocache'
import dotenv from 'dotenv'   
import usersRouter from '../routes/users.js'
import adminRouter from '../routes/admin.js'
import { MulterError } from 'multer'
import CustomError from '../middlewares/errorHandler.js'
import { schedule } from 'node-cron'
import adminHelpers from '../helpers/admin-helpers.js'
import { fileURLToPath } from 'url'
import userHelpers from '../helpers/user-helpers.js'

const { json, urlencoded } = pkg
const serveStatic = express.static
const app = express()
dotenv.config()
EventEmitter.defaultMaxListeners = 20

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// view engine setup
app.set('views', join(__dirname, '../views'))
app.set('view engine', 'hbs')
app.engine(
  'hbs',
  engine({
    extname: 'hbs',
    helpers:helpers,
    defaultLayout: 'layout',
    layoutsDir: join(__dirname, '../views/', 'layout'),
    partialsDir: join(__dirname, '../views/', 'partials'),
  })
)

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
    userHelpers.createIndexForAlgolia()
  })
  .catch((err) => {
    console.log('Connection failed', err)
  })
//? cron library to run the offer query every day
schedule('0 0 * * *', () => {
  adminHelpers.checkOfferExpiration()
  // userHelpers.resetCouponCount()
})
// catch 404 and forward to error handler
app.use(function (req, res) {
  res.render('users/page-404')
  // next(createError(404))
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
