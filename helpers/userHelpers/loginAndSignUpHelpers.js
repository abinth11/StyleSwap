import db from "../../config/connection.js"
import collection from "../../config/collections.js"
import bcrypt from "bcrypt"
export const loginAndSignUpHelpers = {
    regisUserUser: async (userData) => {
        const { password, email, mobile } = userData
        userData.active = true
        try {
          userData.password = await bcrypt.hash(password, 10)
          const checkedEmail = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ email })
          const phoneNumber = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ mobile })
          if (checkedEmail) {
            return checkedEmail
          } else if (phoneNumber) {
            return phoneNumber
          } else {
            const result = await db
              .get()
              .collection(collection.USER_COLLECTION)
              .insertOne(userData)
            return { status: true, userData: result.insertedId }
          }
        } catch (error) {
          console.log(error)
          return error
        }
      },
      loginUser: async (userData) => {
        const { password, mobile } = userData
        try {
          const response = {}
          const user = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ mobile })
          if (!user?.active) {
            response.block = true
            return response
          }
          if (user) {
            const status = await bcrypt.compare(password, user.password)
            if (status) {
              response.user = user
              response.status = true
              return response
            } else {
              return { incorrectPassword: "Wrong password" }
            }
          } else {
            return { loginError: false }
          }
        } catch (error) {
          console.log(error)
        }
      },
      loginWthOTP: async (userData) => {
        try {
          const { mobile } = userData
          const user = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ mobile })
          if (!user.active) {
            return { block: true }
          }
          if (user) {
            const response = {
              user,
              status: true,
            }
            return response
          }
          return { loginError: false }
        } catch (error) {
          console.log(error)
        }
      },
}