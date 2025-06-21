import express from 'express'
import JoinRequest from '../models/joinRequest.model.js'

import User from '../models/User.js' // 경로 맞게 조정하세요

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { user_id } = req.body

    // 1) 사용자 정보 조회
    const user = await User.findById(user_id)
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    }

    // 2) 허용된 요금제 리스트
    const allowedPlans = [
      '5G 시그니처',
      '5G 프리미어 슈퍼',
      '5G 프리미어 플러스',
      '5G 프리미어 레귤러',
      '5G 프리미어 에셀셜',
      '5G 스마트',
      '5G 프리미엄',
      '5G 스페셜',
      '5G 슈퍼 플래티넘',
      '5G 플래티넘',
      'LTE 프리미어 플러스',
      'LTE 프리미어 에센셜',
    ]

    if (!allowedPlans.includes(user.plan)) {
      return res.status(400).json({
        message:
          '5G 시그니처, 5G 프리미어 슈퍼/플러스/레귤러/에셀셜, 5G 스마트/프리미엄/스페셜, 5G 슈퍼 플래티넘/플래티넘, LTE 프리미어 플러스/에센셜 요금제를 사용하는 고객만 파티 가입이 가능합니다.',
      })
    }

    // 3) 이미 pending 또는 matched 상태로 신청한 내역이 있는지 확인
    const existing = await JoinRequest.findOne({
      user_id,
      join_status: { $in: ['pending', 'matched'] },
    })

    if (existing) {
      return res.status(400).json({
        message: '이미 대기 중이거나 매칭된 파티가 있어 중복 신청이 불가능합니다.',
      })
    }

    // 4) 신규 신청 생성
    const newRequest = new JoinRequest(req.body)
    await newRequest.save()

    res.status(201).json({ message: 'Join request created', data: newRequest })
  } catch (err) {
    res.status(400).json({ message: 'Error creating join request', error: err.message })
  }
})

export default router
