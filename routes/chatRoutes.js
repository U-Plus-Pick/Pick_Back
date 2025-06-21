import express from 'express'
import { planChatWithGPT } from '../services/chatService.js'

const router = express.Router()

router.post('/chat', async (req, res) => {
  const { message } = req.body

  if (!message) {
    return res.status(400).json({ error: '메시지가 필요합니다.' })
  }

  try {
    const reply = await planChatWithGPT(message)
    res.json({ reply })
  } catch (err) {
    console.error('채팅 처리 오류:', err.message)
    res.status(500).json({ error: 'GPT 처리 중 오류 발생' })
  }
})

export default router
