const mongoose = require('mongoose')

const partySchema = new mongoose.Schema({
  leader_join_request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JoinRequest',
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  disbanded_at: { type: Date },
})

module.exports = mongoose.model('Party', partySchema)
