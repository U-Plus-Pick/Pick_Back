import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import userRoutes from './routes/users.routes.js'
import partyRoutes from './routes/party.routes.js'
import joinRequestRoutes from './routes/joinRequest.routes.js'
import dotenv from 'dotenv'
import allPlanRoutes from './routes/allPlan.routes.js'
import cors from 'cors'
import paymentRoutes from './routes/payments.routes.js'
import cron from 'node-cron'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// HTTP 서버 생성 (Socket.IO와 연결)
const server = http.createServer(app)

// Socket.IO 서버 설정
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
})

// CORS 설정
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// 기본 미들웨어
app.use(express.json())

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
app.use('/api/join-requests', joinRequestRoutes)
app.use('/api/payments', paymentRoutes)
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
