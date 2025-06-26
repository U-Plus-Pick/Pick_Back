import express from 'express'
import { chatWithGPT } from '../services/chatService.js'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import mongoose from 'mongoose'
import chatroomSchema from '../models/ChatRoom.js'

const Chatroom = mongoose.models.Chatroom || mongoose.model('Chatroom', chatroomSchema)

const router = express.Router()

// 통합된 채팅 엔드포인트
router.post('/chat', chatWithGPT)

// 새 채팅방 생성 API
router.post('/create-room', authMiddleware, async (req, res) => {
  console.log('=== 새 채팅방 생성 API 호출됨 ===')

  try {
    const { title, messages } = req.body
    const user_email = req.user.email

    // 사용자 존재 확인
    const user = await User.findOne({ email: user_email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      })
    }

    // 새 채팅방 생성
    const chatroom_id = Date.now()
    const newMessages = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'bot',
      message: msg.text,
      timestamp: msg.timestamp || new Date(),
    }))

    const chatroom = new Chatroom({
      chatroom_id,
      user_email,
      chat_message: newMessages,
      chatroom_title: title || `채팅 ${chatroom_id}`,
      started_at: new Date(),
    })

    await chatroom.save()
    console.log('새 채팅방 생성 완료, ID:', chatroom_id)

    res.status(200).json({
      success: true,
      chatroom_id,
      message: '새 채팅방이 생성되었습니다.',
    })
  } catch (error) {
    console.error('채팅방 생성 오류:', error)
    res.status(500).json({
      success: false,
      message: '채팅방 생성 중 오류가 발생했습니다.',
      error: error.message,
    })
  }
})

// 채팅 메시지 저장 API
router.post('/insert-messages', authMiddleware, async (req, res) => {
  console.log('=== 채팅 메시지 저장 API 호출됨 ===')

  try {
    const { chatroom_id, messages, chatroom_title } = req.body
    const user_email = req.user.email

    if (!chatroom_id) {
      return res.status(400).json({
        success: false,
        message: '채팅방 ID가 필요합니다.',
      })
    }

    // 사용자 존재 확인
    const user = await User.findOne({ email: user_email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      })
    }

    // 채팅방 찾기 (사용자 이메일과 chatroom_id로)
    const chatroom = await Chatroom.findOne({
      chatroom_id,
      user_email,
    })

    if (!chatroom) {
      return res.status(404).json({
        success: false,
        message: '채팅방을 찾을 수 없습니다.',
      })
    }

    // 메시지 업데이트
    const newMessages = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'bot',
      message: msg.text,
      timestamp: msg.timestamp || new Date(),
    }))

    chatroom.chat_message = newMessages // 전체 메시지 교체

    // 제목이 제공되면 업데이트
    if (chatroom_title) {
      chatroom.chatroom_title = chatroom_title
    }

    await chatroom.save()
    console.log('채팅방 메시지 업데이트 완료, ID:', chatroom_id)

    res.status(200).json({
      success: true,
      message: '채팅 메시지가 성공적으로 저장되었습니다.',
      chatroom_id: chatroom.chatroom_id,
      message_count: chatroom.chat_message.length,
    })
  } catch (error) {
    console.error('채팅 메시지 저장 오류:', error)
    res.status(500).json({
      success: false,
      message: '채팅 메시지 저장 중 오류가 발생했습니다.',
      error: error.message,
    })
  }
})

// 사용자의 채팅방 목록 조회 API
router.get('/rooms', authMiddleware, async (req, res) => {
  try {
    const user_email = req.user.email

    const chatrooms = await Chatroom.find({ user_email })
      .sort({ updatedAt: -1 })
      .select('chatroom_id chatroom_title started_at updatedAt chat_message')

    const formattedChatrooms = chatrooms.map(room => ({
      id: room.chatroom_id,
      title: room.chatroom_title || `채팅 ${room.chatroom_id}`,
      createdAt: room.started_at,
      updatedAt: room.updatedAt,
      messages: room.chat_message.map(msg => ({
        id: msg._id,
        sender: msg.role === 'user' ? 'user' : 'bot',
        text: msg.message,
        timestamp: msg.timestamp,
      })),
    }))

    res.status(200).json({
      success: true,
      chatRooms: formattedChatrooms,
    })
  } catch (error) {
    console.error('채팅방 목록 조회 오류:', error)
    res.status(500).json({
      success: false,
      message: '채팅방 목록을 불러오는 중 오류가 발생했습니다.',
      error: error.message,
    })
  }
})

export default router
