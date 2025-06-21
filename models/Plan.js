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
      name: this.plan_name || '이름 없음',
      monthly_fee: `${this.plan_monthly_fee.toLocaleString()}원`,
      data: this.plan_data_count >= 9999 ? '무제한' : `${this.plan_data_count}GB`,
      voice: this.plan_voice_minutes >= 9999 ? '무제한' : `${this.plan_voice_minutes}분`,
      sms: this.plan_sms_count >= 9999 ? '무제한' : `${this.plan_sms_count || 0}건`,
      benefit: this.plan_premium_benefit || '기본 혜택 포함',
    }
  }

  // 5G 요금제인지 확인
  is5G() {
    return this.plan_name.toLowerCase().includes('5g')
  }

  // 제외 대상 요금제인지 확인
  isExcluded() {
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
}
