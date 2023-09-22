import express from "express"
import http from 'http'
import EventEmitter from "events"
import mongodb from "./config/db/mongodb.js"
import nocache from "nocache"
import dotenv from "dotenv"
import { MulterError } from "multer"
import CustomError from "./middlewares/errorHandler.js"
import { schedule } from "node-cron"
import redis from "./config/db/redis.js"
import otherHelpers from "./helpers/otherHelpers.js"
import passport from "passport"
import { offerHelpers } from "./helpers/adminHelpers/offerHelpers.js"
import routes from "./routes/index.js"
import serverConfig from "./config/server.js"
import expressConfig from "./config/express.js"
const app = express()
const server = http.createServer(app)

dotenv.config()
EventEmitter.defaultMaxListeners = 20

//* configurations for express
expressConfig(app)

app.use(nocache())
app.use(passport.initialize())
app.use(passport.session())

//* application routes
routes(app)

mongodb.connect()
  .then(() => {
    console.log("Successfully connected to the database")
    // otherHelpers.createIndexForProducts()
  })
  .catch((err) => {
    console.log("Connection failed", err)
  })
  
redis.connect()
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

serverConfig(server).startServer()
