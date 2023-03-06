
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
        alert('Product reomove from your cart')
        location.reload()
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
        alert('deleted item')
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
