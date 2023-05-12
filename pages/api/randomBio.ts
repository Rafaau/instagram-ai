import { BioPlaceholders } from '@component/lib/placeholders'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const gender = req.query.gender as string

    const configuration = new Configuration({
        organization: process.env.OPENAI_ORGANIZATION,
        apiKey: process.env.OPENAI_API_KEY,
    })

    const openai = new OpenAIApi(configuration)

    // const redis = new Redis(process.env.REDIS_URL!)
    // const count = await redis.incr('openai_requests')
    // if (count == 1)
    //     await redis.expire('openai_requests', 86400) // 24 hours

    try {
        // if (count < 100) {
            // const result = await openai.createCompletion({
            //     model: 'text-curie-001',
            //     prompt: "Create a short, 1-8 words positive comment for a photo.",
            //     max_tokens: 30,
            //     temperature: 1,
            // })

            // res.status(200).json({ result: result.data.choices[0].text })
        // } else {
            const placeholders = gender == 'female' ? BioPlaceholders : BioPlaceholders
            const random = Math.floor(Math.random() * placeholders.length)
            res.status(200).json({ bio: placeholders[random] })
        // }
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: e })
    }
}
