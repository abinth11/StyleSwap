import { MongoClient } from 'mongodb'
import ENV_VARS from '../envConfig.js'

const state = {
  db: null
}

 export const connect = async () => {
  const url = ENV_VARS.DB_URL
  const dbName = ENV_VARS.DB_NAME
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

