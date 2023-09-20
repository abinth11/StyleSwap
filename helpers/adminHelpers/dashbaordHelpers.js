import db from "../../config/database.js"
import collection from "../../contants/collections.js"
export const dashboardHelpers = {
    calculateTotalRevenue: async () => {
        try {
          const revenue = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $match: {
                  status: "completed",
                  returnReason: { $exists: false },
                },
              },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: "$offerTotal" },
                },
              },
            ])
            .toArray()
          if (revenue.length) {
            return revenue[0]?.totalRevenue
          } else {
            return 0
          }
        } catch (error) {
          throw new Error(error)
        }
      },
      calculateTotalRevenueByDate: async (from, to) => {
        try {
          const isoFromDate = new Date(from).toISOString()
          const isoToDate = new Date(to).toISOString()
          const revenue = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $match: {
                  status: "completed",
                  returnReason: { $exists: false },
                  date: {
                    $gte: new Date(isoFromDate),
                    $lt: new Date(isoToDate),
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: "$offerTotal" },
                },
              },
            ])
            .toArray()
          if (revenue.length) {
            return revenue[0]?.totalRevenue
          } else {
            return 0
          }
        } catch (error) {
          throw new Error(error)
        }
      },
      calculateTotalOrders: async () => {
        try {
          const orders = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .countDocuments()
          return orders
        } catch (error) {
          throw new Error(error)
        }
      },
      calculateTotalOrdersByDate: async (from, to) => {
        try {
          const fromDate = new Date(from)
          const toDate = new Date(to)
          const orders = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $match: {
                  date: {
                    $gte: fromDate,
                    $lt: toDate,
                  },
                },
              },
              {
                $count: "totalOrders",
              },
            ])
            .toArray()
          return orders[0] ? orders[0].totalOrders : 0
        } catch (error) {
          throw new Error(error)
        }
      },
      calculateTotalNumberOfProducts: async () => {
        try {
          const products = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .countDocuments()
          return products
        } catch (error) {
          throw new Error(error)
        }
      },
      calculateTotalNumberOfProductsByDate: async (from, to) => {
        try {
          const products = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .countDocuments({
              addedAt: { $gte: new Date(from), $lte: new Date(to) },
            })
          return products
        } catch (error) {
          throw new Error(error)
        }
      },
      calculateMonthlyEarnings: async () => {
        try {
          const monthlyIncome = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $match: {
                  status: "completed",
                  returnReason: { $exists: false },
                  date: {
                    $gte: new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1
                    ),
                    $lt: new Date(
                      new Date().getFullYear(),
                      new Date().getMonth() + 1,
                      1
                    ),
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  monthlyRevenue: { $sum: "$offerTotal" },
                },
              },
            ])
            .toArray()
          if (monthlyIncome.length) {
            return monthlyIncome[0].monthlyRevenue
          } else {
            return 0
          }
        } catch (error) {
          throw new Error(error)
        }
      },
      calculateAverageOrderValue: async () => {
        try {
          const aov = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $match: {
                  status: "completed",
                  returnReason: { $exists: false },
                  reasonToCancel: { $exists: false },
                },
              },
              {
                $group: {
                  _id: null,
                  totalOrders: { $sum: 1 },
                  totalAmount: { $sum: "$offerTotal" },
                },
              },
              {
                $project: {
                  _id: 0,
                  AOV: { $divide: ["$totalAmount", "$totalOrders"] },
                },
              },
            ])
            .toArray()
          return aov[0].AOV
        } catch (error) {
          throw new Error (error)
        }
      },
}