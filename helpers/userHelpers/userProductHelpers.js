import db from "../../config/connection.js"
import collection from "../../config/collections.js"
import { ObjectId } from "mongodb"
export const userProductHelpers = {

    viewProduct: async () => {
        try {
          const products = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .find()
            .toArray()
          return products
        } catch (error) {
          console.log(error)
          throw new Error("Failed to fetch products")
        }
      },
      findParent:async (parentId) => {
        try {
          const parent = await db.get().collection(collection.PRODUCT_TEMPLATE).findOne({_id:ObjectId(parentId)})
          return parent
    
        } catch (error) {
          console.log(error)
        }
    
      },
      viewCurrentProduct: async (productId) => {
        try {
          const product = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .aggregate([
              {
                $match: {
                  _id: ObjectId(productId),
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_RATING,
                  localField: "_id",
                  foreignField: "productId",
                  as: "ratings",
                },
              },
              {
                $project: {
                  _id: 1,
                  product_name: 1,
                  availabeColors: 1,
                  availabeSizes: 1,
                  regular_price: 1,
                  product_warranty: 1,
                  product_return: 1,
                  category: 1,
                  sub_category:1,
                  delivery: 1,
                  offerPrice: 1,
                  isActive: 1,
                  images: 1,
                  offerStartDate: 1,
                  offerPercentage: 1,
                  addedAt: 1,
                  ratings: 1,
                  productRating: {
                    $avg: "$ratings.rating",
                  },
                  ratingPercentages: {
                    $let: {
                      vars: {
                        totalRatings: {
                          $size: "$ratings",
                        },
                      },
                      in: {
                        one: {
                          $cond: [
                            { $eq: ["$$totalRatings", 0] },
                            0,
                            {
                              $multiply: [
                                {
                                  $divide: [
                                    {
                                      $size: {
                                        $filter: {
                                          input: "$ratings",
                                          cond: { $eq: ["$$this.rating", 1] },
                                        },
                                      },
                                    },
                                    "$$totalRatings",
                                  ],
                                },
                                100,
                              ],
                            },
                          ],
                        },
                        two: {
                          $cond: [
                            { $eq: ["$$totalRatings", 0] },
                            0,
                            {
                              $multiply: [
                                {
                                  $divide: [
                                    {
                                      $size: {
                                        $filter: {
                                          input: "$ratings",
                                          cond: { $eq: ["$$this.rating", 2] },
                                        },
                                      },
                                    },
                                    "$$totalRatings",
                                  ],
                                },
                                100,
                              ],
                            },
                          ],
                        },
                        three: {
                          $cond: [
                            { $eq: ["$$totalRatings", 0] },
                            0,
                            {
                              $multiply: [
                                {
                                  $divide: [
                                    {
                                      $size: {
                                        $filter: {
                                          input: "$ratings",
                                          cond: { $eq: ["$$this.rating", 3] },
                                        },
                                      },
                                    },
                                    "$$totalRatings",
                                  ],
                                },
                                100,
                              ],
                            },
                          ],
                        },
                        four: {
                          $cond: [
                            { $eq: ["$$totalRatings", 0] },
                            0,
                            {
                              $multiply: [
                                {
                                  $divide: [
                                    {
                                      $size: {
                                        $filter: {
                                          input: "$ratings",
                                          cond: { $eq: ["$$this.rating", 4] },
                                        },
                                      },
                                    },
                                    "$$totalRatings",
                                  ],
                                },
                                100,
                              ],
                            },
                          ],
                        },
                        five: {
                          $cond: [
                            { $eq: ["$$totalRatings", 0] },
                            0,
                            {
                              $multiply: [
                                {
                                  $divide: [
                                    {
                                      $size: {
                                        $filter: {
                                          input: "$ratings",
                                          cond: { $eq: ["$$this.rating", 5] },
                                        },
                                      },
                                    },
                                    "$$totalRatings",
                                  ],
                                },
                                100,
                              ],
                            },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            ])
            .toArray()
          return product[0]
        } catch (error) {
          console.log(error)
          throw new Error("Failed to fetch current product")
        }
      },
      getAllChildWithColor :(color) => {
        try {
          const products = db.get().collection(collection.PRODUCT_COLLECTION).find({product_color:color}).toArray()
          return products
        } catch (error) {
          console.log(error)
        }
    
      },

}