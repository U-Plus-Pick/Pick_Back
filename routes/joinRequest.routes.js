import express from 'express'
import mongoose from 'mongoose'
import PartyApplicant from '../models/PartyApplicant.js'
import User from '../models/User.js'
import Plan from '../models/Plan.js'
import Party from '../models/Party.js'
const router = express.Router()

// 세션 기반 인증 미들웨어
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user && req.session.user._id) {
    next()
  } else {
    res.status(401).send({ message: '로그인이 필요합니다.' })
  }
}

// 파티 신청
router.post('/', isLoggedIn, async (req, res) => {
  try {
    const { role } = req.body
    const sessionUser = req.session.user

    const user_id = sessionUser._id

    if (role === undefined) {
      return res.status(400).send({ message: 'role은 필수입니다.' })
    }

    const apply_division = role === 'leader' ? '파티장' : '파티원'
    if (!['파티장', '파티원'].includes(apply_division)) {
      return res.status(400).send({ message: '유효하지 않은 role 값입니다.' })
    }

    // 사용자 정보 조회 (plan_id 대신 plan 이름을 직접 저장한다고 가정)
    const user = await User.findById(user_id)
    if (!user) {
      return res.status(404).send({ message: '사용자를 찾을 수 없습니다.' })
    }

    // 허용된 요금제 리스트
    const allowedPlans = [
      '5G 시그니처',
      '5G 프리미어 슈퍼',
      '5G 프리미어 플러스',
      '5G 프리미어 레귤러',
      '5G 프리미어 에센셜',
      '5G 스마트',
      '5G 프리미엄',
      '5G 스페셜',
      '5G 슈퍼 플래티넘',
      '5G 플래티넘',
      'LTE 프리미어 플러스',
      'LTE 프리미어 에센셜',
    ]

    const userPlanName = user.plan // User 모델에 plan이 문자열로 있다고 가정
    if (!allowedPlans.includes(userPlanName)) {
      return res.status(400).send({
        message: '허용된 요금제를 사용하는 고객만 파티 신청이 가능합니다.',
      })
    }

    // 중복 신청 체크
    const existing = await PartyApplicant.findOne({
      applicant_email: user.email,
    })

    if (existing) {
      return res.status(400).send({ message: '이미 파티 신청이 존재합니다.' })
    }

    // 중복 파티 체크
    const existingParty = await Party.findOne({
      $or: [{ party_leader_id: user_id }, { 'party_members.member_id': user_id }],
      party_status: { $ne: '파티 해체' },
    })

    if (existingParty) {
      return res.status(400).send({ message: '이미 다른 파티에 참여 중입니다.' })
    }

    const applicant = new PartyApplicant({
      party_id: null,
      applicant_phone: user.phone,
      applicant_email: user.email,
      applicant_birth: user.birthdate,
      applicant_plan: userPlanName, // 문자열로 저장
      apply_division,
      applicant_priority: 0,
    })

    await applicant.save()

    res.status(201).send({ message: '파티 신청이 완료되었습니다.', applicant_id: applicant._id })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
})

export default router
