import { MongoClient } from 'mongodb'

const state = {
  db: null
}

 export const connect = async () => {
  const url = 'mongodb://localhost:27017'
  const dbname = 'shoppingCart'
  return MongoClient.connect(url)
    .then((client) => {
      state.db = client.db(dbname)
      return state.db
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err)
      throw err // rethrow the error to be caught by the caller
    })
}

  const get = () => {
  return state.db
}

const db = {
  connect,
  get,
  state
}

export default db

