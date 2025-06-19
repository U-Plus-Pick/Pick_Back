const mongoose = require('mongoose')

const partyMemberSchema = new mongoose.Schema({
  party_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  member_join_request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JoinRequest',
    required: true,
  },
})

module.exports = mongoose.model('PartyMember', partyMemberSchema)
