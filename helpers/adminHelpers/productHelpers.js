import db from "../../config/connection.js"
import collection from "../../config/collections.js"
import { ObjectId as objectId } from "mongodb"
export const productHelpers = {
  addProductTemplate: async (productInfo, image) => {
    try {
      const {
        product_name,
        product_description,
        regular_price,
        sub_category,
        category,
      } = productInfo
      const product = {
        product_name,
        product_description,
        regular_price:parseInt(regular_price),
        sub_category,
        category,
        availabeColors:[{}],
        availabeSizes:[],
        image,
        addedAt:new Date()
      }
      const response = await db
        .get()
        .collection(collection.PRODUCT_TEMPLATE)
        .insertOne(product)
      return response
    } catch (error) {
      throw new Error("Error while adding product template")
    }
  },
  getProductTemplates: async() => {
    try {
      const productTemplate = await db.get().collection(collection.PRODUCT_TEMPLATE).find({}).toArray()
      return productTemplate

    } catch (error) {
      throw new Error("Error while getting product templates")
    }

  },
  addProducts: async (product, urls) => {
    const { product_price: productPrice,
      productId,
      product_quantity,
      product_color,
      product_size,
       ...rest } = product
    const productData = {
      parentId:objectId(productId),
      ...rest,
      product_color,
      product_size,
      product_price: parseInt(productPrice),
      quantity:parseInt(product_quantity),
      offerPrice: parseInt(productPrice),
      addedAt: new Date(),
      isActive: true,
      images: {
        image1: urls[0],
        image2: urls[1],
        image3: urls[2],
        image4:urls[3],
        image5:urls[4]
      },
    }
    try {
      const result = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .insertOne(productData)
      const childId = result.insertedId
      await db.get().collection(collection.PRODUCT_TEMPLATE).updateOne(
        { _id: objectId(productId) },
        {
          $addToSet: { availabeSizes: product_size },
          $push: {
            availabeColors: {
              color: product_color,
              id: objectId(childId)
            }
          }
        }
      )
      return { ...result, productData }
    } catch (error) {
      throw new Error("Failed to add product")
    }
  },
  viewProduct: async (parentId) => {
    try {
      const products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({parentId:objectId(parentId)})
        .toArray()
      return products
    } catch (error) {
      throw new Error("Failed to retrieve products")
    }
  },
  getProductDetails: async (productId) => {
    try {
      const product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(productId) })
      return product
    } catch (error) {
      throw new Error("Failed to retrieve product details")
    }
  },
  updateProductsList: async (productId, productDetails) => {
    productDetails.product_price = parseInt(productDetails.product_price)
    try {
      await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(productId) },
          {
            $set: {
              ...productDetails,
            },
          }
        )
      return
    } catch (error) {
      throw new Error("Failed to update product details")
    }
  },
  disableEnableProduct: async (productId, activeStatus) => {
    try {
     let isActive = activeStatus
      if (isActive === "false") {
        isActive = true
      } else {
        isActive = false
      }
      const status = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOneAndUpdate(
          { _id: objectId(productId) },
          {
            $set: {
              isActive,
            },
          }
        )
      return status
    } catch (error) {
      throw new Error(error)
    }
  },
}