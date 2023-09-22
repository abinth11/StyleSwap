import db from "../../config/db/mongodb.js"
import collection from "../../contants/collections.js"
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
      throw new Error("Failed to fetch products")
    }
  },
  findParent: async (parentId) => {
    try {
      const parent = await db
        .get()
        .collection(collection.PRODUCT_TEMPLATE)
        .findOne({ _id: ObjectId(parentId) })
      return parent
    } catch (error) {
      throw new Error(error)
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
              parentId: 1,
              product_title: 1,
              product_size: 1,
              product_color: 1,
              product_quantity: 1,
              product_brand: 1,
              product_description: 1,
              product_warranty: 1,
              product_return: 1,
              delivery: 1,
              product_price: 1,
              offerPrice: 1,
              addedAt: 1,
              isActive: true,
              images: 1,
              status: 1,
              _id: 1,
              availabeColors: 1,
              availabeSizes: 1,
              regular_price: 1,
              category: 1,
              sub_category: 1,
              offerStartDate: 1,
              offerPercentage: 1,
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
      throw new Error("Failed to fetch current product")
    }
  },
  getAllChildWithColor: (color) => {
    try {
      const products = db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ product_color: color })
        .toArray()
      return products
    } catch (error) {
      throw new Error(error)
    }
  },
  getMensProducts: async () => {
    try {
      const pipeline = [
        {
          $match: { category: 'Mens' } 
        },
        {
          $lookup: { 
            from: collection.PRODUCT_COLLECTION, 
            localField: '_id', 
            foreignField: 'parentId', 
            as: 'products' 
          }
        },
        {
          $unwind: '$products' 
        },
        {
          $replaceRoot: {
            newRoot: '$products' 
          }
        }
      ]
      const products = await db
        .get() 
        .collection(collection.PRODUCT_TEMPLATE)
        .aggregate(pipeline)
        .toArray()
      return products
    } catch (error) {
      throw new Error(error)
    }
  },
  getWomensProducts: async () => {
    try {
      const pipeline = [
        {
          $match: { category: 'Womens' } 
        },
        {
          $lookup: { 
            from: collection.PRODUCT_COLLECTION, 
            localField: '_id', 
            foreignField: 'parentId', 
            as: 'products' 
          }
        },
        {
          $unwind: '$products' 
        },
        {
          $replaceRoot: {
            newRoot: '$products' 
          }
        }
      ]
      const products = await db
        .get() 
        .collection(collection.PRODUCT_TEMPLATE)
        .aggregate(pipeline)
        .toArray()
      return products
    } catch (error) {
      throw new Error(error)
    }
  },
  getKidsProducts: async () => {
    try {
      const pipeline = [
        {
          $match: { category: 'Kids' } 
        },
        {
          $lookup: { 
            from: collection.PRODUCT_COLLECTION, 
            localField: '_id', 
            foreignField: 'parentId', 
            as: 'products' 
          }
        },
        {
          $unwind: '$products' 
        },
        {
          $replaceRoot: {
            newRoot: '$products' 
          }
        }
      ]
      const products = await db
        .get() 
        .collection(collection.PRODUCT_TEMPLATE)
        .aggregate(pipeline)
        .toArray()
      return products
    } catch (error) {
      throw new Error(error)
    }
  },
  addRatingForProducts: async (ratingInfo, userInfos) => {
    try {
      const { _id: userId, name, email, active } = userInfos
      const { comment, rating, productId } = ratingInfo
      //? check if the user has purchased the product to add rating
      const purchased = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              userId: ObjectId(userId),
              status: "completed",
            },
          },
          {
            $unwind: "$products",
          },
          {
            $match: {
              "products.item": ObjectId(productId),
            },
          },
          {
            $project: {
              _id: 0,
              orderId: "$_id",
              productId: "$products.item",
            },
          },
        ])
        .toArray()
      if (purchased.length === 0) {
        return {
          Message: "Please purchase the product to add a reiveiw",
          notPurchased: true,
        }
      }
      const alreadyPosted = await db
        .get()
        .collection(collection.PRODUCT_RATING)
        .findOne({
          productId: ObjectId(productId),
          "userDetails.userId": userId,
        })
      if (alreadyPosted) {
        return {
          Message: "Review already posted",
          alreadyPosted: true,
        }
      }
      const ratingSchema = {
        productId: ObjectId(productId),
        userDetails: {
          userId,
          name,
          email,
          active,
        },
        rating: parseInt(rating),
        comment,
        addedAt: new Date(),
      }
      const response = await db
        .get()
        .collection(collection.PRODUCT_RATING)
        .insertOne(ratingSchema)
      return { Message: "Added your review", status: true, response }
    } catch (error) {
      throw new Error(error)
    }
  },
  editReviews: async ({ commentId, review, rating }) => {
    try {
      const response = await db
        .get()
        .collection(collection.PRODUCT_RATING)
        .updateOne(
          {
            _id: ObjectId(commentId),
          },
          {
            $set: {
              rating: rating,
              comment: review,
              updatedAt: new Date(),
              updated: true,
            },
          },
          {
            upsert: true,
          }
        )
      return response
    } catch (error) {
      throw new Error(error)
    }
  },
}
