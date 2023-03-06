const nameEl = document.querySelector('#name')
const mobileEl = document.querySelector('#mobile')
const pincodeEl = document.querySelector('#pincode')
const localityEl = document.querySelector('#locality')
const addressEl = document.querySelector('#address')
const cityEl = document.querySelector('#city')
const stateEl = document.querySelector('#state')
const landmarkEl = document.querySelector('#landmark')

const form = document.querySelector('#add_address')

const checkName = () => {
  let valid = false

  const min = 3
  const max = 25

  const name = nameEl.value.trim()

  if (!isRequired(name)) {
    showError(nameEl, 'name cannot be blank.')
  } else if (!isBetween(name.length, min, max)) {
    showError(nameEl, `name must be between ${min} and ${max} characters.`)
  } else {
    showSuccess(nameEl)
    valid = true
  }
  return valid
}

const checkPincode = () => {
  let valid = false
  const min = 6; const max = 6
  const pincode = pincodeEl.value.trim()
  if (!isRequired(pincode)) {
    showError(pincodeEl, 'Pincode cannot be blank.')
  } else if (!isBetween(pincode.length, min, max)) {
    showError(pincodeEl, 'Pincode is not valid.')
  } else {
    showSuccess(pincodeEl)
    valid = true
  }
  return valid
}

const checkMobile = () => {
  let valid = false
  const mobile = mobileEl.value.trim()
  if (!isRequired(mobile)) {
    showError(mobileEl, 'Phone number cannot be blank.')
  } else if (!isMobileValid(mobile)) {
    showError(mobileEl, 'Mobile is not valid.')
  } else {
    showSuccess(mobileEl)
    valid = true
  }
  return valid
}

const checkLocality = () => {
  let valid = false
  const min = 3; const max = 20
  const locality = localityEl.value.trim()
  if (!isRequired(locality)) {
    showError(localityEl, 'Locality cannot be blank.')
  } else if (!isBetween(locality.length, min, max)) {
    showError(localityEl, `locality must between ${min}and ${max} `)
  } else {
    showSuccess(localityEl)
    valid = true
  }
  return valid
}
const checkAddress = () => {
  let valid = false
  const min = 10; const max = 50
  const address = addressEl.value.trim()
  if (!isRequired(address)) {
    showError(addressEl, 'Address cannot be blank.')
  } else if (!isBetween(address.length, min, max)) {
    showError(addressEl, `Address must between ${min}and ${max} `)
  } else {
    showSuccess(addressEl)
    valid = true
  }
  return valid
}
const checkCity = () => {
  let valid = false
  const min = 3; const max = 20
  const city = cityEl.value.trim()
  if (!isRequired(city)) {
    showError(cityEl, 'City cannot be blank.')
  } else if (!isBetween(city.length, min, max)) {
    showError(cityEl, `City must between ${min}and ${max} `)
  } else {
    showSuccess(cityEl)
    valid = true
  }
  return valid
}
const checkState = () => {
  let valid = false
  const min = 3; const max = 20
  const state = stateEl.value.trim()
  if (!isRequired(state)) {
    showError(stateEl, 'state cannot be blank.')
  } else if (!isBetween(state.length, min, max)) {
    showError(stateEl, `state must between ${min}and ${max} `)
  } else {
    showSuccess(stateEl)
    valid = true
  }
  return valid
}
const checkLandmark = () => {
  let valid = false
  const min = 3; const max = 20
  const landmark = landmarkEl.value.trim()
  if (!isRequired(landmark)) {
    showError(landmarkEl, 'Landmark cannot be blank.')
  } else if (!isBetween(landmark.length, min, max)) {
    showError(landmarkEl, `landmark must between ${min}and ${max} `)
  } else {
    showSuccess(landmarkEl)
    valid = true
  }
  return valid
}

const isMobileValid = (mobile) => {
  const re = /^(?:\+91|0)?[7-9]\d{9}$/
  return re.test(mobile)
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
  const isNameValid = checkName()
  const isMobileNoValid = checkMobile()
  const isPincodeValid = checkPincode()
  const isLocalityVAlid = checkLocality()
  const isAddressValid = checkAddress()
  const isCityValid = checkCity()
  const isStateValid = checkCity()
  const isLandMarkValid = checkLandmark()

  const isFormValid = isNameValid &&
        isMobileNoValid && isPincodeValid &&
        isLocalityVAlid && isAddressValid &&
        isCityValid && isStateValid && isLandMarkValid

  // submit to the server if the form is valid
  if (isFormValid) {
    console.log('form is valid')
    $.ajax({
      type: 'POST',
      url: '/addressManageMent',
      data: $('#add_address').serialize(),
      success: (response) => {
        if (response.addressFromCheckOut) {
          location.href = '/proceed-to-checkout'
        } else if (response.addressFromProfile) {
          location.href = '/profile-address'
        }
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
    case 'name':
      checkName()
      break
    case 'mobile':
      checkMobile()
      break
    case 'pincode':
      checkPincode()
      break
    case 'locality':
      checkLocality()
      break
    case 'address':
      checkAddress()
      break
    case 'city':
      checkCity()
      break
    case 'state':
      checkState()
      break
    case 'landmark':
      checkLandmark()
      break
  }
}))
