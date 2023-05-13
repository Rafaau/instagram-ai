import Redis from 'ioredis'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    let isExceeded = false

    try {
        const redis = new Redis(process.env.REDIS_URL!)
        const count = Number(await redis.get('openai_requests'))

        if (count >= Number(process.env.DAILY_REQUESTS_LIMIT))     
            isExceeded = true

        res.status(200).json({ isExceeded })
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: e })
    }
}
