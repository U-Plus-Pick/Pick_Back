const express = require('express')
const router = express.Router()
const JoinRequest = require('../models/joinRequest.model')

router.post('/', async (req, res) => {
  try {
    const { user_id } = req.body

    // 1) 이미 pending 또는 matched 상태로 신청한 내역이 있는지 확인
    const existing = await JoinRequest.findOne({
      user_id,
      join_status: { $in: ['pending', 'matched'] },
    })

    if (existing) {
      return res.status(400).json({
        message: '이미 대기 중이거나 매칭된 파티가 있어 중복 신청이 불가능합니다.',
      })
    }

    // 2) 신규 신청 생성
    const newRequest = new JoinRequest(req.body)
    await newRequest.save()

    res.status(201).json({ message: 'Join request created', data: newRequest })
  } catch (err) {
    res.status(400).json({ message: 'Error creating join request', error: err.message })
  }
})

module.exports = router
