import db from "../../config/db/mongodb.js"
import collection from "../../contants/collections.js"
import { ObjectId } from "mongodb"
import bcrypt from "bcrypt"
export const profileHelpers = {
  getLoginedUser: async (userId) => {
    try {
      const user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) })
      return user
    } catch (error) {
      throw new Error("Failed to fetch logined user")
    }
  },
  editProfile: async (userId, userData) => {
    const { name, mobile, email } = userData
    try {
      const response = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              name,
              mobile,
              email,
            },
          }
        )
      return response
    } catch (error) {
      throw new Error("Failed to edit profile")
    }
  },
  addNewAddress: async (address) => {
    try {
      const data = db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .insertOne(address)
      return data
    } catch (error) {
      throw new Error("Failed to add address")
    }
  },
  getUserAddress: async (userId) => {
    try {
      const addresses = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .find({ userId })
        .toArray()
      return addresses
    } catch (error) {
      throw new Error("Failed to fetch address")
    }
  },
  getCurrentAddress: async (addressId) => {
    try {
      const address = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .findOne({ _id: ObjectId(addressId) })
      return address
    } catch (error) {
      throw new Error("Failed to fetch current address")
    }
  },
  addressDelete: (addressId) => {
    try {
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .deleteOne({ _id: ObjectId(addressId) })
      return
    } catch (error) {
      throw new Error("Failed to delete address")
    }
  },
  editAddress: async (addressId, addressInfo) => {
    try {
      const {
        name,
        mobile,
        pincode,
        locality,
        address,
        city,
        state,
        landmark,
        alternatePhone,
      } = addressInfo
      const response = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .updateOne(
          { _id: ObjectId(addressId) },
          {
            $set: {
              name,
              mobile,
              pincode,
              locality,
              address,
              city,
              state,
              landmark,
              alternatePhone,
            },
          }
        )
      return response
    } catch (error) {
      throw new Error("Failed to edit address.")
    }
  },
  getUserDetails: async (userId) => {
    try {
      const userInfo = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) })
      return userInfo
    } catch (error) {
      throw new Error("Failed to fetch user details")
    }
  },
  updateUserDetails: (userInfo) => {
    try {
      const { userId, fname, email, mobile } = userInfo
      return new Promise((resolve) => {
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(userId) },
            {
              $set: {
                name: fname,
                email,
                mobile,
              },
            }
          )
          .then((response) => {
            resolve(response)
          })
      })
    } catch (error) {
      throw new Error("Failed to update user details")
    }
  },
  changeUserPassword: async (userId, { password, npassword, cpassword }) => {
    try {
      const user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) })
      const hashedNewPassword = await bcrypt.hash(npassword, 10)
      if (!user) {
        return { passwordNotUpdated: true }
      }
      const isCurrentPasswordValid = await bcrypt.compare(
        password,
        user.password
      )
      if (!isCurrentPasswordValid) {
        return { invalidCurrentPassword: true }
      }
      if (npassword !== cpassword) {
        return { passwordMismatchnewAndConfirm: true }
      }
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: { password: hashedNewPassword },
          }
        )
      return { success: true }
    } catch (error) {
      return { error: true }
    }
  },
  getAllAddresses: async (userId) => {
    try {
      const addresses = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .find({ userId })
        .toArray()
      return addresses
    } catch (error) {
      throw new Error("Failed to fetch all address of the user")
    }
  },
  uploadProfilePhoto:async(photo,userId)=>{
    try {
  const result = await db.get().collection(collection.USER_COLLECTION).updateOne(
    {_id:ObjectId(userId)},
    {
      $set :{
        image:photo
      }
    },
    {upsert:true}
  )
  return result
    } catch (error){
      throw new Error("Failed to upload profile phot")
    }
  },
  getOrdersProfile: async (orderId) => {
    try {
      const orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: ObjectId(orderId) })
        .toArray()
      return orders
    } catch (error) {
      throw new Error(error)
    }
  },
}
