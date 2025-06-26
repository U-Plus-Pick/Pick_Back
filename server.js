import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
// 라우터 imports
import usersRoutes from './routes/users.routes.js'
import partyRoutes from './routes/party.routes.js'
import partyApplicantRoutes from './routes/partyApplicant.routes.js'
import allPlanRoutes from './routes/allPlan.routes.js'
import tossPaymentsRoutes from './routes/tossPayments.routes.js'
import paymentsRoutes from './routes/payments.routes.js'
import chatRoutes from './routes/chat.js'
import submitDocumentRoutes from './routes/submitDocuments.js'

// 환경변수 로딩
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// HTTP 서버 생성 (Socket.IO와 연결)
const server = http.createServer(app)

// Socket.IO 서버 설정
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
})

// CORS 설정
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// 기본 미들웨어
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ limit: '20mb', extended: true }))

// 세션 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1일
  })
)

// MongoDB 연결
connectDB()

// 라우터 등록
app.use('/api/users', usersRoutes)
app.use('/api/party', partyRoutes)
app.use('/api/join-requests', partyApplicantRoutes)
app.use('/api/plans', allPlanRoutes)
app.use('/api/toss', tossPaymentsRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/party/documents', submitDocumentRoutes)

// 기본 라우트
app.get('/', (req, res) => {
  res.send('서버 정상 실행 중')
})

// Socket.IO 이벤트 처리
io.on('connection', socket => {
  console.log('새 클라이언트 연결됨:', socket.id)

  // 사용자별 대화 히스토리 저장
  let conversationHistory = []

  // 채팅 메시지 처리
  socket.on('chat_message', async data => {
    try {
      console.log('채팅 메시지 수신:', data)
      const { message, messages, clearHistory } = data

      // 히스토리 초기화 요청 시
      if (clearHistory) {
        conversationHistory = []
        socket.emit('chat_history_cleared')
        return
      }

      // 전달받은 messages가 있으면 사용, 없으면 서버의 히스토리 사용
      const currentMessages = messages || conversationHistory

      // 스트리밍 시작 신호
      socket.emit('chat_response_start')

      // 통합된 chatWithGPT 함수 사용 (HTTP용을 Socket용으로 활용)
      const { chatWithGPT } = await import('./services/chatService.js')

      // Mock req, res 객체 생성
      const mockReq = {
        body: {
          message: message,
          messages: currentMessages,
        },
      }

      let responseData = null
      const mockRes = {
        json: data => {
          responseData = data
        },
        status: code => ({
          json: data => {
            responseData = { ...data, statusCode: code }
          },
        }),
      }

      // chatWithGPT 함수 실행
      await chatWithGPT(mockReq, mockRes)

      if (responseData && responseData.success) {
        const response = responseData.response

        // 대화 히스토리 업데이트
        conversationHistory.push({ role: 'user', content: message })
        conversationHistory.push({ role: 'assistant', content: response })

        // 히스토리가 너무 길어지면 앞부분 제거 (최근 10개 교환만 유지)
        if (conversationHistory.length > 20) {
          conversationHistory = conversationHistory.slice(-20)
        }

        // 스트리밍 효과로 응답 전송
        const chunks = response.match(/.{1,10}/g) || [response]
        for (const chunk of chunks) {
          socket.emit('chat_response_chunk', { content: chunk })
          await new Promise(resolve => setTimeout(resolve, 50))
        }

        // 스트리밍 완료
        socket.emit('chat_response_end', {
          content: response,
          conversationHistory: conversationHistory,
        })
      } else {
        // 에러 응답 처리
        socket.emit('chat_error', {
          message: responseData?.error || '일시적인 오류가 발생했습니다.',
        })
      }
    } catch (error) {
      console.error('채팅 처리 오류:', error)
      socket.emit('chat_error', {
        message: '죄송합니다. 일시적인 오류가 발생했습니다.',
      })
    }
  })

  // 대화 히스토리 요청
  socket.on('get_conversation_history', () => {
    socket.emit('conversation_history', conversationHistory)
  })

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 종료:', socket.id)
    // 연결 종료시 히스토리 정리
    conversationHistory = []
  })
})

// 404 에러 처리
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` })
})

// 전역 에러 처리
app.use((err, req, res, next) => {
  console.error('서버 오류:', err.stack)
  res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' })
})

// 서버 시작
server.listen(port, () => {
  console.log(`서버 실행 성공: http://localhost:${port}`)
})
