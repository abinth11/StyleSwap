import collection from "../config/collections.js"
import db from "../config/connection.js"
import { ObjectId } from "mongodb"

const fetchcallHelpers = {
    getSizeAndColor : async (productId)=>{
        try {
            const parent =await db.get().collection(collection.PRODUCT_TEMPLATE).findOne({"availabeColors.id": ObjectId(productId)})
            console.log(parent)
            return parent
        } catch (error) {
            console.log(error)  
        }
    },
    checkOutofStock: async (productId) => {
        try {
            const product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id : ObjectId(productId)})
            if (product.product_quantity <= 0) {
                return {
                    stock:false,
                    Message:"Product is out of stock"
                }
            } 
            return {
                stock:true,
                Message:"Stock is available"
            }
        } catch(error) {
            console.log(error)
        }
    }
}

export default fetchcallHelpers