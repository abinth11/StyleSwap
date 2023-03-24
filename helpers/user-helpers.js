import db from "../config/connection.js"
// import {db} from '../config/connection.js';
import collection from "../config/collections.js"
import bcrypt from "bcrypt"
import { ObjectId } from "mongodb"
import Razorpay from "razorpay"
import crypto from "crypto"
import algoliasearch from "algoliasearch"
let sotoredAmount
const userHelpers = {
  regisUserUser: async (userData) => {
    const { password, email, mobile } = userData
    userData.active = true
    try {
      userData.password = await bcrypt.hash(password, 10)
      const checkedEmail = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email })
      const phoneNumber = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ mobile })
      if (checkedEmail) {
        return checkedEmail
      } else if (phoneNumber) {
        return phoneNumber
      } else {
        const result = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
        return { status: true, userData: result.insertedId }
      }
    } catch (error) {
      console.log(error)
      return error
    }
  },
  loginUser: async (userData) => {
    const { password, mobile } = userData
    try {
      const response = {}
      const user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ mobile })
      if (!user?.active) {
        response.block = true
        return response
      }
      if (user) {
        const status = await bcrypt.compare(password, user.password)
        if (status) {
          response.user = user
          response.status = true
          return response
        } else {
          return { incorrectPassword: "Wrong password" }
        }
      } else {
        return { loginError: false }
      }
    } catch (error) {
      console.log(error)
    }
  },
  loginWthOTP: async (userData) => {
    try {
      const { mobile } = userData
      const user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ mobile })
      if (!user.active) {
        return { block: true }
      }
      if (user) {
        const response = {
          user,
          status: true,
        }
        return response
      }
      return { loginError: false }
    } catch (error) {
      console.log(error)
    }
  },
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
  viewCurrentProduct: async (productId) => {
    try {
      const product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ _id: ObjectId(productId) })
        .toArray()
      return product[0]
    } catch (error) {
      console.log(error)
      throw new Error("Failed to fetch current product")
    }
  },
  getLoginedUser: async (userId) => {
    try {
      const user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) })
      return user
    } catch (error) {
      console.log(error)
      throw new Error("Failed to fetch logined user")
    }
  },
  editProfile: async (userId, userData) => {
    const { name, mobile, email } = userData
    try {
      const response = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              name,
              mobile,
              email,
            },
          }
        )
      return response
    } catch (error) {
      console.log(error)
      throw new Error("Failed to edit profile")
    }
  },
  addNewAddress: async (address) => {
    try {
      const data = db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .insertOne(address)
      return data
    } catch (error) {
      console.log(error)
      throw new Error("Failed to add address")
    }
  },
  getUserAddress: async (userId) => {
    try {
      const addresses = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .find({ userId })
        .toArray()
      return addresses
    } catch (error) {
      console.log(error)
      throw new Error("Failed to fetch address")
    }
  },
  getCurrentAddress: async (addressId) => {
    try {
      const address = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .findOne({ _id: ObjectId(addressId) })
      return address
    } catch (error) {
      console.log(error)
      throw new Error("Failed to fetch current address")
    }
  },
  addressDelete: (addressId) => {
    try {
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .deleteOne({ _id: ObjectId(addressId) })
      return
    } catch (error) {
      console.log(error)
      throw new Error("Failed to delete address")
    }
  },
  editAddress: async (addressId, addressInfo) => {
    try {
      const {
        name,
        mobile,
        pincode,
        locality,
        address,
        city,
        state,
        landmark,
        alternatePhone,
      } = addressInfo
      const response = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .updateOne(
          { _id: ObjectId(addressId) },
          {
            $set: {
              name,
              mobile,
              pincode,
              locality,
              address,
              city,
              state,
              landmark,
              alternatePhone,
            },
          }
        )
      return response
    } catch (error) {
      console.log(error)
      throw new Error("Failed to edit address.")
    }
  },
  addToCart: async (productId, userId) => {
    const product = {
      item: ObjectId(productId),
      quantity: 1,
    }
    try {
      const userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ userId: ObjectId(userId) })
      if (userCart) {
        const isProductExist = userCart?.products.findIndex((product) => {
          return product.item === productId
        })
        if (isProductExist !== -1) {
          await db
            .get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              {
                userId: ObjectId(userId),
                "products.item": ObjectId(productId),
              },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
        } else {
          const response = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { userId: ObjectId(userId) },
              {
                $push: {
                  products: product,
                },
              }
            )
          return response
        }
      } else {
        console.log("new cart created")
        const cart = {
          userId: ObjectId(userId),
          products: [product],
        }
        await db.get().collection(collection.CART_COLLECTION).insertOne(cart)
        console.log("added product into the cart")
      }
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  },
  getCartProductsCount: async (userId) => {
    try {
      const userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ userId: ObjectId(userId) })
      const count = userCart?.products.length
      return count
    } catch (error) {
      console.log(error)
      throw new Error("Failed to edit address.")
    }
  },
  changeCartQuantity: async ({ cartId, productId, count, quantity }) => {
    count = parseInt(count)
    quantity = parseInt(quantity)
    if (count === -1 && quantity === 1) {
      await db
        .get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: ObjectId(cartId) },
          {
            $pull: { products: { item: ObjectId(productId) } },
          }
        )
      return { removed: true }
    } else {
      await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOneAndUpdate(
          { _id: ObjectId(cartId), "products.item": ObjectId(productId) },
          {
            $inc: { "products.$.quantity": count },
          }
        )
      return { status: true }
    }
  },
  removeCartProducts: async ({ cartId, productId }) => {
    try {
      await db
        .get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: ObjectId(cartId) },
          { $pull: { products: { item: ObjectId(productId) } } }
        )
      return { removed: true }
    } catch (error) {
      console.log(error)
      return { removed: false }
    }
  },
  findTotalAmout: async (userId) => {
    try {
      const totalAmout = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: {
              userId: ObjectId(userId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              offerTotal: {
                $sum: {
                  $multiply: [
                    "$quantity",
                    {
                      $cond: {
                        if: { $gt: ["$product.offerPrice", 0] },
                        then: "$product.offerPrice",
                        else: "$product.product_price",
                      },
                    },
                  ],
                },
              },
              total: {
                $sum: {
                  $multiply: ["$quantity", "$product.product_price"],
                },
              },
            },
          },
        ])
        .toArray()
      return totalAmout[0]
    } catch (error) {
      console.log(error)
      throw new Error("Failed to find total amount.")
    }
  },
  findSubTotal: async (userId) => {
    try {
      const subtotal = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: {
              userId: ObjectId(userId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products.item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $unwind: "$product",
          },
          {
            $project: {
              _id: "$product._id",
              name: "$product.product_title",
              subtotal: {
                $multiply: [
                  "$products.quantity",
                  {
                    $ifNull: ["$product.offerPrice", "$product.product_price"],
                  },
                ],
              },
            },
          },
          {
            $group: {
              _id: "$_id",
              name: { $first: "$name" },
              subtotal: {
                $sum: "$subtotal",
              },
            },
          },
        ])
        .toArray()

      return subtotal
    } catch (error) {
      console.log(error)
      throw new Error("Failed to find sub total amount.")
    }
  },
  getcartProducts: async (userId) => {
    try {
      const cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { userId: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: "products",
              localField: "products.item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $unwind: "$product",
          },
          {
            $addFields: {
              offerSubtotal: {
                $cond: {
                  if: { $ifNull: ["$product.offerPrice", false] },
                  then: {
                    $multiply: ["$product.offerPrice", "$products.quantity"],
                  },
                  else: {
                    $multiply: ["$product.product_price", "$products.quantity"],
                  },
                },
              },
            },
          },
          {
            $group: {
              _id: {
                cartId: "$_id",
                productId: "$product._id",
              },
              product_title: { $first: "$product.product_title" },
              product_price: { $first: "$product.product_price" },
              offerPrice: { $first: "$product.offerPrice" },
              images: { $first: "$product.images" },
              quantity: { $sum: "$products.quantity" },
              subtotal: {
                $sum: {
                  $multiply: ["$products.quantity", "$product.product_price"],
                },
              },
              offerSubtotal: { $sum: "$offerSubtotal" },
            },
          },
          {
            $group: {
              _id: "$_id.cartId",
              products: {
                $push: {
                  product_id: "$_id.productId",
                  product_title: "$product_title",
                  product_price: "$product_price",
                  offerPrice: "$offerPrice",
                  quantity: "$quantity",
                  subtotal: "$subtotal",
                  images: "$images",
                  offerSubtotal: "$offerSubtotal",
                },
              },
              total: { $sum: "$subtotal" },
              offerTotal: { $sum: "$offerSubtotal" },
            },
          },
          {
            $project: {
              _id: 1,
              products: 1,
              total: 1,
              offerTotal: 1,
            },
          },
        ])
        .toArray()
      return cartItems[0]
    } catch (error) {
      console.log(error)
      throw new Error("Failed to get cart products.")
    }
  },
  getAllProductsUserCart: async (userId) => {
    try {
      const cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { userId: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products.item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $unwind: "$product",
          },
          {
            $project: {
              _id: 0,
              userId: 1,
              products: {
                item: "$products.item",
                quantity: "$products.quantity",
                offerPrice: {
                  $ifNull: ["$product.offerPrice", "$product.price"],
                },
              },
            },
          },
          {
            $group: {
              _id: "$userId",
              products: {
                $push: "$products",
              },
            },
          },
        ])
        .toArray()
      return cart
    } catch (error) {
      console.log(error)
      throw new Error("Failed to get user cart.")
    }
  },
  placeOrders: async (orderInfo, products, totalPrice, couponCode) => {
    try {
      const {
        userId,
        payment_method: paymentMethod,
        name,
        mobile,
        deliveryAddress,
      } = orderInfo
      const { total, offerTotal, discountPrice } = totalPrice
      const paymentStatus = paymentMethod === "cod" ? "done" : "pending"
      const order = {
        userId: ObjectId(userId),
        name,
        mobile,
        couponCode,
        deliveryAddressId: deliveryAddress,
        paymentMethod,
        totalPrice: total,
        offerTotal,
        priceAfterDiscount: discountPrice,
        paymentStatus,
        status: "placed",
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
      await db
        .get()
        .collection(collection.COUPONS)
        .updateOne(
          { couponCode },
          {
            $set: {
              used: true,
            },
          }
        )
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
      return new Promise((resolve, reject) => {
        const razorpay = new Razorpay({
          key_id: "rzp_test_ltAM3hZSUBfLfx",
          key_secret: "gvv1U5AQUyqTxHzkwWIt8M7x",
        })
        const options = {
          amount: totalAmout * 100, // amount in paise
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
        const crypto = require("crypto") 
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
      return new Promise((resolve, reject) => {
        const paypal = require("paypal-rest-sdk")
        paypal.configure({
          mode: "sandbox", // sandbox or live
          client_id:
            "AZbtScy5kHVy2okDeiOijRVYzqnbrZxhWn_cz9tzKWyxpHmrwV-Qza41PSQ86MNy3azk8n4bDFCofo4t",
          client_secret:
            "EIK1cBzckhi8oSS5ZqyhjkYExGq5nbcwPQD-zB3u2QefLmoOu9Q4qVwBqItgOaJ4IHuhuKuybsaIlIKX",
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
        const paypal = require("paypal-rest-sdk")
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
          .then(() => {
            resolve()
          })
      })
    } catch (error) {
      console.log(error)
      throw new Error("Failed while changing payment status")
    }
  },
  getCurrentUserOrders: async (userId) => {
    try {
      const orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              userId: ObjectId(userId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
              status: "$status",
              date: "$date",
              totalPrice: "$totalPrice",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              status: 1,
              date: 1,
              totalPrice: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray()
      console.log(orders)
      return orders
    } catch (error) {
      console.log(error)
      throw new Error("Failed to fetch current user orders")
    }
  },
  getAllAddresses: async (userId) => {
    try {
      const addresses = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .find({ userId })
        .toArray()
      return addresses
    } catch (error) {
      console.log(error)
      throw new Error("Failed to fetch all orders of the user")
    }
  },
  cancellUserOrder: (orderId, reason) => {
    try {
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: ObjectId(orderId) },
            {
              $set: {
                status: "cancelled",
                reasonTocancell: reason,
              },
            },
            { upsert: true }
          )
          .then(() => {
            resolve()
          })
      })
    } catch (error) {
      console.log(error)
      throw new Error("Failed to cancel order")
    }
  },
  getUserDetails: async (userId) => {
    try {
      const userInfo = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) })
      return userInfo
    } catch (error) {
      console.log(error)
      throw new Error("Failed to fetch user details")
    }
  },
  updateUserDetails: (userInfo) => {
    try {
      const { userId, fname, email, mobile } = userInfo
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(userId) },
            {
              $set: {
                name: fname,
                email,
                mobile,
              },
            }
          )
          .then((response) => {
            resolve(response)
          })
      })
    } catch (error) {
      console.log(error)
      throw new Error("Failed to update user details")
    }
  },
  changeUserPassword: async (userId, { password, npassword, cpassword }) => {
    try {
      const user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) })
      const hashedNewPassword = await bcrypt.hash(npassword, 10)
      if (!user) {
        return { passwordNotUpdated: true }
      }
      const isCurrentPasswordValid = await bcrypt.compare(
        password,
        user.password
      )
      if (!isCurrentPasswordValid) {
        return { invalidCurrentPassword: true }
      }
      if (npassword !== cpassword) {
        return { passwordMismatchnewAndConfirm: true }
      }
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: { password: hashedNewPassword },
          }
        )
      return { success: true }
    } catch (error) {
      console.error(error)
      return { error: true }
    }
  },
  getOrderStatus: async (orderId) => {
    try {
      const orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ _id: ObjectId(orderId) })
        .toArray()
      return orders[0]
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getStatusDates: async (orderId) => {
    try {
      const dates = await db
        .get()
        .collection(collection.ORDER_SATUS)
        .findOne({ orderId })
      return dates
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getAddressforTrackingPage: async (orderId) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const deliveryAddress = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: ObjectId(orderId),
            },
          },
          {
            $lookup: {
              from: collection.ADDRESS_COLLECTION,
              localField: "deliveryAddressId",
              foreignField: "_id",
              as: "address",
            },
          },
          // {
          //   $unwind: '$address'
          // },
          // {
          //   $project: {
          //     name: 1,
          //     mobile: 1,
          //     address: {
          //       $concat: [
          //         '$address.address',
          //         ', ',
          //         '$address.locality',
          //         ', ',
          //         '$address.city',
          //         ', ',
          //         '$address.state',
          //         ', ',
          //         '$address.pincode'
          //       ]
          //     }
          //   }
          // }
        ])
        .toArray()
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getOrdersProfile: async (orderId) => {
    try {
      const orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: ObjectId(orderId) })
        .toArray()
      return orders
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getProductsWithSameId: async (orderId) => {
    try {
      const products = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: ObjectId(orderId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              proId: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "proId",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $project: {
              proId: 1,
              quantity: 1,
              products: { $arrayElemAt: ["$products", 0] },
            },
          },
        ])
        .toArray()
      return products
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  returnProduct: async (returnInfo) => {
    try {
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: ObjectId(returnInfo.orderId) },
            {
              $set: {
                returnReason: returnInfo.reason,
                returnStatus: "pending",
              },
            },
            { upsert: true }
          )
          .then((response) => {
            resolve(response)
          })
      })
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
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
  createGuestUser: async (guestId, productId) => {
    const currentDate = new Date()
    const optionsDate = { month: "long", day: "numeric", year: "numeric" }
    const optionsTime = { hour: "numeric", minute: "2-digit" }
    const dateString = currentDate.toLocaleDateString(undefined, optionsDate)
    const timeString = currentDate.toLocaleTimeString(undefined, optionsTime)
    const dateTimeString = `${dateString} at ${timeString}`
    const product = {
      item: ObjectId(productId),
      quantity: 1,
    }
    try {
      console.log(guestId, productId)
      const guestCart = await db
        .get()
        .collection(collection.GUEST_USERS)
        .findOne({ guestId })
      console.log(guestCart?.products)
      if (guestCart) {
        const isProductExist = guestCart.products.findIndex((product) => {
          return product.item.equals(ObjectId(productId))
        })
        console.log(isProductExist)
        if (isProductExist !== -1) {
          await db
            .get()
            .collection(collection.GUEST_USERS)
            .updateOne(
              { guestId, "products.item": ObjectId(productId) },
              {
                $inc: { "products.$.quantity": 1 },
                $set: { updatedAt: dateTimeString },
              }
            )
            .then((response) => {
              console.log(response)
            })
        } else {
          await db
            .get()
            .collection(collection.GUEST_USERS)
            .updateOne(
              { guestId },
              {
                $push: {
                  products: product,
                },
                $set: { updatedAt: dateTimeString },
              }
            )
        }
      } else {
        console.log("new guest cart created")
        const guestDocument = {
          guestId,
          products: [product],
          createdAt: dateTimeString,
          updatedAt: dateTimeString,
        }
        await db
          .get()
          .collection(collection.GUEST_USERS)
          .insertOne(guestDocument)
      }
      return true
    } catch (error) {
      console.log(error)
      throw new Error("Failed to create guest user")
    }
  },
  getGuestUserCartProducts: async (guestId) => {
    try {
      const cartItems = await db
        .get()
        .collection(collection.GUEST_USERS)
        .aggregate([
          {
            $match: { guestId },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products.item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $unwind: "$product",
          },
          {
            $addFields: {
              offerSubtotal: {
                $cond: {
                  if: { $ifNull: ["$product.offerPrice", false] },
                  then: {
                    $multiply: ["$product.offerPrice", "$products.quantity"],
                  },
                  else: {
                    $multiply: ["$product.product_price", "$products.quantity"],
                  },
                },
              },
            },
          },
          {
            $group: {
              _id: {
                cartId: "$_id",
                productId: "$product._id",
              },
              product_title: { $first: "$product.product_title" },
              product_price: { $first: "$product.product_price" },
              offerPrice: { $first: "$product.offerPrice" },
              quantity: { $sum: "$products.quantity" },
              images: { $first: "$product.images" },
              subtotal: {
                $sum: {
                  $multiply: ["$products.quantity", "$product.product_price"],
                },
              },
              offerSubtotal: { $sum: "$offerSubtotal" },
            },
          },
          {
            $group: {
              _id: "$_id.cartId",
              products: {
                $push: {
                  product_id: "$_id.productId",
                  product_title: "$product_title",
                  product_price: "$product_price",
                  offerPrice: "$offerPrice",
                  quantity: "$quantity",
                  subtotal: "$subtotal",
                  images: "$images",
                  offerSubtotal: "$offerSubtotal",
                },
              },
              total: { $sum: "$subtotal" },
              offerTotal: { $sum: "$offerSubtotal" },
            },
          },
          {
            $project: {
              _id: 1,
              products: 1,
              total: 1,
              offerTotal: 1,
            },
          },
        ])
        .toArray()
      return cartItems[0]
    } catch (error) {
      console.log(error)
      throw new Error("Failed to get cart products of guest user.")
    }
  },
  mergeGuestCartIntoUserCart: async (userId, guestId) => {
    console.log(userId, guestId)
    console.log("from guest merge")
    const guestUser = await db
      .get()
      .collection(collection.GUEST_USERS)
      .findOne({ guestId })
    console.log(guestUser)
    const result = await db
      .get()
      .collection(collection.CART_COLLECTION)
      .findOneAndUpdate(
        {
          userId: ObjectId(userId),
          "products.item": { $in: guestUser.products.map((p) => p.item) },
        },
        {
          $inc: {
            "products.$[product].quantity": 1,
          },
        },
        {
          arrayFilters: [
            {
              "product.item": { $in: guestUser.products.map((p) => p.item) },
            },
          ],
        }
      )
    if (!result.value) {
      await db
        .get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { userId: ObjectId(userId) },
          {
            $addToSet: {
              products: {
                $each: guestUser.products,
              },
            },
          },
          { upsert: true }
        )
    }
    await db.get().collection(collection.GUEST_USERS).deleteOne({ guestId })
    console.log(result)
    return result
  },
  createCouponForUsers: async (userId) => {
    //? get all available coupon templates from the database
    const couponTemplates = await db
      .get()
      .collection(collection.COUPON_TEMPLATE)
      .find({})
      .toArray()
    //* randomly select a coupon template from the list
    const randomIndex = Math.floor(Math.random() * couponTemplates.length)

    const selectedCouponTemplate = couponTemplates[randomIndex]
    console.log(selectedCouponTemplate)
    const MIN_EXPIRY_DAYS = 15
    const MAX_EXPIRY_DAYS = 30

    //? calculate the expiry date for the new coupon
    const expiryDays =
      Math.floor(Math.random() * (MAX_EXPIRY_DAYS - MIN_EXPIRY_DAYS + 1)) +
      MIN_EXPIRY_DAYS
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + expiryDays)

    //? creating a unique coupon code usin crypto algorithm
    function generateCouponCode(length) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      const bytes = crypto.randomBytes(length)
      const result = new Array(length)

      for (let i = 0; i < length; i++) {
        const byte = bytes[i]
        result[i] = chars[byte % chars.length]
      }

      return result.join("")
    }

    //* create a new coupon based on the selected template's rules
    const newCoupon = {
      userId: userId,
      couponCode: generateCouponCode(10),
      name: selectedCouponTemplate.title,
      brand: selectedCouponTemplate.brand,
      discountPercentage: selectedCouponTemplate.percentage,
      minimumPurchaseAmount: selectedCouponTemplate.price_limit,
      expirationDate: expiryDate,
      image: selectedCouponTemplate.image,
      numberOfUses: 1,
      used: false,
    }
    console.log(newCoupon)
    // todo inserting the creted coupon into the database
    const response = await db
      .get()
      .collection(collection.COUPONS)
      .insertOne(newCoupon)
    if (response.acknowledged) {
      return newCoupon
    }
  },
  getUserCoupons: async (userId) => {
    try {
      const coupon = await db
        .get()
        .collection(collection.COUPONS)
        .find({ userId })
        .toArray()
      return coupon
    } catch (error) {
      console.log(error)
    }
  },
  redeemCoupon: async (couponCode, amount) => {
    try {
      const couponCollection = db.get().collection(collection.COUPONS)
      const coupon = await couponCollection.findOne({ couponCode: couponCode })
      const total = parseInt(amount)
      console.log(total)
      console.log(coupon)
      if (!coupon) {
        return { valid: false, message: "Invalid coupon code" }
      }
      if (coupon.used) {
        return { valid: false, message: "Coupon code already used" }
      }
      if (coupon.expirationDate < new Date()) {
        return { valid: false, message: "Coupon code expired" }
      }
      if (total < coupon.minimumPurchaseAmount) {
        return {
          valid: false,
          message: `Minimum purchase amount is ${coupon.minimumPurchaseAmount}`,
        }
      }
      if (coupon.numberOfUses < 1) {
        return {
          valid: false,
          message: `You are already entered coupon code, try again after 24 hours`,
        }
      }
      const min = 5,
        max = coupon.discountPercentage
      const discountPercentage = Math.floor(
        Math.random() * (max - min + 1) + min
      )
      console.log(discountPercentage)
      const discountAmount = Math.floor((amount / 100) * discountPercentage)
      console.log(discountAmount)
      if (coupon.numberOfUses >= 1) {
        await db
          .get()
          .collection(collection.COUPONS)
          .updateOne(
            { couponCode },
            { $inc: { numberOfUses: -1 }, $set: { lastApplied: new Date() } },
            { upsert: true }
          )
      }
      return { valid: true, coupon: coupon, discountAmount }
    } catch (error) {
      console.log(error)
    }
  },
  resetCouponCount: async () => {
    try {
      const currentTime = new Date()
      // const resetThreshold = new Date(currentTime - 24 * 60 * 60 * 1000); // 24 hours ago
      const resetThreshold = new Date("2023-04-23T05:26:00.864Z")
      // console.log(resetThreshold);

      // Query the couponResetHistory collection for coupons that were last reset more than 24 hours ago
      const couponsToReset = await db
        .get()
        .collection(collection.COUPONS)
        .find({ lastApplied: { $lt: resetThreshold }, used: false })
        .toArray()
      // console.log(couponsToReset);

      // Get an array of coupon codes to update
      const couponCodesToReset = couponsToReset.map(
        (coupon) => coupon.couponCode
      )

      // Update the numberOfUses field for the selected coupons
      await db
        .get()
        .collection(collection.COUPONS)
        .updateMany(
          { couponCode: { $in: couponCodesToReset } },
          { $set: { numberOfUses: 1 } }
        )

      // Update the couponResetHistory collection with the new reset time for the updated coupons
      // await db
      //   .get()
      //   .collection(collection.COUPON_RESET_HISTORY)
      //   .updateMany(
      //     { couponCode: { $in: couponCodesToReset } },
      //     { $set: { lastResetTime: currentTime } }
      //   );
    } catch (error) {
      console.log(error)
    }
  },
  searchWithAlgolia: async (query) => {
    //todo there is a but with index.add method fix that
    try {
      const client = algoliasearch(
        "9LLP9RS9DX",
        "3e47e70258702fe4a47b7ae1cde43adc"
      )  
     const objectsToIndex = await db.get().collection(collection.PRODUCT_COLLECTION).find({}).toArray() 
     const index = client.initIndex("searchIndex")
     index.addObjects(objectsToIndex, function (err, content) {
      if (err) throw err
      console.log(content)
    })
    const results = await index.search({ query }) 
    return results
    } catch (error) {
     console.log(error)
    }
  },
  getMensProducts: async () => {
    try {
      const products = await db.get().collection(collection.PRODUCT_COLLECTION).find({product_category:'Mens'}).toArray()
      return products

    } catch (error) {
      console.log(error)
    }

  },
  getWomensProducts: async () => {
    try {
      const products = await db.get().collection(collection.PRODUCT_COLLECTION).find({product_category:'Womens'}).toArray()
      return products
    } catch (error) {
      console.log(error)
    }
  },
  getKidsProducts: async () => {
    try {
      const products = await db.get().collection(collection.PRODUCT_COLLECTION).find({product_category:'Kids'}).toArray()
      return products
    } catch (error) {
      console.log(error)
    }
  },
  getOrderedGroup: async (userId) => {
    try {
      const orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: ObjectId(userId) })
      return orders
    } catch (errors) {
      console.log(errors)
    }
  },
}

export default userHelpers 
