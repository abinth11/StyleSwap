import userHelpers from "./user-helpers.js"
import redisClient from "../config/redisCache.js"
import collection from "../config/collections.js"
import db from "../config/connection.js"
const otherHelpers = {
  getProductsWithRedis: async (searchTerm) => {
    try {
      const suggestionKey = 'suggest-key'
      const searchKey = searchTerm.toLowerCase()
      // Get search suggestions from Redis
      const suggestionResult = await redisClient.ZRANGEBYSCORE(suggestionKey, 0, 5,'WITHSCORES')
       console.log(suggestionResult)
      // Check Redis cache for search results
      const redisResult = await redisClient.GET(searchKey)
      if (redisResult) {
        console.log('Result from Redis cache')
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
  
      console.log(result)
  
      // If result found in MongoDB, store it in Redis cache for future use
      if (result.length) {
        console.log('Results found in MongoDB')
        redisClient.SETEX(searchKey, 3600, JSON.stringify(result))
        redisClient.ZINCRBY(suggestionKey, 1, searchKey)
      }
  
      console.log('Value successfully set in Redis.')
  
      return { products: result, suggestions: suggestionResult }
    } catch (error) {
      console.error('Error setting value in Redis:', error)
    }
  }
  
  ,
  // getProductsWithRedis: async (searchTerm) => {
  //   try {
  //     // redisClient.get(searchTerm, async (err, result) => {
  //     //   if (err) {
  //     //     console.log(err)
  //     //   }
  //     //   if (result != null) {
  //     //     console.log("result from redis cache")
  //     //     return JSON.parse(result)
  //     //   } else {
  //     //     // If result not found in Redis cache, query MongoDB
  //     //     const result = await db
  //     //       .get()
  //     //       .collection(collection.PRODUCT_COLLECTION)
  //     //       .find(
  //     //         { $text: { $search: searchTerm } },
  //     //         { score: { $meta: "textScore" } }
  //     //       )
  //     //       .sort({ score: { $meta: "textScore" } })
  //     //       .toArray() // Add this to convert the MongoDB cursor to an array

  //     //     // If result found in MongoDB, store it in Redis cache for future use
  //     //     if (result.length) {
  //     //       console.log("Results found in MongoDB")
  //     //       redisClient.setEx(searchTerm, 3600, JSON.stringify(result))
  //     //     }
  //     //     console.log("Value successfully set in Redis.")

  //     //     return result
  //     //   }
  //     // })



  //     // Check Redis cache first
  //     const redisResut = await redisClient.get(searchTerm)
  //      if (redisResut!= null){
  //       console.log("Result from redis")
  //       return JSON.parse(redisResut)
  //      }

  //     // If result not found in Redis cache, query MongoDB
  //     const result = await db
  //       .get().collection(collection.PRODUCT_COLLECTION)
  //       .find(
  //         { $text: { $search: searchTerm } },
  //         { score: { $meta: "textScore" } }
  //       )
  //       .sort({ score: { $meta: "textScore" } })
  //       .toArray() // Add this to convert the MongoDB cursor to an array

  //     console.log(result)

  //     // If result found in MongoDB, store it in Redis cache for future use
  //     if (result.length) {
  //       console.log("Results found in MongoDB")
  //       redisClient.setEx(searchTerm, 3600, JSON.stringify(result))
  //     }
  //     console.log("Value successfully set in Redis.")

  //     return result
  //   } catch (error) {
  //     console.error("Error setting value in Redis:", error)
  //   }
  // },
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
        return await userHelpers.createCouponForUsers(userId)
      } else {
        return false
      }
    } catch (error) {
      console.log(error)
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
      (err, result) => {
        if (err) {
          console.log(err)
          throw new Error("Error creating index")
        }
        console.log(result)
      }
    )
  },
}

export default otherHelpers
