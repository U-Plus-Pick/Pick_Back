// routes/auth.js
import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// 회원가입
router.post('/register', async (req, res) => {
  const { name, birthdate, email, phone, password, passwordConfirm, plan } = req.body

  if (password !== passwordConfirm) {
    return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: '이미 존재하는 이메일입니다.' })

    // 휴대폰 번호 중복 체크
    const existingPhoneUser = await User.findOne({ phone })
    if (existingPhoneUser)
      return res.status(400).json({ message: '이미 존재하는 휴대폰 번호입니다.' })

    const user = new User({ name, birthdate, email, phone, password, plan })
    await user.save()
    res.status(201).json({ message: '회원가입 성공' })
  } catch (err) {
    res.status(500).json({ message: '서버 오류' })
  }
})

// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' })
    }

    // 세션에 사용자 정보 저장
    req.session.user = { _id: user._id, email: user.email }

    // JWT 발급
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })

    res.json({ message: '로그인 성공', token })
  } catch (err) {
    res.status(500).json({ message: '서버 오류' })
  }
})

// 내 정보 조회 (JWT 인증 필요)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean()
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })

    if (user.birthdate) {
      user.birthdate = user.birthdate.toISOString().split('T')[0]
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: '서버 오류' })
  }
})

// 로그아웃 (세션 제거)
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: '로그아웃 완료' })
  })
})

export default router
