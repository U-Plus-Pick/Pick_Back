// routes/party.routes.js
import express from 'express'
import JoinRequest from '../models/joinRequest.model.js'
import Party from '../models/party.model.js'
import PartyMember from '../models/partyMember.model.js'
import User from '../models/User.js'
import authMiddleware from '../middleware/authMiddleware.js'
import Plan from '../models/Plan.js'

const router = express.Router()

// 로그인 상태 확인 미들웨어 (세션 기준)
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user && req.session.user._id) {
    next()
  } else {
    res.status(401).json({ message: '로그인이 필요합니다.' })
  }
}

// 로그인된 사용자 파티 정보 조회
router.get('/my-party', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user._id

    const userJoinRequest = await JoinRequest.findOne({ user_id: userId, join_status: 'matched' })
    if (!userJoinRequest) {
      return res.status(404).json({ message: '속해있는 파티가 없습니다.' })
    }

    let party = await Party.findOne({ leader_join_request_id: userJoinRequest._id })
    if (!party) {
      const partyMember = await PartyMember.findOne({ member_join_request_id: userJoinRequest._id })
      if (!partyMember) {
        return res.status(404).json({ message: '속해있는 파티가 없습니다.' })
      }
      party = await Party.findById(partyMember.party_id)
      if (!party) {
        return res.status(404).json({ message: '속해있는 파티가 없습니다.' })
      }
    }

    if (party.disbanded_at) {
      return res.status(400).json({ message: '이미 해체된 파티입니다.' })
    }

    const leaderJoinRequest = await JoinRequest.findById(party.leader_join_request_id).populate(
      'user_id',
      'name email'
    )
    if (!leaderJoinRequest) {
      return res.status(404).json({ message: '파티장 정보를 찾을 수 없습니다.' })
    }

    const members = await PartyMember.find({ party_id: party._id }).populate({
      path: 'member_join_request_id',
      populate: { path: 'user_id', select: 'name email' },
    })

    return res.json({
      partyId: party._id,
      leader: {
        id: leaderJoinRequest.user_id._id,
        name: leaderJoinRequest.user_id.name,
        email: leaderJoinRequest.user_id.email,
      },
      members: members.map(m => ({
        id: m.member_join_request_id.user_id._id,
        name: m.member_join_request_id.user_id.name,
        email: m.member_join_request_id.user_id.email,
      })),
      created_at: party.created_at,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '서버 오류' })
  }
})

// 매칭 API - FIFO 방식
router.post('/match', async (req, res) => {
  try {
    const leader = await JoinRequest.findOne({ role: 'leader', join_status: 'pending' }).sort({
      priority: -1,
      created_at: 1,
    })

    const members = await JoinRequest.find({ role: 'member', join_status: 'pending' })
      .sort({ priority: -1, created_at: 1 })
      .limit(4)

    if (!leader || members.length < 4) {
      return res.status(400).json({ message: '매칭 가능한 인원이 부족합니다.' })
    }

    const party = new Party({ leader_join_request_id: leader._id })
    await party.save()

    const memberDocs = members.map(m => ({
      party_id: party._id,
      member_join_request_id: m._id,
    }))
    await PartyMember.insertMany(memberDocs)

    await JoinRequest.updateMany(
      { _id: { $in: [leader._id, ...members.map(m => m._id)] } },
      { $set: { join_status: 'matched' } }
    )

    return res.json({ message: '매칭 성공', party_id: party._id })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: '서버 오류' })
  }
})

// 모든 파티 조회
router.get('/all', async (req, res) => {
  try {
    const parties = await Party.find().populate({
      path: 'leader_join_request_id',
      populate: { path: 'user_id', select: 'name email' },
    })

    const partyMembers = await PartyMember.find().populate({
      path: 'member_join_request_id',
      populate: { path: 'user_id', select: 'name email' },
    })

    res.json({ parties, partyMembers })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '파티 정보 조회 실패' })
  }
})

