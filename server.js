//express 불러오기
import express from 'express'
//express 사용
const app = express()
//port 번호 설정
const port = 3000

import cors from 'cors'
import dotenv from 'dotenv'
import chatRouter from './routes/chat.js'

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

//http 서버 실행
app.listen(port, () => {
  console.log(`Server started... ${port}`)
})
