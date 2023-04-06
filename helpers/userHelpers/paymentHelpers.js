let sotoredAmount
import db from "../../config/connection.js"
import collection from "../../config/collections.js"
import { ObjectId } from "mongodb"
import Razorpay from "razorpay"
import paypal from "paypal-rest-sdk"
import crypto from "crypto"
export const paymentHelpers = {
  placeOrders: async (orderInfo, products, totalPrice, couponObj) => {
    try {
      if (!couponObj) {
        couponObj = {}
      }
      const {
        userId,
        payment_method: paymentMethod,
        name,
        mobile,
        deliveryAddress,
      } = orderInfo
      const { total, discountPrice } = totalPrice
      let offerTotal = totalPrice.offerTotal
      const { coupon, discountAmount } = couponObj
      if (discountAmount) {
        offerTotal = offerTotal - discountAmount
      }
      console.log(paymentMethod)
      const paymentStatus = paymentMethod === "cod" ? "done" : "pending"
      const orderStatus = paymentStatus === 'done' ? 'placed' : 'pending'
      const order = {
        userId: ObjectId(userId),
        name,
        mobile,
        couponDetails: {
          couponCode: coupon?.couponCode,
          discountAmount: discountAmount,
        },
        deliveryAddressId: deliveryAddress,
        paymentMethod,
        totalPrice: total,
        offerTotal,
        priceAfterDiscount: discountPrice,
        paymentStatus,
        status: orderStatus,
        date: new Date(),
        deliveryDetails: {
          mobile_no: mobile,
        },
        products: products[0]?.products,
      }
      const resp = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(order)
      //? marking the coupon as used
      coupon &&
        (await db
          .get()
          .collection(collection.COUPONS)
          .updateOne(
            { couponCode: coupon?.couponCode },
            {
              $set: {
                used: true,
              },
            }
          ))
      //? updating the stock after order placed
      for (const product of products[0].products) {
        console.log(product)
        const { item, quantity } = product
        await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne({ _id: item }, { $inc: { product_quantity: -quantity } })
          .then((response) => {
            console.log(response)
          })
      }
      //? clearing products from the cart
      await db
        .get()
        .collection(collection.CART_COLLECTION)
        .deleteOne({ userId: ObjectId(orderInfo.userId) })
      return resp
    } catch (error) {
      console.log(error)
      throw new Error("Failed to place the order")
    }
  },
  createStatusCollection: (orderId) => {
    try {
      return new Promise((resolve, reject) => {
        const key = "placed"
        const now = new Date()
        const { toDateString: dateString } = now // destructuring here
        const status = { [key]: dateString, orderId }
        db.get()
          .collection(collection.ORDER_SATUS)
          .insertOne(status)
          .then((response) => {
            resolve(response)
          })
      })
    } catch (error) {
      console.log(error)
      throw new Error("Failed to update the order status")
    }
  },
  getRazorpay: (orderId, totalAmout) => {
    try {
      return new Promise((resolve) => {
        const razorpay = new Razorpay({
          // eslint-disable-next-line no-undef
          key_id: process.env.RAZORPAY_KEY_ID,
          // eslint-disable-next-line no-undef
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        })
        const options = {
          amount: totalAmout * 100,
          currency: "INR",
          receipt: "" + orderId,
          payment_capture: 1,
        }
        razorpay.orders.create(options, function (err, order) {
          if (err) {
            console.log(err)
          } else {
            console.log(order)
            resolve(order)
          }
        })
      })
    } catch (error) {
      console.log(error)
      throw new Error("Failed to get razorpay")
    }
  },
  verifyRazorpayPayments: (paymentInfo) => {
    try {
      return new Promise((resolve, reject) => {
        let hmac = crypto.createHmac("sha256", "gvv1U5AQUyqTxHzkwWIt8M7x")
        hmac.update(
          paymentInfo["order[razorpay_order_id]"] +
            "|" +
            paymentInfo["order[razorpay_payment_id]"]
        )
        hmac = hmac.digest("hex")
        if (hmac === paymentInfo["order[razorpay_signature]"]) {
          resolve({ status: true })
        } else {
          reject(new Error("Payment failed"))
        }
      })
    } catch (error) {
      console.log(error)
      throw new Error("Failed to verify razorpay payments")
    }
  },
  getPaypal: (orderId, totalAmout) => {
    try {
      if (!sotoredAmount) {
        sotoredAmount = totalAmout
      }
      console.log(sotoredAmount)
      return new Promise((resolve) => {
        paypal.configure({
          mode: "sandbox", // sandbox or live
          // eslint-disable-next-line no-undef
          client_id: process.env.PAYPAL_CLIENT_ID,
          // eslint-disable-next-line no-undef
          client_secret: process.env.PAYPAL_CLIENT_SECRET,
        })
        const createPaymentJson = {
          intent: "sale",
          payer: {
            payment_method: "paypal",
          },
          redirect_urls: {
            return_url: "http://localhost:3000/view-orders",
            cancel_url: "http://localhost:3000/proceed-to-checkout",
          },
          transactions: [
            {
              item_list: {
                items: [
                  {
                    name: "item",
                    sku: "item",
                    price: sotoredAmount,
                    currency: "USD",
                    quantity: 1,
                  },
                ],
              },
              amount: {
                currency: "USD",
                total: sotoredAmount,
              },
              description: "This is the payment description.",
            },
          ],
        }
        paypal.payment.create(createPaymentJson, function (error, payment) {
          if (error) {
            console.log(error)
          } else {
            console.log(payment)
            const paypalResponse = { paypal: true }
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === "approval_url") {
                const redirectUrl = payment.links[i].href
                paypalResponse.reUrl = redirectUrl
                resolve(paypalResponse)
              }
            }
          }
        })
      })
    } catch (error) {
      console.log(error)
      throw new Error("Failed to get paypal")
    }
  },
  verifyPaypal: () => {
    try {
      return new Promise((resolve, reject) => {
        const executePaymentJson = {
          payer_id: "Appended to redirect url",
          transactions: [
            {
              amount: {
                currency: "INR",
                total: "1",
              },
            },
          ],
        }
        const paymentId = "PAYMENT id created in previous step"
        paypal.payment.execute(
          paymentId,
          executePaymentJson,
          function (error, payment) {
            if (error) {
              console.log(error.response)
              throw error
            } else {
              console.log("Get Payment Response")
              console.log(JSON.stringify(payment))
              resolve(payment)
            }
          }
        )
      })
    } catch (error) {
      console.log(error)
      throw new Error("Failed to verify paypal")
    }
  },
  changePaymentStatus: (orderId) => {
    try {
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: ObjectId(orderId) },
            {
              $set: {
                paymentStatus: "done",
              },
            }
          )
          .then((response) => {
            console.log("response of payment status razorpay" + response)
            resolve()
          })
      })
    } catch (error) {
      console.log(error)
      throw new Error("Failed while changing payment status")
    }
  },
}
