import redisClient from "../config/db/redis.js"
import collection from "../contants/collections.js"
import db from "../config/db/mongodb.js"
import { couponHelpers } from "./userHelpers/couponHelperes.js"
const otherHelpers = {
  getProductsWithRedis: async (searchTerm) => {
    try {
      const suggestionKey = 'suggest-key'
      const searchKey = searchTerm.toLowerCase()
      const suggestionResult = await redisClient.ZRANGEBYSCORE(suggestionKey, 0, 5,'WITHSCORES')
      const redisResult = await redisClient.GET(searchKey)
      if (redisResult) {
        redisClient.ZINCRBY(suggestionKey, 1, searchKey)
        return { products: JSON.parse(redisResult), suggestions: suggestionResult }
      }
  
      // If result not found in Redis cache, query MongoDB
      const result = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find(
          { $text: { $search: searchKey } },
          { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .toArray()
    
      // If result found in MongoDB, store it in Redis cache for future use
      if (result.length) {
        redisClient.SETEX(searchKey, 3600, JSON.stringify(result))
        redisClient.ZINCRBY(suggestionKey, 1, searchKey)
      }
    
      return { products: result, suggestions: suggestionResult }
    } catch (error) {
      throw new Error(error)
    }
  },
  currencyFormatter: (price) => {
    const amount = price
    const formattedAmount = amount
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, "$&,")
    return formattedAmount
  },
  checkProbabilityForCoupon: async (probability, userId) => {
    try {
      const result = Math.random()
      if (result < probability) {
        return await couponHelpers.createCouponForUsers(userId)
      } else {
        return false
      }
    } catch (error) {
      throw new Error(error)
    }
  },
  createIndexForProducts: () => {
    const productCollection = db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
    // Create index for product_title field
    productCollection.createIndex(
      {
        product_title: "text",
        product_description: "text",
        product_brand: "text",
        product_color: "text",
      },
      {
        weights: {
          product_title: 4,
          product_brand: 3,
          product_color: 2,
          product_description: 1,
        },
      },
      (err) => {
        if (err) {
          throw new Error("Error creating index")
        }
      }
    )
  },
}

export default otherHelpers
