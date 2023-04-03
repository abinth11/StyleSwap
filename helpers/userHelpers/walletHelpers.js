import db from "../../config/connection.js"
import collection from "../../config/collections.js"
import { ObjectId } from "mongodb"
export const walletHelpers = {
    createWallet: (userInfo, userId) => {
        const now = new Date()
        const currentDateTime = now.toLocaleString("en-US", {
          dateStyle: "short",
          timeStyle: "short",
        })
        const { name, email, mobile, active } = userInfo
        const wallet = {
          userid: userId._id,
          name,
          email,
          mobile,
          active,
          balance: 0,
          transactions: [],
          createdAt: currentDateTime,
          updatedAt: currentDateTime,
        }
        try {
          db.get().collection(collection.WALLET).insertOne(wallet)
        } catch (error) {
          console.error(error)
        }
      },
      getWalletData: async (userId) => {
        try {
          const wallet = await db
            .get()
            .collection(collection.WALLET)
            .findOne({ userid: ObjectId(userId) })
          return wallet
        } catch (error) {
          console.error(error)
        }
      },
      getUserWallet: async (orderId, total, userId) => {
        try {
          const { WALLET, ORDER_COLLECTION } = collection
          const walletCollection = await db.get().collection(WALLET)
          const ordersCollection = await db.get().collection(ORDER_COLLECTION)
          const { balance } = await walletCollection.findOne(
            { userid: ObjectId(userId) },
            { balance: 1 }
          )
          const currentDate = new Date()
          const optionsDate = { month: "long", day: "numeric", year: "numeric" }
          const optionsTime = { hour: "numeric", minute: "2-digit" }
          const dateString = currentDate.toLocaleDateString(undefined, optionsDate)
          const timeString = currentDate.toLocaleTimeString(undefined, optionsTime)
          const dateTimeString = `${dateString} at ${timeString}`
          if (balance && balance >= total) {
            const paymentStatusUpdated = await ordersCollection.updateOne(
              { _id: ObjectId(orderId) },
              { $set: { paymentStatus: "done" } }
            )
            if (paymentStatusUpdated.modifiedCount === 1) {
              const updatedBalance = balance - total
              await walletCollection.updateOne(
                { userid: ObjectId(userId) },
                {
                  $push: {
                    transactions: {
                      type: "debited",
                      amount: total,
                      date: dateTimeString,
                      orderId,
                    },
                  },
                  $set: {
                    balance: updatedBalance,
                    updatedAt: dateTimeString,
                  },
                }
              )
              return { updatedBalance, paid: true, amountPaid: total }
            }
          }
          walletCollection.updateOne(
            { userid: ObjectId(userId) },
            {
              $push: {
                transactions: {
                  type: "failed",
                  amount: total,
                  date: dateTimeString,
                  orderId,
                },
              },
              $set: {
                updatedAt: dateTimeString,
              },
            }
          )
          return { paid: false }
        } catch (error) {
          console.log(error)
          throw new Error("Error getting user wallet.")
        }
      },
}