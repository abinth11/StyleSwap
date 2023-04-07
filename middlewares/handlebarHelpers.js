export const helpers = {
  formatDate: function (dateString) {
    const date = new Date(dateString)
    const options = { month: "long", day: "numeric", year: "numeric" }
    return date.toLocaleDateString("en-US", options)
  },
  formatDateTwo: function (dateString) {
    const date = new Date(dateString)
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    }
    return date.toLocaleString("en-US", options)
  },
  inc: (value) => {
    return parseInt(value) + 1
  },
  eq: (a, b) => {
    return a === b
  },
  or: function (a, b, options) {
    if (a || b) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },
  gt: function (a, b, options) {
    if (a > b) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },
   lt: function (a, b, options) {
    if (a < b) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  } ,
  not: function (value) {
    return !value
  },
  multiply: (a, b) => {
    const price = convertRupeeStringToNumber(a)
    return price * b
  },
  subtract: (a, b) => {
    return a - b
  },
  notNull: (value, options) => {
    if (value !== null) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },
  JSONstringify: (obj) => {
    return JSON.stringify(obj)
  },
  formatCurrency: (value) => {
    // Check if value is a number
    if (isNaN(value)) {
      return ""
    }
    // Format the value into a currency string with INR symbol
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    })
    return formatter.format(value)
  },
  includes: (array, value) => {
    return array.includes(value)
  },
  lowerCase: (str) => {
    return str.toLowerCase()
  },

  // add more helper functions here...
}

function convertRupeeStringToNumber(rupeeString) {
  // Convert the string to a String object and remove the rupee symbol and any commas
  const numericString = String(rupeeString).replace(/₹|,/g, "")

  // Convert the string to a number and return it
  return parseFloat(numericString)
}
