import db from "../../config/database.js"
import collection from "../../contants/collections.js"
import crypto from "crypto"
export const couponHelpers = {
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

    //? calculate the expiry date for the new coupon
    const MIN_EXPIRY_DAYS = 15
    const MAX_EXPIRY_DAYS = 30
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
      throw new Error(error)
    }
  },
  redeemCoupon: async (couponCode, amount) => {
    try {
      const couponCollection = db.get().collection(collection.COUPONS)
      const coupon = await couponCollection.findOne({ couponCode: couponCode })
      const total = parseInt(amount)
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
      const discountAmount = Math.floor((amount / 100) * discountPercentage)
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
      const responseObject = {
        valid: true,
        coupon,
        discountAmount,
        originalAmount: total,
        priceAfterDiscount: total - discountAmount,
      }
      return responseObject
    } catch (error) {
      throw new Error(error)
    }
  },
  resetCouponCount: async () => {
    try {
      const currentTime = new Date()
      const resetThreshold = new Date("2023-04-23T05:26:00.864Z")
      const couponsToReset = await db
        .get()
        .collection(collection.COUPONS)
        .find({ lastApplied: { $lt: resetThreshold }, used: false })
        .toArray()
      const couponCodesToReset = couponsToReset.map(
        (coupon) => coupon.couponCode
      )
      await db
        .get()
        .collection(collection.COUPONS)
        .updateMany(
          { couponCode: { $in: couponCodesToReset } },
          { $set: { numberOfUses: 1 } }
        )
      await db
        .get()
        .collection(collection.COUPON_RESET_HISTORY)
        .updateMany(
          { couponCode: { $in: couponCodesToReset } },
          { $set: { lastResetTime: currentTime } }
        )
    } catch (error) {
      throw new Error(error)
    }
  },
}
