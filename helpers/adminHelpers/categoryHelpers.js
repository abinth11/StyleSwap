import db from "../../config/database.js"
import collection from "../../contants/collections.js"
import { ObjectId as objectId } from "mongodb"
export const categoryHelpers = {
    addCategories: async (categoryInfo) => {
        const response = await db
          .get()
          .collection(collection.CATEGORY_COLLECTION)
          .insertOne(categoryInfo)
        return response
      },
      getAllCategories: async () => {
        try {
          const categories = await db
            .get()
            .collection(collection.CATEGORY_COLLECTION)
            .find({})
            .toArray()
          return categories
        } catch (error) {
          throw new Error(error)
        }
      },
      getCurrentCategory: async (catId) => {
        try {
          const category = await db
            .get()
            .collection(collection.CATEGORY_COLLECTION)
            .findOne({ _id: objectId(catId) })
          return category
        } catch (error) {
          throw new Error(error)
        }
      },
      updateCurrentCategory: async (catId, catData) => {
        try {
          const response = await db
            .get()
            .collection(collection.CATEGORY_COLLECTION)
            .updateOne(
              { _id: objectId(catId) },
              {
                $set: {
                  product_name: catData.product_name,
                  product_slug: catData.product_slug,
                  product_parent: catData.product_parent,
                  product_description: catData.product_description,
                },
              }
            )
          return response
        } catch (error) {
          throw new Error("Error updating category")
        }
      },
      deleteProductCategory: async (catId) => {
        try {
          await db
            .get()
            .collection(collection.CATEGORY_COLLECTION)
            .deleteOne({ _id: objectId(catId) })
          return catId
        } catch (error) {
          throw new Error(error)
        }
      },
      addSubCategory: async (subCategoryInfo) => {
        try {
          subCategoryInfo.active = true
          const result = await db
            .get()
            .collection(collection.SUB_CATEGORIES)
            .insertOne(subCategoryInfo)
          if (result.acknowledged) return result
        } catch (error) {
          throw new Error (error)
        }
      },
      getAllSubCategories: async () => {
        try {
          const subCategory = await db
            .get()
            .collection(collection.SUB_CATEGORIES)
            .find({})
            .toArray()
          return subCategory
        } catch (error) {
          throw new Error(error)
        }
      },
      deleteSubCategory: async (categoryId) => {
        try {
          return await db
            .get()
            .collection(collection.SUB_CATEGORIES)
            .deleteOne({ _id: objectId(categoryId) })
        } catch (error) {
          throw new Error(error)
        }
      },
      addColor: async (color) => {
        try {
          const response = await db
            .get()
            .collection(collection.COLORS)
            .insertOne(color)
          return response
        } catch (error) {
          throw new Error(error)
        }
      },
      addSize: async (size) => {
        try {
          const response = await db
            .get()
            .collection(collection.SIZES)
            .insertOne(size)
          return response
        } catch (error) {
          throw new Error(error)
        }
      },
      getAllSize: async () => {
        try {
          const size = db.get().collection(collection.SIZES).find({}).toArray()
          return size
        } catch (error) {
          throw new Error(error)
        }
      },
      getAllColor: async () => {
        try {
          const color = db.get().collection(collection.COLORS).find({}).toArray()
          return color
        } catch (error) {
          throw new Error(error)
        }
      },
     
}