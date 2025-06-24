import mongoose from 'mongoose'

const partySchema = new mongoose.Schema(
  {
    party_leader_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      alias: 'leader_id',
    },
    party_leader_email: {
      type: String,
      required: true,
      alias: 'leader_email',
    },
    party_leader_name: {
      type: String,
      alias: 'leader_name',
    },
    party_members: {
      type: [
        {
          member_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          member_email: {
            type: String,
          },
        },
      ],
      alias: 'crew',
    },
    party_status: {
      type: String,
      enum: ['모집중', '모집완료', '파티 해체'],
      default: '모집중',
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

const Party = mongoose.model('Party', partySchema)
export default Party
