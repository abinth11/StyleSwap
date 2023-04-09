import { adminuserHelpers } from "../../helpers/adminHelpers/adminUserHelpers.js"
export const adminUserControlers = {
    viewUsers: (req, res) => {
        adminuserHelpers.viewAllUser().then((users) => {
          res.render("admin/view-users", { users })
        })
      },
      blockAndUnblockUsers: (req, res) => {
        adminuserHelpers.blockUnblockUsers(req.body).then((userStat) => {
          res.json(userStat)
        })
      },
      getBlockedUsers: (req, res) => {
        adminuserHelpers.blockedUsers().then((blockeduser) => {
          res.render("admin/blocked-users", { blockeduser })
        })
      },
      getUserReviews: async (req, res) => {
        try {
          const userReviews = await adminuserHelpers.getUserReviews()
          const reviews = userReviews?.reverse()
          res.render("admin/product-review", { reviews })
        } catch (error) {
          res.status(500).json({ Message: "Internal Server Error" })
        }
      },

}