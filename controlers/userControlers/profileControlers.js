import userHelpers from "../../helpers/user-helpers.js"
import { validationResult } from "express-validator"
import adminHelpers from "../../helpers/admin-helpers.js"
export const profileControlers = {
    editUserProfile: async (req, res) => {
        try {
          const id = req.session?.user._id
          const userDetails = await userHelpers.getLoginedUser(id)
          const address = await userHelpers.getUserAddress(id)
          res.render("users/edit-profile", {
            userDetails,
            user: req.session.user,
            address,
          })
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      editUserProfilePost: (req, res) => {
        try {
          const { userId } = req.params
          userHelpers.editProfile(userId, req.body).then(() => {
            res.redirect("/")
          })
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      addAddressPost: (req, res) => {
        try {
          const userId = req.session.user?._id
          const { addressFromCheckOut } = req.body
          req.body.userId = userId
          userHelpers.addNewAddress(req.body).then(() => {
            const jsonResponse = addressFromCheckOut
              ? { addressFromCheckOut: true }
              : { addressFromProfile: true }
            res.json(jsonResponse)
          })
        } catch (error) {
          console.log(error)
          res
            .status(500)
            .json({ error: true, message: "Error occurred while adding address" })
        }
      },
      editAddressGet: async (req, res) => {
        try {
          const { from } = req.query
          const currentAddress = await userHelpers.getCurrentAddress(req.query.id)
          res.render("users/user-profile/edit-address", { currentAddress, from })
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      editAddressPost: (req, res) => {
        try {
          const { from } = req.query
          userHelpers.editAddress(req.query.addressId, req.body).then(() => {
            req.session.updatedAddr = "Successfully updated address"
            from === "profile"
              ? res.redirect("/profile-address")
              : res.redirect("/proceed-to-checkout")
          })
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      deleteAddress: (req, res) => {
        const { addressId, from } = req.body
        try {
          userHelpers.addressDelete(addressId).then(() => {
            from === "profile"
              ? res.redirect("/profile-address")
              : res.redirect("/proceed-to-checkout")
          })
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      userProfileDash: (req, res) => {
        try {
          res.render("users/user-profile/user-dashboard", {
            user: req.session.user,
          })
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      userProfileOrders: async (req, res) => {
        try {
          const odr = await userHelpers.getOrdersProfile(req.session.user._id)
          const orders = adminHelpers.ISO_to_Normal_Date(odr)
          res.render("users/user-profile/user-orders", { orders })
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      userProfileTrackOrders: (req, res) => {
        try {
          res.render("users/user-profile/user-track-orders")
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      userProfileAddress: async (req, res) => {
        try {
          const address = await userHelpers.getUserAddress(req.session.user._id)
          const updateMsg = req.session.updatedAddr
          res.render("users/user-profile/user-address", { address, updateMsg })
          req.session.updatedAddr = null
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      userAccountDetails: async (req, res) => {
        try {
          const userDetails = await userHelpers.getUserDetails(
            req.session.user._id
          )
          // let profile_update_status= req.session.profile_update_status
          res.render("users/user-profile/user-account", { userDetails })
          // req.session.profile_update_status=null;
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      updateProfile: (req, res) => {
        try {
          // let sessionUserId=req.session.user._id;
          userHelpers.updateUserDetails(req.body).then(() => {
            res.redirect("/profile-account-detail")
          })
          // req.session.profile_update_status=response;
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      changePassword: (req, res) => {
        try {
          const passwordChangeStat = req.session.password_change_stat
          const updatePasswdErr = req.session.updatePasswd_err
          const user = req.session.user._id
          res.render("users/user-profile/user-change-password", {
            user,
            passwordChangeStat,
            updatePasswdErr,
          })
          req.session.password_change_stat = null
          req.session.updatePasswd_err = null
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      changePasswordPost: async (req, res) => {
        try {
          const errors = validationResult(req)
          req.session.updatePasswd_err = errors.errors
          if (req.session.updatePasswd_err.length === 0) {
            const response = await userHelpers.changeUserPassword(
              req.params.id,
              req.body
            )
            req.session.password_change_stat = response
            res.redirect("/profile-change-password")
          } else {
            res.redirect("/profile-change-password")
          }
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
}