import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import joinRequestRoutes from './routes/joinRequest.routes.js'
import partyRoutes from './routes/party.routes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// JSON 파싱
app.use(express.json())

// 라우터 연결
app.use('/api/auth', authRoutes)
app.use('/api/join-requests', joinRequestRoutes)
app.use('/api/party', partyRoutes)

// 기본 라우트
app.get('/', (req, res) => {
  res.send('✅ 서버 정상 실행 중')
})

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB 연결 성공')
    app.listen(port, () => {
      console.log(`🚀 서버 실행 중: http://localhost:${port}`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB 연결 실패', err)
  })
