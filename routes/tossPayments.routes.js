import express from 'express'
import TossPayment from '../models/tossPayments.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { id, user_email, payment_key, amount, payment_method, paid_status, paid_at } = req.body

    // 필수 항목 체크
    if (!user_email || !payment_key || !amount) {
      return res.status(400).json({ message: '필수 항목 누락' })
    }

    // 중복 방지
    const exists = await TossPayment.findOne({ id })
    if (exists) {
      return res.status(409).json({ message: '이미 존재하는 결제 ID입니다.' })
    }

    const newPayment = new TossPayment({
      id,
      user_email,
      toss_payment_key: payment_key, // DB에는 toss_payment_key로 저장
      amount,
      payment_method,
      paid_status,
      paid_at,
    })

    const saved = await newPayment.save()

    res.status(201).json({
      message: '결제 성공',
      data: {
        id: saved.id,
        user_email: saved.user_email,
        payment_key: saved.toss_payment_key,
        amount: saved.amount,
        payment_method: saved.payment_method,
        paid_status: saved.paid_status,
        paid_at: saved.paid_at,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '결제 실패', error: error.message })
  }
})

export default router
