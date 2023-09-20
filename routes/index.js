import userRouter from "./users"
import adminRouter from "./admin"

const routes = (app) => {

  app.use("/", userRouter)
  app.use("/admin", adminRouter)

}

export default routes
