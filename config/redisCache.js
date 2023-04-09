import Redis from 'redis'

const redisClient = Redis.createClient({
    connect_timeout: 5000, // 5 seconds timeout
    retry_max_delay: 1000, // 1 second maximum delay between retries
  })

export const redisConnect = async ()=> {
    await redisClient.connect()
}

export default redisClient
