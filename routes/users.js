import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Plan from '../models/Plan.js'
import authMiddleware from '../middleware/authMiddleware.js'
import JoinRequest from '../models/joinRequest.model.js'

const router = express.Router()

// 회원가입
router.post('/register', async (req, res) => {
  let { name, birthdate, email, phone, password, passwordConfirm, plan } = req.body

  if (password !== passwordConfirm) {
    return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: '이미 존재하는 이메일입니다.' })

    const existingPhoneUser = await User.findOne({ phone })
    if (existingPhoneUser)
      return res.status(400).json({ message: '이미 존재하는 휴대폰 번호입니다.' })

    if (birthdate) {
      birthdate = new Date(birthdate)
      if (isNaN(birthdate.getTime())) {
        return res.status(400).json({ message: '유효하지 않은 생년월일입니다.' })
      }
    }

    // Plan 컬렉션에서 plan 필드로 요금제 조회
    const matchedPlan = await Plan.findOne({ plan: plan })
    if (!matchedPlan) {
      return res.status(400).json({ message: '존재하지 않는 요금제입니다.' })
    }

    const user = new User({
      name,
      birthdate,
      email,
      phone,
      password,
      plan_id: matchedPlan._id,
    })
    await user.save()

    res.status(201).json({ message: '회원가입 성공' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '서버 오류' })
  }
})

// 로그인
router.post('/signin', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' })
    }

    req.session.user = { _id: user._id, email: user.email }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })

    res.json({ message: '로그인 성공', token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '서버 오류' })
  }
})

// 내 정보 조회
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('plan_id', 'plan_name plan_monthly_fee') // plan_name과 price 필드만 populate
      .lean()

    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })

    // birthdate를 YYYY-MM-DD 포맷으로 변환
    if (user.birthdate) {
      user.birthdate = user.birthdate.toISOString().split('T')[0]
    }

    // 내 JoinRequest 상태 조회
    const joinRequest = await JoinRequest.findOne({
      user_id: req.user.id,
      join_status: { $in: ['pending', 'matched'] },
    }).lean()

    let apply_division = 'none'
    if (joinRequest) {
      apply_division = joinRequest.role === 'leader' ? 'leader' : 'member'
    }

    res.json({
      user_email: user.email,
      user_name: user.name,
      user_phone: user.phone,
      user_birth: user.birthdate,
      plans: user.plan_id?.plan_name || null,
      apply_division,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '서버 오류' })
  }
})

// 요금제 변경 (plan_name 기준)
router.patch('/me/plan', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { plan_name } = req.body

    if (!plan_name) {
      return res.status(400).json({ message: 'plan_name은 필수입니다.' })
    }

    // plan_name으로 요금제 조회
    const plan = await Plan.findOne({ plan_name })
    if (!plan) {
      return res.status(404).json({ message: '해당 요금제를 찾을 수 없습니다.' })
    }

    // 유저 요금제 변경
    await User.findByIdAndUpdate(userId, { plan_id: plan._id })

    res.json({
      message: '요금제 변경 완료',
      updated_plan: plan.plan_name,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '서버 오류' })
  }
})

export default router
