import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

import mongoose from 'mongoose'

import session from 'express-session'
import MongoStore from 'connect-mongo'
import userRoutes from './routes/users.routes.js'
import partyRoutes from './routes/party.routes.js'
import joinRequestRoutes from './routes/joinRequest.routes.js' // ✅
import dotenv from 'dotenv'
import allPlanRoutes from './routes/allPlan.routes.js'

import tossPaymentsRoutes from './routes/tossPayments.routes.js'

import User from './models/User.js'
import JoinRequest from './models/joinRequest.model.js'

// 환경변수 로딩
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// HTTP 서버 생성 (Socket.IO와 연결)
const server = http.createServer(app)

// Socket.IO 서버 설정
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH'],
  },
})

// MongoDB 연결 (connectDB 함수가 mongoose.connect를 내부적으로 호출한다고 가정)
connectDB()

import cors from 'cors'
dotenv.config()

const app = express()

// CORS 설정
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1일
  })
)

// 라우터 등록
app.use('/api/gpt', chatRouter) //챗봇
app.use('/api/users', usersRoutes)
app.use('/api/join-requests', joinRequestRoutes)
app.use('/api/party', partyRoutes)
app.use('/api/plans', allPlanRoutes) //전체 요금제 조회
app.use('/api/toss', tossPaymentsRoutes) //toss 결제

// 파티 신청 API 직접 추가
app.post('/api/party-apply', async (req, res) => {
  try {
    const { user_email, role, name, terms_agreed } = req.body

    if (!user_email || !role || !name || typeof terms_agreed !== 'boolean') {
      return res.status(400).json({ message: '필수 데이터가 부족합니다.' })
    }

    // 이메일로 사용자 조회
    const user = await User.findOne({ email: user_email })
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    }

    // 중복 신청 검사 (pending 또는 matched 상태인 신청서가 있는지)
    const existingRequest = await JoinRequest.findOne({
      user_id: user._id,
      join_status: { $in: ['pending', 'matched'] },
    })
    if (existingRequest) {
      return res.status(400).json({ message: '이미 파티 신청 중입니다.' })
    }

    // 신청서 저장
    const joinRequest = new JoinRequest({
      user_id: user._id,
      role,
      name,
      terms_agreed,
      join_status: 'pending',
      created_at: new Date(),
    })

    await joinRequest.save()

    res.status(201).json({ message: '파티 신청이 완료되었습니다.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '서버 오류' })
  }
})

// 기본 응답
app.get('/', (req, res) => {
  res.send('서버 정상 실행 중')
})

// Socket 이벤트 처리
io.on('connection', socket => {
  console.log('새 클라이언트 연결됨:', socket.id)

  socket.on('chat message', msg => {
    console.log('메시지 수신:', msg)
    // 받은 메시지를 전체 클라이언트에게 전송
    io.emit('chat message', msg)
  })

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 종료:', socket.id)
  })
})

// 서버 실행
server.listen(port, () => {
  console.log(`서버 실행 성공: http://localhost:${port}`)
})

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err))

app.use('/api/users', userRoutes)
app.use('/api/party', partyRoutes)
app.use('/api/plans', allPlanRoutes) //전체 요금제 조회
app.use('/api/join-requests', joinRequestRoutes)
app.use((req, res) => {
  res.status(404).send({ message: `Cannot ${req.method} ${req.originalUrl}` })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send({ message: '서버 오류' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`서버가 포트 ${PORT}에서 실행 중`))
