import express from 'express'
import Payment from '../models/Payment.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/leader', authMiddleware, async (req, res) => {
  try {
    const { leader_email, leader_name, leader_bank_name, leader_account_number } = req.body

    if (!leader_email || !leader_name || !leader_bank_name || !leader_account_number) {
      return res.status(400).json({ message: '필수 정보가 누락되었습니다.' })
    }

    const status = '제출' // 항상 제출 상태로 저장

    let payment = await Payment.findOne({ leader_email })

    if (payment) {
      payment.set({
        leader_name,
        leader_bank_name,
        leader_account_number,
        document_status: status,
      })
    } else {
      payment = new Payment({
        leader_email,
        leader_name,
        leader_bank_name,
        leader_account_number,
        document_status: status,
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

export default router
