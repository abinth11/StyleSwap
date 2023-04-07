/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

// eslint-disable-next-line no-unused-vars
const addToCart = () => {
  const productId = document.getElementById('colorSelect').value
  // eslint-disable-next-line no-undef
  $.ajax({
    url: '/add-to-cart/' + productId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        $("#cartModal").modal("hide") // close the modal
        $(".modal-backdrop").fadeOut() // fade out the overlay
                Swal.fire({
          icon: 'success',
          title: 'Item added to cart!',
          showConfirmButton: true,
          confirmButtonColor: 'red',
          confirmButtonText: 'OK',
          customClass: {
            icon: 'custom-icon-class'
          }
        })  
       let count = $('#cartCount').html()
        count = parseInt(count) + 1
        $('#cartCount').html(count)
      }
    },
    error: function(xhr, status, error) {
      if (xhr.status === 500) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Internal server error: ' + xhr.responseJSON.Message
        })
       } else {
        alert('Error: ' + error)
      }
    }
  })
}

const changeQuantity = (cartId, productId, userId, count) => {
  const quantity = parseInt(document.getElementById(productId).innerHTML)
  $.ajax({
    type: 'POST',
    url: '/change-quantity',
    data: {
      cartId,
      productId,
      count,
      quantity,
      userId
    },
    success: (response) => {
      if (response.removed) {
        // Show the "Product Removed" modal
        $('#productRemovedModal').modal('show')

        // Reload the page after the modal is closed
        $('#productRemovedModal').on('hidden.bs.modal', function () {
          location.reload()
        })
      }else if (!response.status){
        Swal.fire({
          icon: 'warning',
          title: 'Out of stock!',
          text: 'The requested quantity is not available.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#8B4000',
          focusConfirm: '#FF0000',
          timer: 3000
        })
      } else {
        document.getElementById(productId).innerHTML = quantity + count
        let total = response.total.total
        total = formatMoney(total)
        document.getElementById('totalAmout').innerHTML = total
        const subtotalArr = response.subtotal
        for (let i = 0; i < subtotalArr.length; i++) {
          let subtotal = subtotalArr[i].subtotal
          subtotal = formatMoney(subtotal)
          const productId = subtotalArr[i]._id.toString()

          document.getElementById(`${productId}-subtotal`).innerHTML = subtotal
        }
      }
    },
    error: function (data) {
      alert(data)
      console.log(JSON.stringify(data))
    }
  })
}

const deleteCartProduct = (cartId, productId) => {
  $.ajax({
    type: 'PUT',
    url: '/remove-cart-product',
    data: {
      cartId,
      productId
    },
    success: (response) => {
      if (response.removed) {
        // alert('deleted item')
        location.reload()
      } else {
        alert('deletion failed')
      }
    },
    error: (err) => {
      alert(err)
    }
  })
}


function setModalData (cartId, productId) {
  // Set the value of the input fields to the cartId and productId values
  document.getElementById('cartIdToDelete').value = cartId
  document.getElementById('productIdToDelete').value = productId
}

function deleteCartProductModal () {
  // Get the cartId and productId values from the input fields
  const cartId = document.getElementById('cartIdToDelete').value
  const productId = document.getElementById('productIdToDelete').value

  // Delete the cart product using the cartId and productId values
  deleteCartProduct(cartId, productId)
}

const setOrderCancellData = (orderId) => {
  document.getElementById('orderId').value = orderId
}
const cancellOrderModal = () => {
  const orderId = document.getElementById('orderId').value
  const reason = document.getElementById('reason').value
  console.log(orderId,reason)
  cancellOrder(orderId, reason)
}

const cancellOrder = (orderId, reason) => {
  console.log(reason)
  $.ajax({
    url: '/cancell-order',
    data: {
      orderId,
      reason
    },
    method: 'post',
    success: (res) => {
      location.reload()
    }
  })
}

function formatMoney(amount) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  })
  return formatter.format(amount)
}


// // Example of adding funds to the wallet
// $('.modal-body form').submit(function (event) {
//   event.preventDefault()
//   const amount = parseFloat($('#amount').val())
//   const currentBalance = parseFloat($('.balance h3').text().replace('$', ''))
//   if (isNaN(amount)) {
//     alert('Please enter a valid amount.')
//     return
//   }
//   const newBalance = currentBalance + amount
//   $('.balance h3').text('$' + newBalance.toFixed(2))
//   $('#amount').val('')
//   alert('Funds added successfully.')
// })

// // get a reference to the search input field
// const searchInput = document.getElementById('search-input')

// // listen for the user to submit the search form
// document.getElementById('search-form').addEventListener('submit', (event) => {
//   event.preventDefault() // prevent the form from submitting normally
//   const searchQuery = searchInput.value.trim() // get the user's search query
//   if (searchQuery.length > 0) {
//     // construct the search URL with the search query as a parameter
//     const searchUrl = `/search-products?q=${encodeURIComponent(searchQuery)}`
//     window.location.href = searchUrl // redirect the user to the search results page
//   }
// })
