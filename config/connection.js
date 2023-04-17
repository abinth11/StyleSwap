import { MongoClient } from 'mongodb'

const state = {
  db: null
}

 export const connect = async () => {
  const url = process.env.DB_URL ?? 'mongodb+srv://abinth250:nYLxpl4cJ8e4iIs6@cluster0.ml4r8cb.mongodb.net/test'
  const dbName = 'StyleSwap'
  return MongoClient.connect(url)
    .then((client) => {
      state.db = client.db(dbName)
      return state.db
    })
    .catch((err) => {
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

