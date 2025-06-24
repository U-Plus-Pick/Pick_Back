import mongoose from 'mongoose'

const planSchema = new mongoose.Schema({
  plan_name: { type: String, required: true },
  plan_monthly_fee: { type: Number, required: true },
  plan_data_count: { type: Number, required: true },
  plan_smart_benefit: { type: String },
  plan_voice_minutes: { type: Number, default: 0 },
  plan_sms_count: { type: Number, default: 0 },
  plan_basic_benefit: { type: String },
  plan_premium_benefit: { type: String },
  plan_media_benefit: { type: String },
  // bundle_benefit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BundleBenefit' }, // 정의되지 않은 테이블
})

export default mongoose.model('Plan', planSchema)
