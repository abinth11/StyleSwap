
const otherHelpers = {
  currencyFormatter: (price) => {
    const amount = price
    const formattedAmount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
    return formattedAmount
  },
  // addCouponTemplate: async (couponInfo, image) => {
  //   const { title, description, brand, percentage, price_limit,mycategory} = couponInfo
  //   const couponStruct = {
  //     title,
  //     description,
  //     brand,
  //     percentage:parseInt(percentage),
  //     price_limit:parseInt(price_limit),
  //     category:mycategory,
  //     image
  //   }
  //   try {
  //     return await db.get().collection(collection.COUPON_TEMPLATE).insertOne(couponStruct)
  //   }
  //   catch (error) {
  //     console.log(error)
  //   }
  // },
  // getAllCoupons: async () => {
  //   try {
  //     const coupons = await db.get().collection(collection.COUPON_TEMPLATE).find({}).toArray()
  //     return coupons
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }, 
  createCouponsForUsers: async () => {
    const couponTemplates = await db.get().collection(collection.COUPON_TEMPLATE)

  },
}
export default otherHelpers