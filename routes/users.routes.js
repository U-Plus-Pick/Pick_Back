import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Plan from '../models/Plan.js'
import PartyApplicant from '../models/PartyApplicant.model.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { name, birthdate, email, phone, password, passwordConfirm, plan } = req.body

    // 필수 필드 검증
    if (!name || !birthdate || !email || !phone || !password || !passwordConfirm) {
      return res.status(400).send({ message: '모든 필수 필드를 입력하세요.' })
    }

    if (password !== passwordConfirm) {
      return res.status(400).send({ message: '비밀번호가 일치하지 않습니다.' })
    }

    // 이메일 및 전화번호 중복 체크
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] })
    if (existingUser) {
      return res.status(400).send({ message: '이미 등록된 이메일 또는 전화번호입니다.' })
    }

    // 생년월일 검증
    const birthDateObj = new Date(birthdate)
    if (isNaN(birthDateObj.getTime())) {
      return res.status(400).send({ message: '유효하지 않은 생년월일입니다.' })
    }

    // plan 길이 검증
    if (plan && plan.length > 50) {
      return res.status(400).send({ message: '요금제 이름은 50자를 초과할 수 없습니다.' })
    }

    // 사용자 생성
    const user = new User({
      name,
      birthdate: birthDateObj,
      email,
      phone,
      password,
      plan,
    })

    await user.save()
    res.status(201).send({ message: '회원가입 성공', user_id: user._id })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
})

// 로그인
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    // 입력 검증
    if (!email || !password) {
      return res.status(400).send({ message: '이메일과 비밀번호를 입력하세요.' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).send({ message: '이메일 또는 비밀번호가 틀렸습니다.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).send({ message: '이메일 또는 비밀번호가 틀렸습니다.' })
    } // 세션 및 JWT 생성
    req.session.user = { _id: user._id, email: user.email }
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })

    res.send({ message: '로그인 성공', token })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
})

// 내 정보 조회
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean()

    if (!user) {
      return res.status(404).send({ message: '사용자를 찾을 수 없습니다.' })
    }

    // 생년월일 포맷
    if (user.birthdate) {
      user.birthdate = user.birthdate.toISOString().split('T')[0]
    }

    // 파티 신청 상태 조회
    const joinRequest = await PartyApplicant.findOne({
      applicant_email: user.email,
    }).lean()

    const apply_division = joinRequest?.apply_division || 'none'

    res.send({
      user_email: user.email,
      user_name: user.name,
      user_phone: user.phone,
      user_birth: user.birthdate,
      plans: user.plan || null,
      apply_division,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
})

// 요금제 변경
router.patch('/me/plan', authMiddleware, async (req, res) => {
  try {
    const { plan_name } = req.body

    if (!plan_name) {
      return res.status(400).send({ message: 'plan_name은 필수입니다.' })
    }

    if (plan_name.length > 50) {
      return res.status(400).send({ message: '요금제 이름은 50자를 초과할 수 없습니다.' })
    }

    const user = await User.findByIdAndUpdate(req.user.id, { plan: plan_name }, { new: true })

    res.send({
      message: '요금제 변경 완료',
      updated_plan: user.plan,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
})

export default router
