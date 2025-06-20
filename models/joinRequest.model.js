import mongoose from 'mongoose'

const { Schema, model } = mongoose

const joinRequestSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['leader', 'member'], required: true },
  terms_agreed: { type: Boolean, required: true },
  join_status: {
    type: String,
    enum: ['pending', 'matched', 'cancelled'],
    default: 'pending',
  },
  priority: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  estimated_amount: { type: Number },
})

const JoinRequest = model('JoinRequest', joinRequestSchema)

export default JoinRequest
