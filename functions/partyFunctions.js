import Party from '../models/party.model.js'
import PartyApplicant from '../models/PartyApplicant.model.js'
import User from '../models/User.js'
import Plan from '../models/Plan.js'

// 현재 매칭 가능한 파티장/파티원 수를 조회하는 함수
export const checkMatchStatus = async (req, res) => {
  // leaderCount, memberCount 계산 → 매칭 가능한지 여부 반환
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
    res.send({
      message: '매칭 상태 조회',
      leaderCount,
      memberCount,
      canMatch: leaderCount >= 1 && memberCount >= 4,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
}

// 파티 매칭 실행: 조건 충족 시 하나의 파티 생성
export const executePartyMatch = async (req, res) => {
  // 파티장 1명 + 파티원 4명 조건 충족 시
  // 새 Party 생성하고 PartyApplicant의 party_id 업데이트
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
}

// 현재 로그인한 사용자의 파티 정보를 조회하는 함수
// 본인이 속한 파티 정보를 찾아서 리턴 (파티장 또는 멤버 가능)

export const getMyPartyInfo = async (req, res) => {
  try {
    const userId = req.user.id
    console.log('현재 로그인된 유저 ID:', userId)

    // 본인이 리더거나 파티원인 파티 조회
    const party = await Party.findOne({
      $or: [{ party_leader_id: userId }, { 'party_members.member_id': userId }],
      party_status: { $ne: '파티 해체' },
    })
      .populate('party_leader_id', 'name email plan')
      .populate('party_members.member_id', 'name email plan')

    if (!party) {
      return res.status(404).json({ message: '참여 중인 파티가 없습니다.' })
    }

    // 리더 정보
    const leader = party.party_leader_id
    const leaderPlan = await Plan.findOne({ plan_name: leader.plan })

    const leader_infor = {
      leader_email: leader.email,
      leader_name: leader.name,
      plan_name: leaderPlan?.plan_name || '',
      plan_fee: leaderPlan?.plan_monthly_fee || 0,
    }

    // 파티원 정보
    const crew_infor = await Promise.all(
      party.party_members.map(async m => {
        const member = m.member_id
        const plan = await Plan.findOne({ plan_name: member.plan })
        return {
          member_email: member.email,
          member_name: member.name,
          plan_name: plan?.plan_name || '',
          plan_monthly_fee: plan?.plan_monthly_fee || 0,
        }
      })
    )

    // 응답 데이터
    const responseData = {
      party_status: party.party_status,
      created_at: party.created_at,
      leader_infor,
      crew_infor,
    }

    res.json({ message: '파티 정보 조회 성공', party: responseData })
  } catch (err) {
    console.error('파티 조회 오류:', err)
    res.status(500).json({ message: '서버 오류' })
  }
}

// 사용자가 파티에서 탈퇴하거나 파티장이 나갈 경우 파티를 해체하는 함수
export const leaveParty = async (req, res) => {
  // 파티장 → 파티 해체
  // 파티원 → 멤버 목록에서 제거, 신청 기록 삭제
  // 나머지 멤버 우선순위 +1 및 party_id null 처리

  try {
    const userId = req.user.id
    const user = await User.findById(userId)
    const party = await Party.findOne({
      $or: [{ party_leader_id: userId }, { 'party_members.member_id': userId }],
      party_status: { $ne: '파티 해체' },
    })

    if (!party) return res.status(404).send({ message: '속해있는 파티가 없습니다.' })

    const isLeader = party.party_leader_id.toString() === userId
    const memberIndex = party.party_members.findIndex(m => m.member_id?.toString() === userId)

    if (!isLeader && memberIndex === -1)
      return res.status(400).send({ message: '해당 사용자는 파티 멤버가 아닙니다.' })

    if (isLeader || party.party_members.length <= 3) {
      party.party_status = '파티 해체'
      await party.save()

      await PartyApplicant.deleteOne({ applicant_email: user.email, party_id: party._id })
      await PartyApplicant.updateMany(
        { party_id: party._id, applicant_email: { $ne: user.email } },
        { $set: { party_id: null }, $inc: { applicant_priority: 1 } }
      )

      const reason = isLeader
        ? '파티장이 탈퇴하여 파티가 해체되었습니다.'
        : '파티원이 3명 이하로 남아 파티가 해체되었습니다.'
      return res.send({ message: reason })
    }

    party.party_members.splice(memberIndex, 1)
    await party.save()
    await PartyApplicant.deleteOne({ applicant_email: user.email, party_id: party._id })

    res.send({ message: '정상적으로 파티에서 탈퇴되었고 신청 기록이 삭제되었습니다.' })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
}

// 로그인한 사용자가 현재 파티에 소속되어 있는지 상태를 조회하는 함수
export const getPartyStatus = async (req, res) => {
  // 파티장인지, 파티원인지, 아니면 소속 없음인지 상태 반환
  try {
    const userId = req.user.id
    const user = await User.findById(userId)
    const party = await Party.findOne({
      $or: [{ party_leader_email: user.email }, { 'party_members.member_email': user.email }],
      party_status: { $ne: '파티 해체' },
    })

    if (!party) return res.send({ status: 'none', user_email: user.email })

    const isLeader = party.party_leader_email === user.email
    res.send({ status: isLeader ? 'leader' : 'member', user_email: user.email })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: '서버 오류' })
  }
}
