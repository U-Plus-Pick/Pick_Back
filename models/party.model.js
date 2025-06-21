import mongoose from 'mongoose'

const { Schema, model } = mongoose

const partySchema = new Schema({
  leader_join_request_id: {
    type: Schema.Types.ObjectId,
    ref: 'JoinRequest',
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  disbanded_at: { type: Date },
})

const Party = model('Party', partySchema)

export default Party
