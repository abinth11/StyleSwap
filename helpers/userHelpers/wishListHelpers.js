import db from "../../config/db/mongodb.js"
import collection from "../../contants/collections.js"
import { ObjectId } from "mongodb"

export const wishListHelper = {
    addToWhishList:async(proId,userId) =>{
          try {            
              
            const productId = ObjectId(proId)
            const response = {}
            const wishList = await db.get().collection(collection.WISHLIST).findOne({ userId: userId })
            if (wishList) {
              const productIndex = wishList.products.findIndex((product) => product.equals(productId))
              if (productIndex > -1) {
                // product already exists, remove it
                wishList.products.splice(productIndex, 1)
                response.removed = true
              } else {
                // product does not exist, add it
                wishList.products.push(productId)
                response.updated = true
              }
              await db.get().collection(collection.WISHLIST).updateOne({ _id: wishList._id }, { $set: { products: wishList.products } })
            } else {
              const wishListSchema = {
                userId,
                products: [productId],
              }
              response.created = true
              await db.get().collection(collection.WISHLIST).insertOne(wishListSchema)
            }
            
            return response
          } catch (error) {
            return false
          }

    },
    getAllItemsInWishlist:async (userId) =>{
      try {
        const wishListItems = await db.get().collection(collection.WISHLIST).findOne({userId:userId})
        return wishListItems

      } catch(error) {
        throw new Error(error)
      }

    },
    getProductsDetailsOfWishList:async (userId) =>{
      try {
        const wishItems = await db.get().collection(collection.WISHLIST).aggregate([
          {
            $match:{
              userId:userId
            }
          },
          {
            $unwind:'$products'
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField:'products' ,
              foreignField: '_id',
              as: 'productDetails'
            }
          },
          {
            $project:{
              product: { $arrayElemAt: ["$productDetails", 0] },
            }
          },
          {
            $replaceRoot: { newRoot: "$product" }
          }
        ]).toArray()
        return wishItems
      } catch (error){
        throw new Error(error)
      }

    },
    getWishedCount: async (userId) => {
      try {
        const wished = await db
          .get()
          .collection(collection.WISHLIST)
          .findOne({ userId: userId})
           let count = 0
           wished
           ?count = wished.products?.length
           :count = 0
          
        return count
      } catch (error) {
        throw new Error("Failed to get wishlist products count.")
      }
    },
    removeProducts: async (productId,userId) => {
      try {
       const response = await db
          .get()
          .collection(collection.WISHLIST)
          .updateOne(
            { userId:userId },
            { $pull: { products: ObjectId(productId) } }
          )
        return response
      } catch (error) {
       throw new Error(error)
      }
    },

}