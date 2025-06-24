import mongoose from 'mongoose'

const partySchema = new mongoose.Schema({
  party_leader_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  party_leader_email: {
    type: String,
    required: true,
  },
  party_leader_name: {
    type: String,
    required: true,
  },
  leader_plan_name: {
    // 파티장 요금제 이름 추가
    type: String,
  },
  leader_plan_monthly_fee: {
    // 파티장 요금제 가격 추가
    type: Number,
  },
  party_members: [
    {
      member_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      member_email: {
        type: String,
        required: true,
      },
      member_name: {
        type: String,
        required: true,
      },
      document_status: {
        type: String,
        enum: ['미제출', '제출완료', '검토중', '승인', '반려'],
        default: '미제출',
      },

      plan_name: {
        // 멤버 요금제 이름 추가
        type: String,
      },
      plan_monthly_fee: {
        // 멤버 요금제 가격 추가
        type: Number,
      },
    },
  ],
  party_status: {
    type: String,
    enum: ['모집중', '모집완료', '파티 해체'],
    default: '모집중',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model('Party', partySchema)
