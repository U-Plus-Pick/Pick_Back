import mongoose from 'mongoose'

const partySchema = new mongoose.Schema({
  leader_join_request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JoinRequest',
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  disbanded_at: { type: Date },
})

const Party = mongoose.model('Party', partySchema)

export default Party
