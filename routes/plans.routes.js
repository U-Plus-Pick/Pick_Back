import express from 'express'
import Plan from '../models/Plan.js'

const router = express.Router()

// 전체 요금제 조회
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find().lean()
    res.json(
      plans.map(plan => ({
        plan_name: plan.plan_name,
        plan_monthly_fee: `${plan.plan_monthly_fee.toLocaleString()}원`,
        plan_data_count: plan.plan_data_count >= 9999 ? '무제한' : `${plan.plan_data_count}GB`,
        plan_premium_benefit: plan.plan_premium_benefit || '',
        plan_media_benefit: plan.plan_media_benefit || '',
        plan_voice_minutes:
          plan.plan_voice_minutes >= 9999 ? '무제한' : `${plan.plan_voice_minutes}분`,
        plan_sms_count: plan.plan_sms_count >= 9999 ? '무제한' : `${plan.plan_sms_count}건`,
        plan_basic_benefit: plan.plan_basic_benefit || '',
        plan_smart_benefit: plan.plan_smart_benefit || '',
        // bundle_benefit_id: plan.bundle_benefit_id || null,
      }))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '서버 오류' })
  }
})

export default router
