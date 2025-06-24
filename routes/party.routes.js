import express from 'express'
import Party from '../models/Party.js'
import PartyApplicant from '../models/PartyApplicant.js'
import User from '../models/User.js'
import Plan from '../models/Plan.js'
import mongoose from 'mongoose'

const router = express.Router()

// 세션 기반 인증 미들웨어
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user && req.session.user._id) {
    next()
  } else {
    res.status(401).send({ message: '로그인이 필요합니다.' })
  }
}

// ✅ 파티 신청 API
router.post('/join-requests', isLoggedIn, async (req, res) => {
  try {
    const { user_id, role, name, plan_name } = req.body

    // 필수 필드 검증
    if (!user_id || !role) {
      return res.status(400).send({ message: 'user_id, role, plan_name은 필수입니다.' })
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).send({ message: '유효하지 않은 user_id입니다.' })
    }

    if (user_id !== req.session.user._id) {
      return res.status(403).send({ message: '본인의 user_id만 사용할 수 있습니다.' })
    }

    const apply_division = role === 'leader' ? '파티장' : '파티원'
    if (!['파티장', '파티원'].includes(apply_division)) {
      return res.status(400).send({ message: '유효하지 않은 role 값입니다.' })
    }

    // 사용자 조회
    const user = await User.findById(user_id)
    if (!user) return res.status(404).send({ message: '사용자를 찾을 수 없습니다.' })

    if (name && name !== user.name) {
      return res.status(400).send({ message: '제공된 이름이 사용자 정보와 일치하지 않습니다.' })
    }

    // ✅ 허용 요금제 확인
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

    const plan = await Plan.findOne({ plan_name: { $regex: `^${plan_name}$`, $options: 'i' } })
    if (!plan || !allowedPlans.includes(plan.plan_name)) {
      return res.status(400).send({
        message:
          '5G 시그니처, 5G 프리미어 슈퍼/플러스/레귤러/에센셜, 5G 스마트/프리미엄/스페셜, 5G 슈퍼 플래티넘/플래티넘, LTE 프리미어 플러스/에센셜 요금제를 사용하는 고객만 파티 가입이 가능합니다.',
      })
    }

    // ✅ 이미 신청했는지 확인
    const existingApplicant = await PartyApplicant.findOne({
      applicant_email: user.email,
    })
    if (existingApplicant) {
      return res.status(400).send({ message: '이미 파티 신청이 존재합니다.' })
    }

    // ✅ 이미 다른 파티에 소속되어 있는지 확인
    const existingParty = await Party.findOne({
      $or: [{ party_leader_id: user_id }, { 'party_members.member_id': user_id }],
      party_status: { $ne: '파티 해체' },
    })
    if (existingParty) {
      return res.status(400).send({ message: '이미 다른 파티에 참여 중입니다.' })
    }

    // ✅ 파티 신청 정보 저장
    const applicant = new PartyApplicant({
      party_id: null,
      applicant_phone: user.phone,
      applicant_email: user.email,
      applicant_birth: user.birthdate,
      applicant_plan: plan._id,
      apply_division,
      applicant_priority: 0,
    })

    await applicant.save()

    // ✅ 사용자 요금제 plan_id 업데이트
    await User.findByIdAndUpdate(user_id, { plan_id: plan._id })

    res.status(201).send({ message: '파티 신청이 완료되었습니다.', applicant_id: applicant._id })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
})