// 파티 나가기
router.post('/leave', async (req, res) => {
  try {
    const { partyId, leavingJoinRequestId } = req.body
    if (!partyId || !leavingJoinRequestId) {
      return res.status(400).json({ message: 'partyId와 leavingJoinRequestId가 필요합니다.' })
    }

    const party = await Party.findById(partyId)
    if (!party) return res.status(404).json({ message: '파티를 찾을 수 없습니다.' })
    if (party.disbanded_at) return res.status(400).json({ message: '이미 해체된 파티입니다.' })

    const leaderJoinRequestId = party.leader_join_request_id.toString()
    const leavingId = leavingJoinRequestId.toString()
    const isLeaderLeaving = leaderJoinRequestId === leavingId

    const members = await PartyMember.find({ party_id: partyId })

    const totalMembersAfterLeave =
      (isLeaderLeaving ? 0 : 1) +
      members.filter(m => m.member_join_request_id.toString() !== leavingId).length

    if (isLeaderLeaving || totalMembersAfterLeave <= 3) {
      party.disbanded_at = new Date()
      await party.save()

      const remainingJoinRequestIds = [
        leaderJoinRequestId,
        ...members.map(m => m.member_join_request_id.toString()),
      ].filter(id => id !== leavingId)

      await JoinRequest.updateMany(
        { _id: { $in: remainingJoinRequestIds } },
        { $set: { join_status: 'pending', priority: 1 } }
      )

      await PartyMember.deleteMany({ party_id: partyId })
      await JoinRequest.findByIdAndDelete(leavingJoinRequestId)

      return res.json({
        message: '파티가 해체되었으며, 남은 인원들은 pending 상태로 복귀되었습니다.',
      })
    }

    const leavingMember = await PartyMember.findOne({
      party_id: partyId,
      member_join_request_id: leavingJoinRequestId,
    })

    if (!leavingMember) {
      return res.status(400).json({
        message: '해당 사용자는 파티장도 아니고 파티원도 아닙니다.',
      })
    }

    await leavingMember.deleteOne()
    await JoinRequest.findByIdAndDelete(leavingJoinRequestId)

    return res.json({
      message: '파티원이 정상적으로 탈퇴하였습니다.',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: '서버 오류' })
  }
})

// 이름으로 파티 조회
router.get('/party-members-by-name', async (req, res) => {
  try {
    const userName = req.query.user_name || req.body.user_name
    if (!userName) {
      return res.status(400).json({ message: 'user_name이 필요합니다.' })
    }

    const user = await User.findOne({ name: userName })
    if (!user) {
      return res.status(404).json({ message: '해당 이름의 사용자를 찾을 수 없습니다.' })
    }

    const userJoinRequest = await JoinRequest.findOne({ user_id: user._id, join_status: 'matched' })
    if (!userJoinRequest) {
      return res.status(404).json({ message: '해당 사용자가 속한 파티가 없습니다.' })
    }

    let party = await Party.findOne({ leader_join_request_id: userJoinRequest._id })
    if (!party) {
      const partyMember = await PartyMember.findOne({ member_join_request_id: userJoinRequest._id })
      if (!partyMember) {
        return res.status(404).json({ message: '해당 사용자가 속한 파티가 없습니다.' })
      }
      party = await Party.findById(partyMember.party_id)
      if (!party) {
        return res.status(404).json({ message: '해당 사용자가 속한 파티가 없습니다.' })
      }
    }

    if (party.disbanded_at) {
      return res.status(400).json({ message: '이미 해체된 파티입니다.' })
    }

    const leaderJoinRequest = await JoinRequest.findById(party.leader_join_request_id).populate(
      'user_id',
      'name'
    )
    if (!leaderJoinRequest || !leaderJoinRequest.user_id) {
      return res.status(404).json({ message: '파티장 정보를 찾을 수 없습니다.' })
    }

    const members = await PartyMember.find({ party_id: party._id }).populate({
      path: 'member_join_request_id',
      populate: { path: 'user_id', select: 'name' },
    })

    const leaderName = leaderJoinRequest.user_id?.name || '이름 없음'
    const memberNames = members.map(m => m.member_join_request_id.user_id?.name || '이름 없음')

    return res.json({
      partyId: party._id,
      leader: leaderName,
      members: memberNames,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: '서버 오류' })
  }
})

