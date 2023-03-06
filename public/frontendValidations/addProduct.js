const titleEl = document.querySelector('#product_title')
const skuEl = document.querySelector('#product_sku')
const colorEl = document.querySelector('#product_color')
const sizeEl = document.querySelector('#product_size')
const brandEl = document.querySelector('#product_brand')
const descriptionEl = document.querySelector('#description')
const priceEl = document.querySelector('#product_price')
const warrantyEl = document.querySelector('#product_warranty')
const returnEl = document.querySelector('#product_return')
const quantityEl = document.querySelector('#product_quantity')
const categoryEl = document.querySelector('#category')
const deliveryEl = document.querySelector('#product-cat')

const form = document.querySelector('#add-product-3')

const checkTitle = () => {
  let valid = false

  const min = 3
  const max = 25

  const title = titleEl.value.trim()

  if (!isRequired(title)) {
    showError(titleEl, 'Title cannot be blank.')
  } else if (!isBetween(title.length, min, max)) {
    showError(titleEl, `Title must be between ${min} and ${max} characters.`)
  } else {
    showSuccess(titleEl)
    valid = true
  }
  return valid
}

const checkSku = () => {
  let valid = false
  const min = 3; const max = 9
  const sku = skuEl.value.trim()
  if (!isRequired(sku)) {
    showError(skuEl, 'sku cannot be blank.')
  } else if (!isBetween(sku.length, min, max)) {
    showError(skuEl, 'sku is not valid.')
  } else {
    showSuccess(skuEl)
    valid = true
  }
  return valid
}

const checkColor = () => {
  let valid = false
  const min = 2; const max = 4
  const color = colorEl.value.trim()
  if (!isRequired(color)) {
    showError(colorEl, 'color cannot be blank.')
  } else if (!isBetween(color.length, min, max)) {
    showError(colorEl, 'color is not valid')
  } else {
    showSuccess(colorEl)
    valid = true
  }
  return valid
}

const checkSize = () => {
  let valid = false
  const min = 2; const max = 5
  const size = sizeEl.value.trim()
  if (!isRequired(size)) {
    showError(sizeEl, 'size cannot be blank.')
  } else if (!isBetween(size.length, min, max)) {
    showError(sizeEl, 'size is not valid')
  } else {
    showSuccess(sizeEl)
    valid = true
  }
  return valid
}
const checkBrand = () => {
  let valid = false
  const min = 10; const max = 50
  const brand = brandEl.value.trim()
  if (!isRequired(brand)) {
    showError(brandEl, 'Brand cannot be blank.')
  } else if (!isBetween(brand.length, min, max)) {
    showError(brandEl, 'Brand is not valid')
  } else {
    showSuccess(brandEl)
    valid = true
  }
  return valid
}
const checkDescription = () => {
  let valid = false
  const min = 3; const max = 20
  const description = descriptionEl.value.trim()
  if (!isRequired(description)) {
    showError(descriptionEl, 'Description cannot be blank.')
  } else if (!isBetween(description.length, min, max)) {
    showError(descriptionEl, 'Invalid description')
  } else {
    showSuccess(descriptionEl)
    valid = true
  }
  return valid
}
const checkPrice = () => {
  let valid = false
  const min = 1; const max = 20
  const price = priceEl.value.trim()
  if (!isRequired(price)) {
    showError(priceEl, 'price cannot be blank.')
  } else if (!isBetween(price.length, min, max)) {
    showError(priceEl, 'Invalid price')
  } else {
    showSuccess(priceEl)
    valid = true
  }
  return valid
}
const checkWarranty = () => {
  let valid = false
  const min = 3; const max = 20
  const warranty = warrantyEl.value.trim()
  if (!isRequired(warranty)) {
    showError(warrantyEl, 'Warranty cannot be blank.')
  } else if (!isBetween(warranty.length, min, max)) {
    showError(warrantyEl, 'Invalid warranty ')
  } else {
    showSuccess(warrantyEl)
    valid = true
  }
  return valid
}
const checkReturn = () => {
  let valid = false
  const min = 3; const max = 20
  const returns = returnEl.value.trim()
  if (!isRequired(returns)) {
    showError(returnEl, 'this field cannot be blank.')
  } else if (!isBetween(returns.length, min, max)) {
    showError(returnEl, 'Invalid field ')
  } else {
    showSuccess(returnEl)
    valid = true
  }
  return valid
}

