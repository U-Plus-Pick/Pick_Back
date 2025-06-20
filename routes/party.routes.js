const express = require('express')
const router = express.Router()
const JoinRequest = require('../models/joinRequest.model')
const Party = require('../models/party.model')
const PartyMember = require('../models/partyMember.model')

// 매칭 API
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

// 모든 파티 정보 조회 API
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

// 파티 나가기 API
// 파티 나가기 API
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

    // 👉 남은 인원 수 계산 (나가려는 사람 제외)
    const totalMembersAfterLeave =
      (isLeaderLeaving ? 0 : 1) +
      members.filter(m => m.member_join_request_id.toString() !== leavingId).length

    // ✅ 해체 조건: 파티장이 나가거나, 파티장 포함 인원이 2명 이하일 경우
    if (isLeaderLeaving || totalMembersAfterLeave <= 2) {
      party.disbanded_at = new Date()
      await party.save()

      // 🟡 남아 있는 사람들 (떠나는 사람 제외)
      const remainingJoinRequestIds = [
        leaderJoinRequestId,
        ...members.map(m => m.member_join_request_id.toString()),
      ].filter(id => id !== leavingId)

      // 남은 인원들을 대기열로 복귀시킴
      await JoinRequest.updateMany(
        { _id: { $in: remainingJoinRequestIds } },
        { $set: { join_status: 'pending', priority: 1 } }
      )

      // 모든 파티 멤버 삭제
      await PartyMember.deleteMany({ party_id: partyId })

      // 나가는 사람의 요청은 삭제
      await JoinRequest.findByIdAndDelete(leavingJoinRequestId)

      return res.json({
        message: '파티가 해체되었으며, 남은 인원들은 pending 상태로 복귀되었습니다.',
      })
    }

    // ✅ 일반 파티원이 나가는 경우
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

module.exports = router
