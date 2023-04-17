import { validationResult } from "express-validator"
import { profileHelpers } from "../../helpers/userHelpers/profileHelpers.js"
import { orderHelpers } from "../../helpers/adminHelpers/orderHelpers.js"
import { uploadStream } from "../../config/cloudinary.js"
import { Readable } from 'stream'
import fs from 'fs'
import os from 'os'
import path from 'path'
export const profileControlers = {
  editUserProfile: async (req, res) => {
    try {
      const id = req.session?.user._id
      const userDetails = await profileHelpers.getLoginedUser(id)
      const address = await profileHelpers.getUserAddress(id)
      res.render("users/edit-profile", {
        userDetails,
        user: req.session.user,
        address,
      })
    } catch (error) {
      res.render("users/edit-profile", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  editUserProfilePost: (req, res) => {
    try {
      const { userId } = req.params
      profileHelpers.editProfile(userId, req.body).then(() => {
        res.redirect("/edit-profile")
      })
    } catch (error) {
      res.render("users-", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  addAddressPost: (req, res) => {
    try {
      const userId = req.session.user?._id
      const { addressFromCheckOut } = req.body
      req.body.userId = userId
      profileHelpers.addNewAddress(req.body).then(() => {
        const jsonResponse = addressFromCheckOut
          ? { addressFromCheckOut: true }
          : { addressFromProfile: true }
        res.json(jsonResponse)
      })
    } catch (error) {
      res
        .status(500)
        .json({ error: true, message: "Error occurred while adding address" })
    }
  },
  editAddressGet: async (req, res) => {
    try {
      const { from } = req.query
      const currentAddress = await profileHelpers.getCurrentAddress(
        req.query.id
      )
      res.render("users/user-profile/edit-address", { currentAddress, from })
    } catch (error) {
      res.render("users/user-profile/edit-address", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  editAddressPost: (req, res) => {
    try {
      const { from } = req.query
      profileHelpers.editAddress(req.query.addressId, req.body).then(() => {
        req.session.updatedAddr = "Successfully updated address"
        from === "profile"
          ? res.redirect("/profile-address")
          : res.redirect("/proceed-to-checkout")
      })
    } catch (error) {
      res.render("users/user-profile/edit-address", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  deleteAddress: (req, res) => {
    const { addressId, from } = req.body
    try {
      profileHelpers.addressDelete(addressId).then(() => {
        from === "profile"
          ? res.redirect("/profile-address")
          : res.redirect("/proceed-to-checkout")
      })
    } catch (error) {
      res.render("users/user-profile/edit-address", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  userProfileDash: async (req, res) => {
    try {
      const userId = req.session.user._id
      const userDetails = await profileHelpers.getLoginedUser(userId)
      console.log(userDetails)
      res.render("users/user-profile/user-dashboard", {
        user: req.session.user,
        userDetails,
      })
    } catch (error) {
      res.render("users/user-profile/user-dashboard", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  userProfileOrders: async (req, res) => {
    try {
      const odr = await orderHelpers.getOrdersProfile(req.session.user._id)
      const orders = orderHelpers.ISO_to_Normal_Date(odr)
      res.render("users/user-profile/user-orders", { orders })
    } catch (error) {
      res.render("users/user-profile/user-orders", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  userProfileTrackOrders: (req, res) => {
    try {
      res.render("users/user-profile/user-track-orders")
    } catch (error) {
      res.render("users/user-profile/user-track-orders", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  userProfileAddress: async (req, res) => {
    try {
      const address = await profileHelpers.getUserAddress(req.session.user._id)
      const updateMsg = req.session.updatedAddr
      res.render("users/user-profile/user-address", { address, updateMsg })
      req.session.updatedAddr = null
    } catch (error) {
      res.render("users/user-profile/user-address", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  userAccountDetails: async (req, res) => {
    try {
      const userDetails = await profileHelpers.getUserDetails(
        req.session.user._id
      )
      // let profile_update_status= req.session.profile_update_status
      res.render("users/user-profile/user-account", { userDetails })
      // req.session.profile_update_status=null;
    } catch (error) {
      res.render("users/user-profile/user-account", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  updateProfile: (req, res) => {
    try {
      // let sessionUserId=req.session.user._id;
      profileHelpers.updateUserDetails(req.body).then(() => {
        res.redirect("/profile-account-detail")
      })
      // req.session.profile_update_status=response;
    } catch (error) {
      res.render("users/user-profile/user-account", {
        warningMessage: "Internal Server Error Please try again later...",
      })
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
      res.render("users/user-profile/user-change-password", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  changePasswordPost: async (req, res) => {
    try {
      const errors = validationResult(req)
      req.session.updatePasswd_err = errors.errors
      if (req.session.updatePasswd_err.length === 0) {
        const response = await profileHelpers.changeUserPassword(
          req.params.id,
          req.body
        )
        req.session.password_change_stat = response
        res.redirect("/profile-change-password")
      } else {
        res.redirect("/profile-change-password")
      }
    } catch (error) {
      res.render("users/user-profile/user-change-password", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    } 
  }, 
  uploadProfilePhoto: async (req, res) => {
    try {
      const imageBase64 = req.body.image
      const buffer = Buffer.from(imageBase64, "base64")
      const tempFilePath = path.join(os.tmpdir(), "temp_image.jpg")
      fs.writeFileSync(tempFilePath, buffer)
      const url = await uploadStream(tempFilePath)
      const userId = req.session.user._id
       if(url){
        profileHelpers.uploadProfilePhoto(url,userId).then((response)=>{
          response.acknowledged
          ?res.status(200).json({Message:"Successfully uploaded profile photo"})
          :res.status(403).json({Message:"Error while uploading profile photo"})
        })
       }else {
        res.status(402).json({"Message":"Something went wrong while uploading profile photo"})
       }  
      fs.unlinkSync(tempFilePath)
    } catch (err) {
      res.status(500).json({"Message":"Something went wrong while uploading profile photo"})
    }
  }
   
}
