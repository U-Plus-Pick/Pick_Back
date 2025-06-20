import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chatRouter from './routes/chat.js'

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'

dotenv.config()

const app = express()

const port = process.env.PORT || 5000

dotenv.config()

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
)
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.use('/api/gpt', chatRouter)

app.use(express.json())

app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
  res.send('✅ 서버 정상 실행 중')
})

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 연결 성공')
    app.listen(port, () => {
      console.log(`🚀 서버 실행 중: http://localhost:${port}`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB 연결 실패', err)
  })
