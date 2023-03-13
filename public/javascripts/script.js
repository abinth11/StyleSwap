
const addToCart = (productId) => {
  $.ajax({
    url: '/add-to-cart/' + productId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        let count = $('#cartCount').html()
        count = parseInt(count) + 1
        $('#cartCount').html(count)
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
      } else {
        document.getElementById(productId).innerHTML = quantity + count
        const total = response.total.total
        document.getElementById('totalAmout').innerHTML = `$${total}`
        console.log(response.total.total)

        const subtotalArr = response.subtotal
        for (let i = 0; i < subtotalArr.length; i++) {
          const subtotal = subtotalArr[i].subtotal
          const productId = subtotalArr[i]._id.toString()

          document.getElementById(`${productId}-subtotal`).innerHTML = `$${subtotal}`
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

// Add this function to your JavaScript file or script tag on the page
function hideModalButton() {
  setTimeout(function () {
    $('#myModal').modal('hide')
  }, 3000)
}

function setModalData(cartId, productId) {
  // Set the value of the input fields to the cartId and productId values
  document.getElementById('cartIdToDelete').value = cartId
  document.getElementById('productIdToDelete').value = productId
}

function deleteCartProductModal() {
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
