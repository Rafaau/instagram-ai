import { GirlCommentPlaceholders, ManCommentPlaceholders } from '@component/lib/placeholders'
import { GirlCommentPrompts, ManCommentPrompts } from '@component/lib/prompts'
import { configuration } from '@component/utils/apiHelpers'
import Redis from 'ioredis'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ChatCompletionRequestMessage, OpenAIApi } from 'openai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const input = req.query.input as string
    const history = JSON.parse(req.query.history as string || '[]')

    const messages: ChatCompletionRequestMessage[] = []
    messages.push({ 
        role: 'system', 
        content: "You are an AI model that simulates a real person in an Instagram direct message conversation. The user expects to be talking to a human friend. Do not refer to yourself as an AI or mention that you don't have feelings or that you can't do physical activities. Write short messages, rarely with emojis and slang." 
    })
    
    for (const [input_text, completion_text] of history) {
        messages.push({ role: 'user', content: input_text })
        messages.push({ role: 'assistant', content: completion_text })
    }
    
    messages.push({ role: 'user', content: input })

    const openai = new OpenAIApi(configuration)

    const redis = new Redis(process.env.REDIS_URL!)
    const count = await redis.incr('openai_requests')
    if (count == 1)
        await redis.expire('openai_requests', 86400) // 24 hours

    try {
        if (count >= Number(process.env.DAILY_REQUESTS_LIMIT)) {
            const result = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 1
            })

            res.status(200).json({ content: result.data.choices[0].message?.content })
        } else {
            res.status(200).json({ content: "Hey, I'm kinda busy atm. DM me later:)" })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: e })
    }
}