// 매칭 상태 조회
router.get('/match', async (req, res) => {
  try {
    const leaderCount = await PartyApplicant.countDocuments({
      apply_division: '파티장',
      party_id: null,
      applicant_plan: { $ne: null },
    })

    const memberCount = await PartyApplicant.countDocuments({
      apply_division: '파티원',
      party_id: null,
      applicant_plan: { $ne: null },
    })

    const canMatch = leaderCount >= 1 && memberCount >= 4

    res.send({
      message: '매칭 상태 조회',
      leaderCount,
      memberCount,
      canMatch,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
})

// 파티 매칭
router.post('/match', async (req, res) => {
  try {
    const leaderApplicant = await PartyApplicant.findOne({
      apply_division: '파티장',
      party_id: null,
      applicant_plan: { $ne: null },
    }).sort({ applicant_priority: -1, created_at: 1 })

    const memberApplicants = await PartyApplicant.find({
      apply_division: '파티원',
      party_id: null,
      applicant_plan: { $ne: null },
    })
      .sort({ applicant_priority: -1, created_at: 1 })
      .limit(4)

    if (!leaderApplicant || memberApplicants.length < 4) {
      return res.status(400).send({ message: '매칭 가능한 인원이 부족합니다.' })
    }

    const leaderUser = await User.findOne({ email: leaderApplicant.applicant_email })
    if (!leaderUser) return res.status(404).send({ message: '파티장 사용자를 찾을 수 없습니다.' })

    const memberUsers = await User.find({
      email: { $in: memberApplicants.map(m => m.applicant_email) },
    })

    const party = new Party({
      party_leader_id: leaderUser._id,
      party_leader_email: leaderApplicant.applicant_email,
      party_leader_name: leaderUser.name,
      party_members: memberApplicants.map(m => {
        const user = memberUsers.find(u => u.email === m.applicant_email)
        return {
          member_id: user ? user._id : null,
          member_email: m.applicant_email,
          member_name: user ? user.name : 'Unknown',
        }
      }),
      party_status: '모집완료',
    })

    await party.save()

    await PartyApplicant.updateMany(
      { _id: { $in: [leaderApplicant._id, ...memberApplicants.map(m => m._id)] } },
      { $set: { party_id: party._id } }
    )

    res.send({ message: '매칭 성공', party_id: party._id })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
})

// 내 파티 조회
// 로그인된 사용자의 파티 정보 조회 API
router.get('/infor', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user._id

    // 사용자 포함 파티 찾기 (해체된 파티 제외)
    const party = await Party.findOne({
      $or: [{ party_leader_id: userId }, { 'party_members.member_id': userId }],
      party_status: { $ne: '파티 해체' },
    })
      .populate('party_leader_id', 'name email plan') // plan이 문자열 필드라고 가정
      .populate('party_members.member_id', 'name email plan')

    if (!party) {
      return res.status(404).send({ message: '참여 중인 파티가 없습니다.' })
    }

    // 멤버 정보 간소화 함수
    const formatMember = member => ({
      _id: member._id,
      name: member.name,
      email: member.email,
    })

    // 응답 데이터 구성
    const responseData = {
      party_status: party.party_status,
      party_leader: party.party_leader_id ? formatMember(party.party_leader_id) : null,
      party_members: party.party_members.map(m => formatMember(m.member_id)),
      created_at: party.created_at,
    }

    res.send({ message: '파티 정보 조회 성공', party: responseData })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
})

router.post('/leave', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user._id

    const party = await Party.findOne({
      $or: [{ party_leader_id: userId }, { 'party_members.member_id': userId }],
      party_status: { $ne: '파티 해체' },
    })

    if (!party) {
      return res.status(404).send({ message: '속해있는 파티가 없습니다.' })
    }

    const isLeader = party.party_leader_id.toString() === userId
    const memberIndex = party.party_members.findIndex(
      m => m.member_id && m.member_id.toString() === userId
    )

    const user = await User.findById(userId)
    if (!user) return res.status(404).send({ message: '사용자를 찾을 수 없습니다.' })

    if (!isLeader && memberIndex === -1) {
      return res.status(400).send({ message: '해당 사용자는 파티 멤버가 아닙니다.' })
    }

    if (isLeader || party.party_members.length <= 3) {
      // 파티 해체 처리
      party.party_status = '파티 해체'
      await party.save()

      // 탈퇴자 신청서 완전 삭제
      await PartyApplicant.deleteOne({
        applicant_email: user.email,
        party_id: party._id,
      })

      // 나머지 멤버들은 party_id null 처리 + 우선순위 +1
      await PartyApplicant.updateMany(
        {
          party_id: party._id,
          applicant_email: { $ne: user.email },
        },
        {
          $set: { party_id: null },
          $inc: { applicant_priority: 1 },
        }
      )

      const reason = isLeader
        ? '파티장이 탈퇴하여 파티가 해체되었습니다.'
        : '파티원이 3명 이하로 남아 파티가 해체되었습니다.'

      return res.send({ message: reason })
    }

    // 일반 멤버 탈퇴 시
    party.party_members.splice(memberIndex, 1)
    await party.save()

    // 탈퇴자 신청서 완전 삭제
    await PartyApplicant.deleteOne({
      applicant_email: user.email,
      party_id: party._id,
    })

    res.send({ message: '정상적으로 파티에서 탈퇴되었고 신청 기록이 삭제되었습니다.' })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
})

// 파티 상태 조회 (로그인 사용자 기반)
router.get('/status', isLoggedIn, async (req, res) => {
  try {
    const userEmail = req.session.user.email

    const party = await Party.findOne({
      $or: [{ party_leader_email: userEmail }, { 'party_members.member_email': userEmail }],
      party_status: { $ne: '파티 해체' },
    })

    if (!party) {
      return res.send({ status: 'none', user_email: userEmail })
    }

    const isLeader = party.party_leader_email === userEmail
    const status = isLeader ? 'leader' : 'member'

    res.send({ status, user_email: userEmail })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
})

export default router
