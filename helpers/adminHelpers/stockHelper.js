import db from "../../config/database.js"
import collection from "../../contants/collections.js"
import { ObjectId as objectId } from "mongodb"
export const stockHelper = {
    getAllProductsAndOutofStock:async () => {
        try {
          const products = await db.get().collection(collection.PRODUCT_COLLECTION)
          .find().sort({product_quantity:1}).toArray()
          return products
        } catch (error) {
          throw new Error(error)
        }
      },
      updateProductStock:async(productId,updateQuantity) => {
        try {
          let quantity = updateQuantity
          quantity = parseInt(quantity)
          const response = await db.get().collection(collection.PRODUCT_COLLECTION)
          .findOneAndUpdate({ _id: objectId(productId) }, { $inc: { product_quantity: quantity } })
          return response.value.product_quantity
        } catch (error) {
          throw new Error(error)
        }
      },
}