import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import session from 'express-session'
import dotenv from 'dotenv'
import MongoStore from 'connect-mongo'
import mongoose from 'mongoose'
import cors from 'cors'

import connectDB from './config/db.js'

import chatRouter from './routes/chat.js'
import usersRoutes from './routes/users.js'
import joinRequestRoutes from './routes/joinRequest.routes.js'
import partyRoutes from './routes/party.routes.js'
import allPlanRoutes from './routes/allPlan.routes.js'

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
    methods: ['GET', 'POST'],
  },
})

// MongoDB 연결 (connectDB 함수가 mongoose.connect를 내부적으로 호출한다고 가정)
connectDB()

// CORS 설정
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// JSON 파싱 미들웨어
app.use(express.json())

// 세션 설정
app.use(
  session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 }, // 1시간
  })
)

// 라우터 등록
app.use('/api/gpt', chatRouter) //챗봇
app.use('/api/users', usersRoutes)
app.use('/api/join-requests', joinRequestRoutes)
app.use('/api/party', partyRoutes)
app.use('/api/plans', allPlanRoutes) //전체 요금제 조회

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
