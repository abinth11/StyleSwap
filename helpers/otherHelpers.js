const otherHelpers = {
  currencyFormatter: (price) => {
    const amount = price
    const formattedAmount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
    return formattedAmount
  }
}
export default otherHelpers