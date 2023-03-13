const Handlebars = require('handlebars')
Handlebars.registerHelper('inc', function (value, options) {
  return parseInt(value) + 1
})

Handlebars.registerHelper('eq', function (a, b) {
  return a === b
})

Handlebars.registerHelper('or', function (a, b, options) {
  if (a || b) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

Handlebars.registerHelper('multiply', function (a, b) {
  return a * b
})

Handlebars.registerHelper('-', function (a, b) {
  return a - b
})
