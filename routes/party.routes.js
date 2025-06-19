const express = require('express')
const router = express.Router()
const JoinRequest = require('../models/joinRequest.model')
const Party = require('../models/party.model')
const PartyMember = require('../models/partyMember.model')

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

    const memberDocs = members.map(m => ({ party_id: party._id, member_join_request_id: m._id }))
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
    // 대표 포함된 파티 정보
    const parties = await Party.find().populate({
      path: 'leader_join_request_id',
      populate: {
        path: 'user_id',
        select: 'name email', // 👈 name을 포함시킴
      },
    })

    // 파티원 정보
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

// routes/party.routes.js

router.post('/leader-leave', async (req, res) => {
  try {
    const { partyId, leavingJoinRequestId } = req.body
    if (!partyId || !leavingJoinRequestId) {
      return res.status(400).json({ message: 'partyId와 leavingJoinRequestId가 필요합니다.' })
    }

    // 1) 파티 조회
    const party = await Party.findById(partyId)
    if (!party) return res.status(404).json({ message: '파티를 찾을 수 없습니다.' })
    if (party.disbanded_at) return res.status(400).json({ message: '이미 해체된 파티입니다.' })

    const leaderJoinRequestId = party.leader_join_request_id.toString()
    const leavingId = leavingJoinRequestId.toString()

    // 2) 파티원 목록 조회 (파티장 제외한 멤버들)
    const members = await PartyMember.find({ party_id: partyId })

    // 3) 파티장인지 여부 확인
    const isLeaderLeaving = leaderJoinRequestId === leavingId

    // 4) 파티원 전체 수 (파티장 + 멤버)
    const totalMembersCount = 1 + members.length

    // 5) 해체 여부 판단
    if (isLeaderLeaving || totalMembersCount <= 2) {
      // 파티 해체 처리
      party.disbanded_at = new Date()
      await party.save()

      // 해체 대상 join_request_id 배열 (파티장 + 멤버)
      const joinRequestIds = [leaderJoinRequestId, ...members.map(m => m.member_join_request_id)]

      // join_requests 상태 변경 (pending, priority=1)
      await JoinRequest.updateMany(
        { _id: { $in: joinRequestIds } },
        { $set: { join_status: 'pending', priority: 1 } }
      )

      // 파티 멤버 삭제
      await PartyMember.deleteMany({ party_id: partyId })

      return res.json({ message: '파티가 해체되었습니다. 멤버들이 다시 대기열로 복귀했습니다.' })
    } else {
      // 해체 조건 불만족 시 메시지 반환
      return res.status(400).json({
        message: '파티장이 아니고, 파티원 수가 2명 이하가 아니므로 해체되지 않습니다.',
      })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: '서버 오류' })
  }
})

module.exports = router
