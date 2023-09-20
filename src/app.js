import express from "express"
import EventEmitter from "events"
import pkg from "body-parser"
import { join, dirname } from "path"
import cookieParser from "cookie-parser"
import logger from "morgan"
import { connect } from "../config/database.js"
import { engine } from "express-handlebars"
import { helpers } from "../middlewares/handlebarHelpers.js"
import session from "express-session"
import nocache from "nocache"
import dotenv from "dotenv"
import usersRouter from "../routes/users.js"
import adminRouter from "../routes/admin.js"
import { MulterError } from "multer"
import CustomError from "../middlewares/errorHandler.js"
import { schedule } from "node-cron"
import { fileURLToPath } from "url"
import {redisConnect} from "../config/redisCache.js"
import otherHelpers from "../helpers/otherHelpers.js"
import passport from "passport"
import { offerHelpers } from "../helpers/adminHelpers/offerHelpers.js"
import cors from 'cors'
import routes from "../routes/index.js"
const { json, urlencoded } = pkg
const serveStatic = express.static
const app = express()

dotenv.config()
EventEmitter.defaultMaxListeners = 20

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// view engine setup
app.set("views", join(__dirname, "../views"))
app.set("view engine", "hbs")
app.engine(
  "hbs",
  engine({
    extname: "hbs",
    helpers: helpers,
    defaultLayout: "layout",
    layoutsDir: join(__dirname, "../views/", "layout"),
    partialsDir: join(__dirname, "../views/", "partials"),
  })
)

app.use(logger("dev"))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())
app.use(serveStatic(join(__dirname, "../public/")))
app.use(cors())
const oneDay = 1000 * 60 * 60 * 24
app.use(
  session({
    secret: "eppudraa",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
)
app.use(nocache())
app.use(passport.initialize())
app.use(passport.session())

routes(app)

connect()
  .then(() => {
    console.log("Successfully connected to the database")
    // otherHelpers.createIndexForProducts()
  })
  .catch((err) => {
    console.log("Connection failed", err)
  })
  
redisConnect()
   .then(()=> {
    console.log("Successfull connected to redis")
   })
   .catch((err) => {
    console.log("Error while connecting to redis", err)
   })
//? cron library to run queries on 12am
schedule("0 0 * * *", () => {

  //* For deleting the expired offers
  offerHelpers.checkOfferExpiration()

  //todo uncomment when after commenting the function from user home..
  // userHelpers.resetCouponCount()

  //*indexing the data in the product collection for better search perfomance

  otherHelpers.createIndexForProducts()

  //* function to index the products from database for searching
  // createIndexForAlgolia()
})
// catch 404 and forward to error handler
app.use(function (req, res) {
  res.render("users/page-404")
  // next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}
  // determine error status and message
  let status, message
  if (err instanceof CustomError) {
    status = err.status
    message = err.message
  } else if (err instanceof MulterError) {
    status = 400
    message = "File upload error: " + err.message
  } else {
    status = err.status || 500
    message = err.message || "Internal Server Error"
  }
  // send error response
  res.status(status).json({
    error: {
      message,
      code: err.code, // include any custom error codes you may have defined
      stack: err.stack, // include stack trace of the error
    },
  })
})

export default app
