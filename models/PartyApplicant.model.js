import mongoose from 'mongoose'

const partyApplicantSchema = new mongoose.Schema({
  party_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', default: null },
  applicant_phone: { type: String, required: true },
  applicant_email: { type: String, required: true },
  applicant_birth: { type: Date, required: true },
  applicant_plan: {
    type: String, // ObjectId 대신 문자열로 저장
    required: true,
  },
  apply_division: { type: String, enum: ['leader', 'member'], required: true },
  applicant_priority: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
})

export default mongoose.model('PartyApplicant', partyApplicantSchema)
