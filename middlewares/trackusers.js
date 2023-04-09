import db from "../config/connection.js"
import collection from "../config/collections.js"
export const trackVisitors = (req, res, next) => {
  const ip = req.ip
  const now = new Date()
  const month = now.toISOString().substr(0, 7) // Get YYYY-MM format
  const nowISO = now.toISOString()

  // Find visitor document for this month and IP
  db.get().collection(collection.VISITORS).findOne({ ip, month }, (err, doc) => {
    if (err) {
      return next()
    }
    if (doc) {
      // Visitor document exists, update date
      db.get().collection(collection.VISITORS).updateOne(
        { _id: doc._id },
        { $set: { updatedAt: nowISO } },
        (err) => {
          if (err) {
            throw new Error(err)
          }
          next()
        }
      )
    } else {
      // Visitor document does not exist, insert new document
      db.get().collection(collection.VISITORS).insertOne(
        { ip, month, createdAt: nowISO, updatedAt: nowISO },
        (err) => {
          if (err) {
            throw new Error(err)
          }
          next()
        }
      )
    }
  })
}
