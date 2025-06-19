import express from 'express'
import { bundleDiscountChatWithGPT, membershipChatWithGPT } from '../services/chatService.js'

const router = express.Router()
router.post('/chat', bundleDiscountChatWithGPT)

router.post('/', async (req, res) => {
  try {
    const { message } = req.body
    const response = await membershipChatWithGPT(message)

    res.json({
      success: true,
      response: response,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router
