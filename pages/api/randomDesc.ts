import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
        // const result = await openai.createCompletion({
        //     model: 'text-curie-001',
        //     prompt: "Create a short, 1-15 words instagram photo description with or without hashtags.",
        //     max_tokens: 40,
        //     temperature: 1,
        // })

        // console.log(result.data.choices[0].text)
        // res.status(200).json({ result: result.data.choices[0].text })
        res.status(200).json({ 
            desc: 'no filter no filter no filter no filter no filter no filter'
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: e })
    }
}
