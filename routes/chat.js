import express from 'express'
import { gptChatHandler } from '../services/chatService.js'

const router = express.Router()
router.post('/chat', gptChatHandler)

export default router
