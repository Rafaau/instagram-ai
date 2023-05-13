import { BioPlaceholders } from '@component/lib/placeholders'
import { ManBioPrompts, GirlBioPrompts } from '@component/lib/prompts'
import { configuration } from '@component/utils/apiHelpers'
import Redis from 'ioredis'
import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAIApi } from 'openai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const gender = req.query.gender as string

    const openai = new OpenAIApi(configuration)

    const redis = new Redis(process.env.REDIS_URL!)
    const count = await redis.incr('openai_requests')
    if (count == 1)
        await redis.expire('openai_requests', 86400) // 24 hours

    try {
        if (count <= Number(process.env.DAILY_REQUESTS_LIMIT)) {
            const prompts = gender == 'female' ? GirlBioPrompts : ManBioPrompts
            const random = Math.floor(Math.random() * prompts.length)
            const result = await openai.createCompletion({
                model: 'text-davinci-001',
                prompt: prompts[random],
                max_tokens: 30,
                temperature: 1,
            })

            res.status(200).json({ bio: result.data.choices[0].text })
        } else {
            const placeholders = gender == 'female' ? BioPlaceholders : BioPlaceholders
            const random = Math.floor(Math.random() * placeholders.length)
            res.status(200).json({ bio: placeholders[random] })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: e })
    }
}
