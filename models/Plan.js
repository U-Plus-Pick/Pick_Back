// models/Plan.js
import mongoose from 'mongoose'

const planSchema = new mongoose.Schema({
  plan_name: { type: String, required: true, unique: true },
  plan_monthly_fee: { type: Number, default: 0 },
  plan_data_count: { type: Number, default: 0 },
  plan_voice_minutes: { type: Number, default: 0 },
  plan_sms_count: { type: Number, default: 0 },
  plan_premium_benefit: { type: String, default: '' },
  plan_media_benefit: { type: String, default: '' },
  plan_basic_benefit: { type: String, default: '' },
  plan_smart_benefit: { type: String, default: '' },
})

// 가상 메서드: 표시용 포맷
planSchema.methods.toDisplayFormat = function () {
  return {
    name: this.plan_name || '이름 없음',
    monthly_fee: `${this.plan_monthly_fee.toLocaleString()}원`,
    data: this.plan_data_count >= 9999 ? '무제한' : `${this.plan_data_count}GB`,
    voice: this.plan_voice_minutes >= 9999 ? '무제한' : `${this.plan_voice_minutes}분`,
    sms: this.plan_sms_count >= 9999 ? '무제한' : `${this.plan_sms_count || 0}건`,
    benefit: this.plan_premium_benefit || '기본 혜택 포함',
  }
}

// 가상 메서드: 5G 요금제 여부
planSchema.methods.is5G = function () {
  return this.plan_name.toLowerCase().includes('5g')
}

// 가상 메서드: 제외 대상 여부
planSchema.methods.isExcluded = function () {
  const excludeKeywords = [
    '청소년',
    '시니어',
    '노인',
    '키즈',
    '유쓰',
    '너겟',
    '현역병사',
    '병사',
    '어린이',
    '주니어',
    '복지',
  ]
  return excludeKeywords.some(keyword =>
    this.plan_name.toLowerCase().includes(keyword.toLowerCase())
  )
}

export default mongoose.model('Plan', planSchema)
