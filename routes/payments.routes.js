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

export default router
