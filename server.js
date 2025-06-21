import express from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import MongoStore from 'connect-mongo'

import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import joinRequestRoutes from './routes/joinRequest.routes.js'
import partyRoutes from './routes/party.routes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// MongoDB 연결
connectDB()

// 미들웨어
app.use(express.json())

// 세션 설정
app.use(
  session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 }, // 1시간 유지
  })
)

// 라우터 연결
app.use('/api/auth', authRoutes)
app.use('/api/join-requests', joinRequestRoutes)
app.use('/api/party', partyRoutes)

// 기본 라우트
app.get('/', (req, res) => {
  res.send('✅ 서버 정상 실행 중')
})

// 서버 실행
app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`)
})
