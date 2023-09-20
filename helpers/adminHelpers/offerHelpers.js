import db from "../../config/database.js"
import collection from "../../contants/collections.js"
import { ObjectId as objectId } from "mongodb"
import moment from "moment"
export const offerHelpers = {
    addOffer: async (offerInfo) => {
        try {
          const offerExists = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .aggregate([
              {
                $match: {
                  offerEndDate: { $exists: true },
                  product_category: offerInfo.category,
                },
              },
              {
                $project: {
                  _id: 1,
                  product_price: 1,
                  offerPrice: 1,
                  offerEndDate: 1,
                  offerStartDate: 1,
                  product_category: 1,
                  offerPercentage: {
                    $multiply: [
                      { $subtract: ["$product_price", "$offerPrice"] },
                      100,
                      { $divide: [1, "$product_price"] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  product_price: 1,
                  offerPrice: 1,
                  offerEndDate: 1,
                  offerStartDate: 1,
                  product_category: 1,
                  offerPercentage: { $round: ["$offerPercentage", 2] },
                },
              },
            ])
            .toArray()
          if (offerExists.length) {
            return offerExists
          }
          const response = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateMany({ product_category: offerInfo.category }, [
              {
                $addFields: {
                  offerPrice: {
                    $subtract: [
                      "$product_price",
                      {
                        $multiply: [
                          "$product_price",
                          offerInfo.offer_percentage / 100,
                        ],
                      },
                    ],
                  },
                  offerPercentage: parseFloat(offerInfo.offer_percentage),
                },
              },
              {
                $set: {
                  offerPrice: "$offerPrice",
                  offerEndDate: offerInfo.end_date,
                  offerStartDate: offerInfo.start_date,
                },
              },
            ])
          return response
        } catch (err) {
          throw new Error ("Unable to add offer")
        }
      },
      replaceOfers: (replaceInfo) => {
        try {
          const offerPercentage = parseInt(replaceInfo.offer_percentage)
          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateMany({ product_category: replaceInfo.category }, [
              {
                $addFields: {
                  offerPrice: {
                    $subtract: [
                      "$product_price",
                      { $multiply: ["$product_price", offerPercentage / 100] },
                    ],
                  },
                  offerPercentage: parseFloat(replaceInfo.offer_percentage),
                },
              },
              {
                $set: {
                  offerPrice: "$offerPrice",
                  offerEndDate: replaceInfo.end_date,
                  offerStartDate: replaceInfo.start_date,
                },
              },
            ])
        } catch (error) {
          throw new Error(error)
        }
      },
      checkOfferExpiration: () => {
        try {
          // Calculate the date when the offer ends
          const offerEndDate = moment().subtract(1, "days").toDate()
          // Convert offerEndDate to a string in the format 'YYYY-MM-DD'
          const isoOfferEndDate = moment(offerEndDate).format("YYYY-MM-DD")
          // Update the documents whose offer_end_date is in the past
          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateMany(
              {
                offerEndDate: { $lt: isoOfferEndDate },
              },
              {
                $unset: { offerEndDate: 1 },
                $set: {
                  offerPrice: null,
                },
              }
            )
        } catch (error) {
          throw new Error(error)
        }
      },
      addOfferToProducts: async (offerInfo) => {
        try {
          const productPrice = parseInt(offerInfo.product_price)
          const offerPercentage = parseInt(offerInfo.offer_percentage)
          const result = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              { _id: objectId(offerInfo.productId) },
              {
                $set: {
                  offerPrice: productPrice - productPrice * (offerPercentage / 100),
                  offerEndDate: offerInfo.end_date,
                },
              }
            )
          return result
        } catch (error) {
          throw new Error(error)
        }
      },
    
}