
const addToCart=(productId)=>{
    $.ajax({
        url:'/add-to-cart/'+productId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cartCount').html();
                count=parseInt(count)+1;
                $('#cartCount').html(count);
            }
        }       
    })
}

const changeQuantity=(cartId,productId,userId,count)=>{
   let quantity=parseInt(document.getElementById(productId).innerHTML)
    $.ajax({
        type:'POST',
        url:'/change-quantity',
        data:{
            cartId:cartId,
            productId:productId,
            count:count,
            quantity:quantity,
            userId:userId
        },
        success:(response)=>{
            if(response.removed){
                alert("Product reomove from your cart");
                location.reload();
            }else{
                console.log(response.subtotal)
                console.log(productId);
                document.getElementById(productId).innerHTML=quantity+count;
                document.getElementById('totalAmout').innerHTML=response.total.total;
                console.log(response.total.total)
                
                let subtotalArr = response.subtotal;

    for (let i = 0; i < subtotalArr.length; i++) {
      let subtotal = subtotalArr[i].subtotal;
      let productId = subtotalArr[i]._id.toString();

      document.getElementById(`${productId}-subtotal`).innerHTML = `$${subtotal}`;
    }



               
            }
        },
        error: function(data){
            alert(data);
            console.log(JSON.stringify(data));
        }
    })
}

const deleteCartProduct=(cartId,productId)=>{
    $.ajax({
        type:"PUT",
        url:"/remove-cart-product",
        data:{
            cartId:cartId,
            productId:productId
        },
        success:(response)=>{
            if(response.removed){
                alert("deleted item")
                location.reload();
            }else{
                alert("deletion failed");
            }
        },
        error:(err)=>{
            alert(err);
        }
    })
}



