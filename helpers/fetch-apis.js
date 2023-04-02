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
    }
}

export default fetchcallHelpers