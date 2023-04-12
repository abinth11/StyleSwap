/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

// eslint-disable-next-line no-unused-vars
const addToCart = (from,proId) => {
  let productId = document.getElementById('colorSelect')?.value
  if(productId== undefined){
    productId = proId
  }
  // eslint-disable-next-line no-undef
  $.ajax({
    url: `/add-to-cart?productId=${productId}&from=${from}`,
    method: 'get',
    success: (response) => {
      if(!response.status){
        Swal.fire({
          text:"Oops! Something went wrong..!",
          showConfirmButton:true
        })
      }
      if(response.from == 'wishlist') {
        Swal.fire({
          icon: 'success',
          title: 'Successfully moved your item into cart...!',
          showConfirmButton: true,
          confirmButtonColor: 'red',
          confirmButtonText: 'OK',
          customClass: {
            icon: 'custom-icon-class'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            location.reload()
          }
        })
        
      }else {
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
        let cartCount = document.getElementById('cartCount')?.innerText
        cartCount = parseInt(cartCount)
        document.getElementById('cartCount').innerHTML = cartCount + 1
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


const addToWishList = (productId) => {
  // eslint-disable-next-line no-undef
  $.ajax({
    url: '/add-to-wishlist/' + productId,
    method: 'get',
    success: (response) => {
      if(!response.status){
        location.href= '/userLogin'
      }else {
        let currCount = document.getElementById('wish-count').innerText
        currCount = parseInt(currCount)
        response.removed
        ?document.getElementById('wish-count').innerHTML = currCount-1
        : document.getElementById('wish-count').innerHTML = currCount+1
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

showDeleteConfirmation = (productId) =>{
  Swal.fire({
    title: 'Are you sure?',
    text: 'You are about to remove this item from your wishlist.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteFromWishlist(productId)
    }
  })
}
const deleteFromWishlist = (productId) =>{
  $.ajax({
    url:"/user-wishlist/remove-item/"+productId,
    type:"DELETE",
    success:(response) =>{
      if(response.acknowledged){
        location.reload()
      } else {
        Swal.fire({
          text:"Oops! Something went wrong",
          showConfirmButton:true,
        })
      }
    },
    error:(response) =>{
      Swal.fire({
        text:"Oops! Something went wrong",
        showConfirmButton:true,
      })
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
  cancellOrder(orderId, reason)
}

const cancellOrder = (orderId, reason) => {
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
