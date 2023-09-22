import db from "../../config/db/mongodb.js"
import collection from "../../contants/collections.js"
import { ObjectId as objectId } from "mongodb"
export const adminuserHelpers = {
    viewAllUser: async () => {
        try {
          const users = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .find()
            .toArray()
          return users
        } catch (error) {
          throw new Error(error)
        }
      },
      blockUnblockUsers: async (userInfo) => {
        // eslint-disable-next-line prefer-const
        const {userId} = userInfo
        let { currentStat } = userInfo
        try {
          if (currentStat === "false") {
            currentStat = true
          } else {
            currentStat = false
          }
          await db
            .get()
            .collection(collection.USER_COLLECTION)
            .updateOne(
              { _id: objectId(userId) },
              { $set: { active: currentStat } }
            )
          return currentStat
        } catch (error) {
          throw new Error(error)
        }
      },
      blockedUsers: async () => {
        try {
          const blockedUsers = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .find({ active: false })
            .toArray()
          return blockedUsers
        } catch (error) {
          throw new Error(error)
        }
      },
      getUserReviews: async () => {
        try {
          const reviews = await db
            .get()
            .collection(collection.PRODUCT_RATING)
            .aggregate([
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  foreignField: "_id",
                  localField: "productId",
                  as: "productDetails",
                },
              },
              {
                $addFields: {
                  product: { $arrayElemAt: ["$productDetails", 0] },
                },
              },
              {
                $project: {
                  productDetails: 0,
                },
              },
            ])
            .toArray()
          return reviews
        } catch (error) {
          throw new Error(error)
        }
      },
}