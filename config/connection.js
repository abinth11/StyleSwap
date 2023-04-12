import { MongoClient } from 'mongodb'

const state = {
  db: null
}

 export const connect = async () => {
 
  const url = process.env.DB_URL
  const dbName = process.env.DB_NAME
  return MongoClient.connect(url)
    .then((client) => {
      state.db = client.db(dbName)
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

