const mongoClient = require('mongodb').MongoClient

const state = {
  db: null
}

module.exports.connect = () => {
  const url = 'mongodb://localhost:27017'
  const dbname = 'shoppingCart'
  return mongoClient.connect(url)
    .then((client) => {
      state.db = client.db(dbname)
      return state.db
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err)
      throw err // rethrow the error to be caught by the caller
    })
}

module.exports.get = () => {
  return state.db
}
