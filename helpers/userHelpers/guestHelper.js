import db from "../../config/connection.js"
import collection from "../../config/collections.js"
import { ObjectId } from "mongodb"
export const guestHelper = {
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
}
