import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config() // .env 로드

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // .env에서 불러온 API 키
})

export default openai
