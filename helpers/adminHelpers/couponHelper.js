import db from "../../config/db/mongodb.js"
import collection from "../../contants/collections.js"
export const couponHelpers = {
    addCouponTemplate: async (couponInfo, image) => {
        const { title, description, brand, percentage, price_limit, mycategory } =
          couponInfo
        const couponStruct = {
          title,
          description,
          brand,
          percentage: parseInt(percentage),
          price_limit: parseInt(price_limit),
          category: mycategory,
          image,
        }
        try {
          return await db
            .get()
            .collection(collection.COUPON_TEMPLATE)
            .insertOne(couponStruct)
        } catch (error) {
          throw new Error(error)
        }
      },
      getAllCoupons: async () => {
        try {
          const coupons = await db
            .get()
            .collection(collection.COUPON_TEMPLATE)
            .find({})
            .toArray()
          return coupons
        } catch (error) {
          throw new Error(error)
        }
      },
}