import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'bot'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const chatroomSchema = new mongoose.Schema(
  {
    chatroom_id: {
      type: Number,
      required: true,
    },
    user_email: {
      type: String,
      required: true,
      ref: 'User',
    },
    started_at: {
      type: Date,
      default: Date.now,
    },
    ended_at: {
      type: Date,
      default: null,
    },
    chat_message: [chatMessageSchema],
    chatroom_title: {
      type: String,
      maxlength: 30,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

const Chatroom = mongoose.model('Chatroom', chatroomSchema)

export default Chatroom
