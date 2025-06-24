import express from 'express'
import { chatWithGPT } from '../services/chatService.js'

const router = express.Router()

// 통합된 채팅 엔드포인트
router.post('/chat', chatWithGPT)

export default router
