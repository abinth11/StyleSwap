import db from "./connection.js"
import algoliasearch from "algoliasearch"
import collection from "./collections.js"

const applicationId = 'EX92C5LRC3'
const apikey = '5c8c092ed143e3da3f9b27c20dc102a9'

const client = algoliasearch(applicationId, apikey)
const index = client.initIndex("search_index")

const formatForAlgolia = (doc) => {
  const { _id, product_title, product_sku, product_color, product_size, product_brand, product_description, product_price, product_warranty, product_return, product_quantity, product_category, delivery, offerPrice, isActive, images, offerStartDate, offerPercentage, addedAt } = doc

  return {
    objectID: _id.toString(),
    title: product_title,
    sku: product_sku,
    color: product_color,
    size: product_size,
    brand: product_brand,
    description: product_description,
    price: product_price,
    warranty: product_warranty,
    returnPolicy: product_return,
    quantity: product_quantity,
    category: product_category,
    deliveryOptions: delivery,
    offerPrice,
    isActive,
    image1: images.image1,
    image2: images.image2,
    image3: images.image3,
    offerStartDate,
    offerPercentage,
    addedAt: addedAt.toISOString(),
  }
} 

const createIndexForAlgolia = async () => {
  try {
    const data = await db.get().collection(collection.PRODUCT_COLLECTION).find({}).toArray()
    const formattedData = data.map(formatForAlgolia)
    const result = await index.saveObjects(formattedData)
    return result
  } catch (error) {
    console.log(error)
  }
}

const searchWithAlgolia = async (query) => {
  try {
    const searchParams = {
      query: query.trim(),
      hitsPerPage: 10,
    }
    const result = await index.search(searchParams)
    console.log(result)
    return result
  } catch (error) {
    console.log(error)
  }
}

export {createIndexForAlgolia, searchWithAlgolia}




