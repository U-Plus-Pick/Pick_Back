const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const authRoutes = require('./routes/auth') // 로그인/회원가입 라우터

// 환경 변수 설정
dotenv.config()

// Express 앱 초기화
const app = express()
const port = process.env.PORT || 3000

// JSON 요청 파싱
app.use(express.json())

// ✅ 기본 라우트 (연결 확인용)
app.get('/', (req, res) => {
  res.send('✅ 서버가 정상적으로 실행 중입니다!')
})

// ✅ 인증 라우터 연결 (/api/auth/register, /api/auth/login 등)
app.use('/api/auth', authRoutes)

// ✅ MongoDB 연결 및 서버 시작
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
