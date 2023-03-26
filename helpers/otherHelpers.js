import userHelpers from "./user-helpers.js"

const otherHelpers = {
  currencyFormatter: (price) => {
    const amount = price
    const formattedAmount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
    return formattedAmount
  },
  checkProbabilityForCoupon: async (probability, userId) => {
      try {
       const result = Math.random()
       if (result < probability) {
        return await userHelpers.createCouponForUsers(userId)
       } else {
        return false
       }
      } catch (error) {
        console.log(error)
      }
  }
}
export default otherHelpers