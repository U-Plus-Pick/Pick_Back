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

// 채팅 메시지 저장 API
router.post('/insert-messages', authMiddleware, async (req, res) => {
  console.log('=== 채팅 메시지 저장 API 호출됨 ===')
  console.log('Request body:', req.body)
  
  try {
    const { chatroom_id, messages, chatroom_title } = req.body
    const user_email = req.user.email // authMiddleware에서 추출된 사용자 정보

    console.log('User email:', user_email)
    console.log('Chatroom ID:', chatroom_id)

    // 사용자 존재 확인
    const user = await User.findOne({ email: user_email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      })
    }

    // 기존 채팅방 찾기 (사용자 이메일과 chatroom_id 조합으로)
    let chatroom = await Chatroom.findOne({ chatroom_id, user_email })
    console.log('기존 채팅방 찾기 결과:', chatroom ? '존재함' : '없음')

    if (chatroom) {
      // 기존 채팅방이 있으면 메시지 추가
      const newMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'bot',
        message: msg.text,
        timestamp: msg.timestamp || new Date(),
      }))

      chatroom.chat_message.push(...newMessages)

      // 제목이 제공되면 업데이트
      if (chatroom_title) {
        chatroom.chatroom_title = chatroom_title
      }

      await chatroom.save()
      console.log('기존 채팅방 업데이트 완료')    } else {
      // 새 채팅방 생성 - 중복 방지를 위해 고유한 ID 생성
      let uniqueChatroomId = chatroom_id || Date.now()
      
      // 혹시 같은 ID가 이미 존재하는지 확인
      const existingRoom = await Chatroom.findOne({ chatroom_id: uniqueChatroomId })
      if (existingRoom) {
        // 이미 존재하는 경우 타임스탬프 기반으로 새로운 ID 생성
        uniqueChatroomId = Date.now() + Math.floor(Math.random() * 1000)
        console.log(`중복 ID 발견, 새 ID 생성: ${chatroom_id} -> ${uniqueChatroomId}`)
      }

      const newMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'bot',
        message: msg.text,
        timestamp: msg.timestamp || new Date(),
      }))

      chatroom = new Chatroom({
        chatroom_id: uniqueChatroomId,
        user_email,
        chat_message: newMessages,
        chatroom_title: chatroom_title || `채팅 ${uniqueChatroomId}`,
        started_at: new Date(),
      })

      await chatroom.save()
      console.log('새 채팅방 생성 완료, ID:', uniqueChatroomId)
    }

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
      .sort({ updatedAt: -1 }) // 최근 업데이트 순으로 정렬
      .select('chatroom_id chatroom_title started_at updatedAt chat_message')

    // 프론트엔드 형식에 맞게 변환
    const formattedChatrooms = chatrooms.map(room => ({
      id: room.chatroom_id,
      title: room.chatroom_title || `채팅 ${room.chatroom_id}`,
      createdAt: room.started_at,
      updatedAt: room.updatedAt,
      messages: room.chat_message.map(msg => ({
        id: msg._id,
        sender: msg.role,
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
