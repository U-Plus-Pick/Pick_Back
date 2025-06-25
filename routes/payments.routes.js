import express from 'express'
import Payment from '../models/Payment.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// 계좌 등록록
router.post('/leader', authMiddleware, async (req, res) => {
  try {
    const { leader_email, leader_name, leader_bank_name, leader_account_number } = req.body

    // 정보누락 유효성 검사
    if (!leader_email || !leader_name || !leader_bank_name || !leader_account_number) {
      return res.status(400).json({ message: '필수 정보가 누락되었습니다.' })
    }

    // 중복 등록 유효성 검사
    const existing = await Payment.findOne({ leader_email })
    if (existing) {
      return res.status(409).json({ message: '이미 등록된 이메일입니다.' })
    }

    let payment = await Payment.findOne({ leader_email })

    if (payment) {
      payment.set({
        leader_name,
        leader_bank_name,
        leader_account_number,
      })
    } else {
      payment = new Payment({
        leader_email,
        leader_name,
        leader_bank_name,
        leader_account_number,
      })
    }

    await payment.save()

    return res.json({
      message: 'payments 등록 완료',
      updated_status: payment.document_status,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: '서버 오류' })
  }
})

// 계좌 정보 수정
router.patch('/leader/change', authMiddleware, async (req, res) => {
  try {
    const leader_email = req.user.email // JWT에서 추출
    const { leader_bank_name, leader_account_number } = req.body

    if (!leader_bank_name || !leader_account_number) {
      return res.status(400).json({ message: '은행명과 계좌번호는 필수입니다.' })
    }

    const payment = await Payment.findOne({ leader_email })

    if (!payment) {
      return res.status(404).json({ message: '결제 정보가 존재하지 않습니다.' })
    }

    // 계좌 정보 업데이트
    payment.leader_bank_name = leader_bank_name
    payment.leader_account_number = leader_account_number

    await payment.save()

    return res.json({ message: '계좌 정보가 성공적으로 수정되었습니다.' })
  } catch (err) {
    console.error('계좌 수정 오류:', err)
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

export default router
