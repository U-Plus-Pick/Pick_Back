import mongoose from 'mongoose'

const partySchema = new mongoose.Schema({
  party_leader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  party_leader_email: { type: String, required: true },
  party_leader_name: { type: String },
  party_members: [
    {
      member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      member_email: { type: String },
      document_status: {
        type: String,
        enum: ['미제출', '제출완료', '검토중', '승인', '반려'],
        default: '미제출',
      },
    },
  ],
  party_status: {
    type: String,
    enum: ['모집중', '모집완료', '파티 해체'],
    default: '모집중',
  },
  created_at: { type: Date, default: Date.now },
})

export default mongoose.model('Party', partySchema)
