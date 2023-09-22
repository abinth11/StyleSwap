import userRouter from "./users.js"
import adminRouter from "./admin.js"

const routes = (app) => {

  app.use("/", userRouter)
  app.use("/admin", adminRouter)

}

export default routes
