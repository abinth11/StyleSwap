import express from "express"
import { join, dirname } from "path"
import logger from "morgan"
import { engine } from "express-handlebars"
import { helpers } from "../middlewares/handlebarHelpers.js"
import session from "express-session"
import { fileURLToPath } from "url"
import cors from "cors"
import mongoSanitize from "express-mongo-sanitize"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import ENV_VARS from "../envConfig.js"
const serveStatic = express.static

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // maximum requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  keyGenerator: (req) => {
    const xRealIp = req.headers["x-real-ip"]
    return xRealIp ? String(xRealIp) : req.ip
  },
})

const expressConfig = (app) => {
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
  if (ENV_VARS.NODE_ENV === "development") {
    app.use(logger("dev"))
  }
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
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

  app.use(helmet())
  app.use(mongoSanitize())
  app.use(limiter)
}

export default expressConfig
