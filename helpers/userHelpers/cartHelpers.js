import db from "../../config/db/mongodb.js"
import collection from "../../contants/collections.js"
import { ObjectId } from "mongodb"
import { wishListHelper } from "./wishListHelpers.js"
export const cartHelpers = {
  addToCart: async (productId, userId, from) => {
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
          from == "wishlist" &&
            (await wishListHelper.removeProducts(productId, userId))
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
          from == "wishlist" &&
            (await wishListHelper.removeProducts(productId, userId))
          return response
        }
      } else {
        const cart = {
          userId: ObjectId(userId),
          products: [product],
        }
        await db.get().collection(collection.CART_COLLECTION).insertOne(cart)
        from == "wishlist" &&
          (await wishListHelper.removeProducts(productId, userId))
      }
      return true
    } catch (error) {
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
      throw new Error("Failed to get the count.")
    }
  },
  changeCartQuantity: async ({ cartId, productId, count:countArg, quantity:quantityArg }) => {
    const count = parseInt(countArg)
    const quantity = parseInt(quantityArg)
    if(isNaN(quantity))
     throw new Error("Quantity must be a number")
    try {
      // Get the product's current stock level
      const product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(productId) })
      const currentStockLevel = product.product_quantity
      if (count === -1 && quantity === 1) {
        // Remove the product from the cart
        await db
          .get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: ObjectId(cartId) },
            { $pull: { products: { item: ObjectId(productId) } } }
          )
        return { removed: true }
      } else if (count > 0 && quantity >= currentStockLevel) {
        // Set the product's status to "out of stock" and notify the user
        await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: ObjectId(productId) },
            { $set: { status: "out of stock" } }
          )
        return {
          status: false,
          message: "The requested quantity is not available.",
        }
      } else {
        // If the requested quantity is less than or equal to the stock level, update the quantity in the user's cart
        await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOneAndUpdate(
            { _id: ObjectId(cartId), "products.item": ObjectId(productId) },
            { $inc: { "products.$.quantity": count } }
          )
        return { status: true }
      }
    } catch (err) {
      throw new Error(err)
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
      return { removed: false }
    }
  },
  removeCartProductsGuest : async (guestId,info) => {
    const {productId} = info
    try {
      await db
        .get()
        .collection(collection.GUEST_USERS)
        .updateOne(
          { guestId},
          { $pull: { products: { item: ObjectId(productId) } } }
        )
      return { removed: true }
    } catch (error) {
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
      throw new Error("Failed to get user cart.")
    } 
  },
  changeCartQuantityForGuest:async(guestId,info) =>{
    try {
      let {productId,count,quantity} = info
       count = parseInt(count)
     quantity = parseInt(quantity)
    if(isNaN(quantity))
     throw new Error("Quantity must be a number")
      // Get the product's current stock level
      const product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(productId) })
      const currentStockLevel = product.product_quantity
      if (count === -1 && quantity === 1) {
        // Remove the product from the cart
        await db
          .get()
          .collection(collection.GUEST_USERS)
          .updateOne(
            { guestId: guestId },
            { $pull: { products: { item: ObjectId(productId) } } }
          )
        return { removed: true }
      } else if (count > 0 && quantity >= currentStockLevel) {
        // Set the product's status to "out of stock" and notify the user
        await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: ObjectId(productId) },
            { $set: { status: "out of stock" } }
          )
        return {
          status: false,
          message: "The requested quantity is not available.",
        }   
      } else {
        // If the requested quantity is less than or equal to the stock level, update the quantity in the user's cart
        await db
          .get()
          .collection(collection.GUEST_USERS)
          .findOneAndUpdate(
            { guestId: guestId, "products.item": ObjectId(productId) },
            { $inc: { "products.$.quantity": count } }
          )
        return { status: true }
      }
      

    } catch (error) {
      throw new Error("Failed to update quantity for guest")
    }
  },
  findTotalAmountForGuest: async (guestId) => {
    try {
      const totalAmount = await db
        .get()
        .collection(collection.GUEST_USERS)
        .aggregate([
          {
            $match: {
              guestId,
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
      return totalAmount[0]
    } catch (error) {
      throw new Error("Failed to find total amount.")
    }
  },
  getCartProductsCountGuest : async(guestId) =>{
    try {
      const guestCart = await db
        .get()
        .collection(collection.GUEST_USERS)
        .findOne({ guestId })
      const count = guestCart?.products.length
      return count
    } catch (error) {
      throw new Error("Failed to edit address.")
    }

  }
}
