import collection from "../../contants/collections.js"
import db from "../../config/db/mongodb.js"

export const loginHelpers = {
    adminLogin: async (adminInfo) => {
        try {
          const response = {}
          const admin = await db
            .get()
            .collection(collection.ADMIN_COLLECTION)
            .findOne({ email: adminInfo.email })
          if (admin) {
            if (adminInfo.password === admin.password) {
              response.admin = admin
              response.status = true
              return response
            } else {
              return { status: false }
            }
          } else {
            return { notExist: true }
          }
        } catch (error) {
          throw new Error("Login failed")
        }
      },

}