const checkQuantity = () => {
  let valid = false
  const min = 1; const max = 20
  const quantity = quantityEl.value.trim()
  if (!isRequired(quantity)) {
    showError(quantityEl, 'this field cannot be blank.')
  } else if (!isBetween(quantity.length, min, max)) {
    showError(quantityEl, 'Invalid field ')
  } else {
    showSuccess(quantityEl)
    valid = true
  }
  return valid
}
const checkCategory = () => {
  let valid = false
  const min = 3; const max = 20
  const warranty = categoryEl.value.trim()
  if (!isRequired(warranty)) {
    showError(categoryEl, 'this field cannot be blank.')
  } else if (!isBetween(categoryEl.length, min, max)) {
    showError(categoryEl, 'Invalid field ')
  } else {
    showSuccess(categoryEl)
    valid = true
  }
  return valid
}
const checkDelivery = () => {
  let valid = false
  const deliveryOptions = document.getElementsByName('delivery')
  let isAtLeastOneSelected = false
  for (let i = 0; i < deliveryOptions.length; i++) {
    if (deliveryOptions[i].checked) {
      isAtLeastOneSelected = true
      break
    }
  }
  if (!isAtLeastOneSelected) {
    showError(deliveryEl, 'this field cannot be blank.')
  } else {
    valid = true
  }
  return valid
}

const isRequired = value => value !== ''
const isBetween = (length, min, max) => !(length < min || length > max)

const showError = (input, message) => {
  // get the form-field element
  const formField = input.parentElement
  // add the error class
  formField.classList.remove('success')
  formField.classList.add('error')

  // show the error message
  const error = formField.querySelector('small')
  error.textContent = message
}

const showSuccess = (input) => {
  // get the form-field element
  const formField = input.parentElement

  // remove the error class
  formField.classList.remove('error')
  formField.classList.add('success')

  // hide the error message
  const error = formField.querySelector('small')
  error.textContent = ''
}

form.addEventListener('submit', function (e) {
  // prevent the form from submitting
  e.preventDefault()

  // validate fields
  const isTitleValid = checkTitle()
  const isSkuValid = checkSku()
  const isColorValid = checkColor()
  const isSizeValid = checkSize()
  const isBrandValid = checkBrand()
  const isDescriptionValid = checkDescription()
  const isPriceValid = checkPrice()
  const isWarrantyValid = checkWarranty()
  const isReturnValid = checkReturn()
  const isQuantityValid = checkQuantity()
  const isCategoryValid = checkCategory()
  const isDeliveryValid = checkDelivery()

  const isFormValid = isTitleValid && isSkuValid &&
  isColorValid && isSizeValid && isBrandValid && isDescriptionValid &&
  isPriceValid && isWarrantyValid && isReturnValid && isQuantityValid &&
  isCategoryValid
  // submit to the server if the form is valid
  if (isFormValid) {
    console.log('form is valid')
    $.ajax({
      type: 'POST',
      url: '/admin/addProduct3',
      data: $('#add-product-3').serialize(),
      success: (response) => {
        location.reload()
        //   if(response.addressFromCheckOut){
        //     location.href='/proceed-to-checkout'
        //   }else if(response.addressFromProfile){
        //     location.href='/profile-address'
        //   }
      }
    })
  }
})

const debounce = (fn, delay = 500) => {
  let timeoutId
  return (...args) => {
    // cancel the previous timer
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    // setup a new timer
    timeoutId = setTimeout(() => {
      fn.apply(null, args)
    }, delay)
  }
}

form.addEventListener('input', debounce(function (e) {
  switch (e.target.id) {
    case 'product_title':
      checkTitle()
      break
    case 'product_sku':
      checkSku()
      break
    case 'product_color':
      checkColor()
      break
    case 'product_size':
      checkSize()
      break
    case 'product_brand':
      checkBrand()
      break
    case 'description':
      checkDescription()
      break
    case 'product_price':
      checkPrice()
      break
    case 'product_warranty':
      checkWarranty()
      break
    case 'product_return':
      checkReturn()
      break
    case 'product_quantity':
      checkQuantity()
      break
    case 'category':
      checkCategory()
      break
    // case 'product-cat-1':
    // case 'product-cat-2':
    // case 'product-cat-3':
    // case 'product-cat-4':
    // case 'product-cat-5':
    // case 'product-cat-6':
    //   checkDelivery()
    //   break
  }
}))