// 해체되지 않은 모든 파티 조회
router.get('/active', async (req, res) => {
  try {
    const parties = await Party.find({ disbanded_at: null }).populate({
      path: 'leader_join_request_id',
      populate: {
        path: 'user_id',
        populate: {
          path: 'plan_id',
          select: 'name price',
        },
        select: 'name email plan_id',
      },
    })

    const partyId = parties.map(p => p._id)

    const partyMembers = await PartyMember.find({ party_id: partyId }).populate({
      path: 'member_join_request_id',
      populate: {
        path: 'user_id',
        populate: {
          path: 'plan_id',
          select: 'name price',
        },
        select: 'name email plan_id',
      },
    })

    const membersByParty = {}
    for (const member of partyMembers) {
      const pid = member.party_id.toString()
      if (!membersByParty[pid]) membersByParty[pid] = []
      membersByParty[pid].push(member)
    }

    const result = parties.map(party => {
      const partyIdStr = party._id.toString()
      const leaderUser = party.leader_join_request_id?.user_id

      return {
        created_at: party.created_at,
        leader: leaderUser
          ? {
              name: leaderUser.name,
              email: leaderUser.email,
              plan: leaderUser.plan_id,
            }
          : null,
        members: (membersByParty[partyIdStr] || []).map(m => {
          const user = m.member_join_request_id?.user_id
          return user
            ? {
                name: user.name,
                email: user.email,
                plan: user.plan_id,
              }
            : null
        }),
      }
    })

    res.json({ activeParties: result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '파티 정보 조회 실패', error: err.message })
  }
})

// ✅ 파티 정보 조회 (GET /api/party/infor)
router.get('/infor', authMiddleware, async (req, res) => {
  try {
    // 1. 로그인한 사용자 joinRequest (matched 상태) 조회
    const userJoinRequest = await JoinRequest.findOne({
      user_id: req.user.id,
      join_status: 'matched',
    })
    if (!userJoinRequest) {
      return res.status(404).json({ message: '속해있는 파티가 없습니다.' })
    }

    // 2. 파티 조회 (리더인지 멤버인지에 따라)
    let party = await Party.findOne({ leader_join_request_id: userJoinRequest._id })
    if (!party) {
      const partyMember = await PartyMember.findOne({
        member_join_request_id: userJoinRequest._id,
      })
      if (!partyMember) {
        return res.status(404).json({ message: '속해있는 파티가 없습니다.' })
      }
      party = await Party.findById(partyMember.party_id)
      if (!party) {
        return res.status(404).json({ message: '속해있는 파티가 없습니다.' })
      }
    }

    if (party.disbanded_at) {
      return res.status(400).json({ message: '이미 해체된 파티입니다.' })
    }

    // 3. 파티장 JoinRequest 조회
    const leaderJoin = await JoinRequest.findById(party.leader_join_request_id)
    if (!leaderJoin) {
      return res.status(404).json({ message: '파티장 JoinRequest를 찾을 수 없습니다.' })
    }

    // 4. 파티장 User 조회
    const leaderUser = await User.findById(leaderJoin.user_id)
    if (!leaderUser) {
      return res.status(404).json({ message: '파티장 유저를 찾을 수 없습니다.' })
    }
    if (!leaderUser.plan_id) {
      return res.status(404).json({ message: '파티장 요금제가 없습니다.' })
    }

    // 5. 파티장 Plan 조회
    const leaderPlan = await Plan.findById(leaderUser.plan_id)
    if (!leaderPlan) {
      return res.status(404).json({ message: '파티장 요금제 정보를 찾을 수 없습니다.' })
    }

    const leader_infor = {
      leader_email: leaderUser.email,
      leader_name: leaderUser.name,
      plan_name: leaderPlan.plan_name,
      plan_fee: leaderPlan.price,
    }

    // 6. 파티 멤버들 조회 + populate user & plan
    const members = await PartyMember.find({ party_id: party._id }).populate({
      path: 'member_join_request_id',
      populate: {
        path: 'user_id',
        populate: { path: 'plan_id' },
      },
    })
    console.log('====== 멤버 확인 시작 ======')
    members.forEach((m, i) => {
      console.log(`멤버 ${i + 1}`)
      console.log('JoinRequest ID:', m.member_join_request_id?._id)
      console.log('User:', m.member_join_request_id?.user_id)
      console.log('Plan:', m.member_join_request_id?.user_id?.plan_id)
    })
    const crew_infor = members
      .map(m => {
        const user = m.member_join_request_id?.user_id
        const plan = user?.plan_id
        if (!user || !plan) return null
        return {
          member_email: user.email,
          member_name: user.name,
          plan_name: plan.plan_name,
          plan_monthly_fee: plan.price,
        }
      })
      .filter(Boolean)

    // ✅ 응답 반환
    res.json({
      leader_infor,
      crew_infor,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '서버 오류' })
  }
})
export default router
