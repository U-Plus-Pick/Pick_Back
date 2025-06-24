import Party from '../models/party.model.js'
import PartyApplicant from '../models/PartyApplicant.model.js'
import User from '../models/User.js'
import Plan from '../models/Plan.js'
import mongoose from 'mongoose'

    // 1. 필수 값 및 유효성 검사
    // 2. 사용자 정보 및 요금제 유효성 확인
    // 3. 중복 신청 또는 기존 파티 참여 여부 확인
    // 4. PartyApplicant 컬렉션에 신청 정보 저장
    // 5. User 컬렉션에 plan_id 업데이트
    // 6. 응답 반환

export const applyToParty = async (req, res) => {
  try {
    const { id: user_id } = req.user
    const { role, name, plan_name } = req.body

    if (!user_id || !role) {
      return res.status(400).send({ message: 'user_id, role, plan_name은 필수입니다.' })
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).send({ message: '유효하지 않은 user_id입니다.' })
    }

    const apply_division = role === 'leader' ? '파티장' : '파티원'
    if (!['파티장', '파티원'].includes(apply_division)) {
      return res.status(400).send({ message: '유효하지 않은 role 값입니다.' })
    }

    const user = await User.findById(user_id)
    if (!user) return res.status(404).send({ message: '사용자를 찾을 수 없습니다.' })

    if (name && name !== user.name) {
      return res.status(400).send({ message: '제공된 이름이 사용자 정보와 일치하지 않습니다.' })
    }

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
        message: '지정된 요금제 사용자만 파티 신청이 가능합니다.',
      })
    }

    const existingApplicant = await PartyApplicant.findOne({
      applicant_email: user.email,
    })
    if (existingApplicant) {
      return res.status(400).send({ message: '이미 파티 신청이 존재합니다.' })
    }

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
      applicant_plan: plan._id,
      apply_division,
      applicant_priority: 0,
    })

    await applicant.save()
    await User.findByIdAndUpdate(user_id, { plan_id: plan._id })

    res.status(201).send({
      message: '파티 신청이 완료되었습니다.',
      applicant_id: applicant._id,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
}
