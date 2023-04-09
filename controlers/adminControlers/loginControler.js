import { loginHelpers } from "../../helpers/adminHelpers/loginHelper.js"
export const loginControler = {
    adminLoginGet: (req, res) => {
        const { admin, loginError } = req.session
        if (admin) {
          return res.redirect("/admin/dashboard")
        }
        res.render("admin/loginAdmin", { loginErr: loginError })
        req.session.loginError = null
      },
      adminLoginPost: async (req, res) => {
        try {
          const response = await loginHelpers.adminLogin(req.body)
          if (response.status) {
            req.session.adminLoggedIn = true
            req.session.admin = response.admin
            res.json({ status: true })
          } else if (response.notExist) {
            req.session.loginError = "Invalid email address..."
            res.json({ status: false })
          } else {
            req.session.loginError = "Incorrect password "
            res.json({ status: false })
          }
        } catch (error) {
          res.status(500).json({ error: "Server Error" })
        }
      },
      logoutAdmin: (req, res) => {
        req.session.admin = null
        res.redirect("/admin")
      },
}