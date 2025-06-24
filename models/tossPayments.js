import mongoose from 'mongoose'

const TossPaymentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // Toss 고유 결제 ID
    user_email: { type: String, required: true },
    toss_payment_key: { type: String, required: true },
    amount: { type: Number, required: true },
    payment_method: { type: String },
    paid_status: {
      type: String,
      enum: ['SUCCESS', 'FAIL'],
      default: 'SUCCESS',
    },
    paid_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'toss_payments', // 컬렉션 이름 명시
  }
)

export default mongoose.model('TossPayment', TossPaymentSchema)
