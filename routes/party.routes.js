// routes/party.routes.js
import express from 'express'
import JoinRequest from '../models/joinRequest.model.js'
import Party from '../models/party.model.js'
import PartyMember from '../models/partyMember.model.js'

const router = express.Router()

// 파티 매칭
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

// 모든 그룹과 결합원 정보 가져오기
router.get('/all', async (req, res) => {
  try {
    const parties = await Party.find().populate({
      path: 'leader_join_request_id',
      populate: {
        path: 'user_id',
        select: 'name email',
      },
    })

    const partyMembers = await PartyMember.find().populate({
      path: 'member_join_request_id',
      populate: {
        path: 'user_id',
        select: 'name email',
      },
    })

    res.json({ parties, partyMembers })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '파티 정보 조회 실패' })
  }
})

// 파티장 또는 조건에 따른 파티 해체
router.post('/leader-leave', async (req, res) => {
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

    const members = await PartyMember.find({ party_id: partyId })
    const isLeaderLeaving = leaderJoinRequestId === leavingId
    const totalMembersCount = 1 + members.length

    if (isLeaderLeaving || totalMembersCount <= 2) {
      party.disbanded_at = new Date()
      await party.save()

      const joinRequestIds = [leaderJoinRequestId, ...members.map(m => m.member_join_request_id)]

      await JoinRequest.updateMany(
        { _id: { $in: joinRequestIds } },
        { $set: { join_status: 'pending', priority: 1 } }
      )

      await PartyMember.deleteMany({ party_id: partyId })

      return res.json({
        message: '파티가 해체되었습니다. 멤버들이 다시 대기열로 복귀했습니다.',
      })
    } else {
      return res.status(400).json({
        message: '파티장이 아니고, 파티원 수가 2명 이하가 아니므로 해체되지 않습니다.',
      })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: '서버 오류' })
  }
})

export default router
