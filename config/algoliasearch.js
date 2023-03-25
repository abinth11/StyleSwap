import db from "./connection.js"
import algoliasearch from "algoliasearch"
import collection from "./collections.js"
// eslint-disable-next-line no-undef
const applicationId = process.env.ALGOLIA_APPLICATION_ID
// eslint-disable-next-line no-undef
const apikey = process.env.ALGOLIA_ADMIN_API_KEY
const client = algoliasearch(applicationId, apikey)
const index = client.initIndex("searchIndex")

// Index data only once when the app starts
async function createIndexToSearch() {
  try {
    await db.connect()
    db.get()
    .collection(collection.PRODUCT_COLLECTION)
    .find({})
    .toArray()
    .then((objectsToIndex) => {
      index.saveObjects(objectsToIndex, {
        autoGenerateObjectIDIfNotExist: true,
        objectID: (product) => product._id.toString(),
      })
    }) 
    .catch((error) => {
      console.log("Error indexing data:", error)
    })    
  } catch (err) {
    console.error(err)
  }
}

  // Search function that uses the pre-indexed data
 const searchWithAlgolia = async (query) => {
  try {
    console.log(query)
    const results = await index.search({
      query,
      // You can also specify other search parameters here:
      // hitsPerPage: 10,
      // page: 0,
      // filters: "category:shoes",
    })
    console.log(results)
  } catch (error) {
    console.log("Error searching with Algolia:", error)
  }
}

export {createIndexToSearch,searchWithAlgolia}




