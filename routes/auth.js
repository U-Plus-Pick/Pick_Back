import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// 회원가입
router.post('/register', async (req, res) => {
  const { name, birthdate, email, phone, password, passwordConfirm, plan } = req.body

  if (password !== passwordConfirm) {
    return res.status(400).json({ message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.' })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: '이미 존재하는 이메일입니다.' })

    const user = new User({ name, birthdate, email, phone, password, plan })
    await user.save()

    res.status(201).json({ message: '회원가입 성공' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '서버 오류' })
  }
})

// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })

    res.json({ message: '로그인 성공', token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '서버 오류' })
  }
})

// 토큰 필요 라우트 예시
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: '서버 오류' })
  }
})

export default router
