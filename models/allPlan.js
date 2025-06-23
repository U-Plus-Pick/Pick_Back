export default class Plan {
  constructor(data) {
    this.plan_name = data.plan_name || ''
    this.plan_monthly_fee = data.plan_monthly_fee || 0
    this.plan_data_count = data.plan_data_count || 0
    this.plan_voice_minutes = data.plan_voice_minutes || 0
    this.plan_sms_count = data.plan_sms_count || 0
    this.plan_premium_benefit = data.plan_premium_benefit || ''
    this.plan_media_benefit = data.plan_media_benefit || ''
    this.plan_basic_benefit = data.plan_basic_benefit || ''
    this.plan_smart_benefit = data.plan_smart_benefit || ''
  }

  // 요금제 정보를 표시용으로 포맷팅
  toDisplayFormat() {
    return {
      plan_name: this.plan_name || '이름 없음',
      plan_monthly_fee: `${this.plan_monthly_fee.toLocaleString()}원`,
      plan_data_count: this.plan_data_count >= 9999 ? '무제한' : `${this.plan_data_count}GB`,
      plan_voice_minutes:
        this.plan_voice_minutes >= 9999 ? '무제한' : `${this.plan_voice_minutes}분`,
      plan_sms_count: this.plan_sms_count >= 9999 ? '무제한' : `${this.plan_sms_count || 0}건`,
      plan_premium_benefit: this.plan_premium_benefit || '기본 혜택 포함',
      plan_media_benefit: this.plan_media_benefit || '',
      plan_basic_benefit: this.plan_basic_benefit || '',
      plan_smart_benefit: this.plan_smart_benefit || '',
    }
  }
}
