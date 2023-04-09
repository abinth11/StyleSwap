import db from "../../config/connection.js"
import collection from "../../config/collections.js"
export const graphHelpers = {
    calculateMonthlySalesForGraph: async () => {
        try {
          const sales = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $group: {
                  _id: {
                    month: { $month: "$date" },
                    year: { $year: "$date" },
                  },
                  totalRevenue: { $sum: "$offerTotal" },
                },
              },
              {
                $project: {
                  _id: 0,
                  month: "$_id.month",
                  year: "$_id.year",
                  totalRevenue: 1,
                },
              },
              {
                $sort: {
                  year: 1,
                  month: 1,
                },
              },
            ])
            .toArray()
          const revenueByMonth = Array(12).fill(0)
          sales.forEach(({ month, totalRevenue }) => {
            revenueByMonth[month - 1] = totalRevenue
          })
          return revenueByMonth
        } catch (error) {
          throw new Error(error)
        }
      },
      NumberOfProductsAddedInEveryMonth: async () => {
        try {
          const products = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .aggregate([
              {
                $group: {
                  _id: {
                    month: { $month: "$addedAt" },
                    year: { $year: "$addedAt" },
                  },
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  month: "$_id.month",
                  year: "$_id.year",
                  count: 1,
                },
              },
              {
                $sort: {
                  year: 1,
                  month: 1,
                },
              },
            ])
            .toArray()
          const productsByMonth = Array(12).fill(0)
          products.forEach(({ month, count }) => {
            productsByMonth[month - 1] = count
          })
          return productsByMonth
        } catch (error) {
          throw new Error(error)
        }
      },
      findNumberOfMonthlyVisitors: async () => {
        try {
          const visitors = await db
            .get()
            .collection(collection.VISITORS)
            .aggregate([
              {
                $group: {
                  _id: {
                    year: { $toInt: { $substr: ["$month", 0, 4] } },
                    month: { $toInt: { $substr: ["$month", 5, 2] } },
                  },
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  month: "$_id.month",
                  year: "$_id.year",
                  count: 1,
                },
              },
              {
                $sort: {
                  year: 1,
                  month: 1,
                },
              },
            ])
            .toArray()
    
          const visitorsByMonth = Array(12).fill(0)
          visitors.forEach(({ month, count }) => {
            visitorsByMonth[month - 1] = count
          })
          return visitorsByMonth
        } catch (error) {
          throw new Error(error)
        }
      },
      orderStatitics: async () => {
        try {
          const orderStat = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $group: {
                  _id: null,
                  placedCount: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$status", "placed"] },
                            { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                            { $not: [{ $ifNull: ["$returnReason", false] }] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  confirmedCount: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$status", "confirmed"] },
                            { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                            { $not: [{ $ifNull: ["$returnReason", false] }] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  shippedCount: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$status", "shipped"] },
                            { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                            { $not: [{ $ifNull: ["$returnReason", false] }] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  outForDeliveryCount: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$status", "delivery"] },
                            { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                            { $not: [{ $ifNull: ["$returnReason", false] }] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  completedCount: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$status", "completed"] },
                            { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                            { $not: [{ $ifNull: ["$returnReason", false] }] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  reasonToCancelCount: {
                    $sum: {
                      $cond: [{ $ifNull: ["$reasonTocancell", false] }, 1, 0],
                    },
                  },
                  returnReasonCount: {
                    $sum: { $cond: [{ $ifNull: ["$returnReason", false] }, 1, 0] },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  placedCount: 1,
                  confirmedCount: 1,
                  shippedCount: 1,
                  outForDeliveryCount: 1,
                  completedCount: 1,
                  reasonToCancelCount: 1,
                  returnReasonCount: 1,
                },
              },
            ])
            .toArray()
          const valuesArray = Object.values(orderStat[0])
          return valuesArray
        } catch (error) {
          throw new Error(error)
        }
      },
      paymentStat: async () => {
        try {
          const payment = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $group: {
                  _id: null,
                  codCount: {
                    $sum: { $cond: [{ $eq: ["$paymentMethod", "cod"] }, 1, 0] },
                  },
                  paypalCount: {
                    $sum: { $cond: [{ $eq: ["$paymentMethod", "paypal"] }, 1, 0] },
                  },
                  walletCount: {
                    $sum: { $cond: [{ $eq: ["$paymentMethod", "wallet"] }, 1, 0] },
                  },
                  razorpayCount: {
                    $sum: {
                      $cond: [{ $eq: ["$paymentMethod", "razorpay"] }, 1, 0],
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  codCount: 1,
                  paypalCount: 1,
                  walletCount: 1,
                  razorpayCount: 1,
                },
              },
            ])
            .toArray()
          const valuesArray = Object.values(payment[0])
          valuesArray[1] = 49
          return valuesArray
        } catch (error) {
          throw new Error(error)
        }
      },
      mostSellingProducts: async (startDate,endDate) => {
        try {
            
    const mostSelling = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            date: {
              $gte: new Date(
                startDate+"T00:00:00.000Z"
              ),
              $lt: new Date(
               endDate+"T23:59:59.999Z"
              ),
            },
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.item",
            sold: { $sum: "$products.quantity" },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: "_id",
            foreignField: "_id",
            as: "product_details",
          },
        },
     
      ])
      .toArray()
          return mostSelling.map((product)=>{
            return {
              name: product.product_details[0].product_title,
              price:product.product_details[0].product_price,
              offerPrice:product.product_details[0].offerPrice,
              sold: product.sold,
              revenue:product.product_details[0].offerPrice*product.sold
            }  
          })
        } catch (error) {
          throw new Error(error)
        }
      },
}