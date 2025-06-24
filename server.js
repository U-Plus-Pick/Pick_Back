import express from 'express'
import mongoose from 'mongoose'
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

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err))

app.use('/api/users', userRoutes)
app.use('/api/party', partyRoutes)
app.use('/api/plans', allPlanRoutes) //전체 요금제 조회
app.use('/api/join-requests', joinRequestRoutes)
app.use('/api/payments', paymentRoutes)
app.use((req, res) => {
  res.status(404).send({ message: `Cannot ${req.method} ${req.originalUrl}` })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send({ message: '서버 오류' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`서버가 포트 ${PORT}에서 실행 중`))

// // 매 10초마다 자동 매칭 시도
// cron.schedule('*/10 * * * * *', async () => {
//   try {
//     await attemptAutoMatch()
//   } catch (err) {
//     console.error('[자동매칭 에러]', err)
//   }
// })
