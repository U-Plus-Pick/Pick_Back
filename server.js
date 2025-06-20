import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import chatRouter from './routes/chat.js'
import authRoutes from './routes/auth.js'
import joinRequestRoutes from './routes/joinRequest.routes.js'
import partyRoutes from './routes/party.routes.js'

// 환경변수 로딩
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// CORS 설정
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
)

// JSON 파싱 미들웨어
app.use(express.json())

// 라우터 등록
app.use('/api/gpt', chatRouter)
app.use('/api/auth', authRoutes)
app.use('/api/join-requests', joinRequestRoutes)
app.use('/api/party', partyRoutes)

// 기본 라우트
app.get('/', (req, res) => {
  res.send('서버 정상 실행 중')
})

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB 연결 성공')
    app.listen(port, () => {
      console.log(`서버 실행 중: http://localhost:${port}`)
    })
  })
  .catch(err => {
    console.error('MongoDB 연결 실패', err)
  })
