import mongoose from 'mongoose'

const joinRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['leader', 'member'], required: true },
  terms_agreed: { type: Boolean, required: true },
  join_status: { type: String, enum: ['pending', 'matched', 'cancelled'], default: 'pending' },
  priority: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  estimated_amount: { type: Number },
})

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema)

export default JoinRequest
