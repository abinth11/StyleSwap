import collection from "../contants/collections.js"
import db from "../config/database.js"
import { ObjectId } from "mongodb"

const fetchcallHelpers = {
    getSizeAndColor : async (productId)=>{
        try {
            const parent =await db.get().collection(collection.PRODUCT_TEMPLATE).findOne({"availabeColors.id": ObjectId(productId)})
            return parent
        } catch (error) {
            throw new Error(error)
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
            throw new Error(error)
        }
    }
}

export default fetchcallHelpers