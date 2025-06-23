import mongoose from 'mongoose'

const { Schema, model } = mongoose

const partyMemberSchema = new Schema({
  party_id: {
    type: Schema.Types.ObjectId,
    ref: 'Party',
    required: true,
  },
  member_join_request_id: {
    type: Schema.Types.ObjectId,
    ref: 'JoinRequest',
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

const PartyMember = model('PartyMember', partyMemberSchema)

export default PartyMember
