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

// Plan 클래스 정의
export class Plan {
  constructor(planData) {
    this.plan_name = planData.plan_name
    this.plan_monthly_fee = planData.plan_monthly_fee
    this.plan_data_count = planData.plan_data_count
    this.plan_smart_benefit = planData.plan_smart_benefit
    this.plan_voice_minutes = planData.plan_voice_minutes || 0
    this.plan_sms_count = planData.plan_sms_count || 0
    this.plan_basic_benefit = planData.plan_basic_benefit
    this.plan_premium_benefit = planData.plan_premium_benefit
    this.plan_media_benefit = planData.plan_media_benefit
  }

  // 제외할 요금제인지 확인
  isExcluded() {
    const excludeKeywords = [
      '시니어',
      '복지',
      '청소년',
      '키즈',
      '현역병사',
      '유쓰',
      '시니어용',
      '복지용',
      '청소년용',
      '키즈용',
      '현역병사용',
      '유쓰용',
    ]

    return excludeKeywords.some(keyword =>
      this.plan_name.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  // 5G 요금제인지 확인
  is5G() {
    return this.plan_name.toLowerCase().includes('5g')
  }

  // 표시용 포맷으로 변환
  toDisplayFormat() {
    return {
      plan_name: this.plan_name,
      plan_monthly_fee: this.plan_monthly_fee,
      plan_data_count: this.plan_data_count,
      plan_voice_minutes: this.plan_voice_minutes,
      plan_sms_count: this.plan_sms_count,
      plan_smart_benefit: this.plan_smart_benefit,
      plan_basic_benefit: this.plan_basic_benefit,
      plan_premium_benefit: this.plan_premium_benefit,
      plan_media_benefit: this.plan_media_benefit,
      is5G: this.is5G(),
    }
  }
}

export default mongoose.model('Plan', planSchema)
