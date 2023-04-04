import Redis from 'redis'

const redisClient = Redis.createClient({
    connect_timeout: 5000, // 5 seconds timeout
    retry_max_delay: 1000, // 1 second maximum delay between retries
  })

export const redisConnect = async ()=> {
    await redisClient.connect()
}

// const DEFAULT_EXPIRATION = 50000
// export const setOrGetRedisCache = async (key,cb) => {
//     return new Promise ((resolve, reject ) => {
//         redisClient.get((key,async (error, data)=>{
//             if(error) {
//                 return reject(error)
//             }
//             if(data!=null) {
//                 return resolve(JSON.parse(data))
//             }
//             const newData = await cb()
//             redisClient.setEx(key,DEFAULT_EXPIRATION,JSON.stringify(newData))
//             resolve(newData)
//         }))
//     })
// }

// return await setOrGetRedisCache(searchTerm, async () => {
//     const results = await db
//       .get()
//       .collection(collection.PRODUCT_COLLECTION)
//       .find(
//         { $text: { $search: searchTerm } },
//         { score: { $meta: "textScore" } }
//       )
//       .sort({ score: { $meta: "textScore" } })
//       .toArray() // Add this to convert the MongoDB cursor to an array
//     return results
//   })
 
export default redisClient
