import { Client } from '@elastic/elasticsearch'
import collection from './collections.js'
import db from './connection.js'
const esClient = new Client({ node: 'http://localhost:9200' })


const createIndex = async () => {
    await esClient.indices.create({
      index: 'products',
      body: {
        mappings: {
          properties: {
            name: { type: 'text' },
            description: { type: 'text' },
            price: { type: 'float' },
            category: { type: 'text' }
          }
        }
      }
    })
  }
  
  

  const indexProducts = async () => {
    const products = db.get().collection(collection.PRODUCT_COLLECTION).fine({}).toArray()
  
    const body = products.flatMap(product => [
      { index: { _index: 'products' } },
      product
    ])
  
    await esClient.bulk({ body })
  }

  const searchProducts = async (query) => {
    const { body } = await esClient.search({
      index: 'products',
      body: {
        query: {
          multi_match: {
            query,
            fields: ['name', 'description', 'category']
          }
        }
      }
    })
  
    return body.hits.hits.map(hit => hit._source)
  }
  
  export {createIndex, indexProducts, searchProducts}