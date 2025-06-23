import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  leader_email: { type: String, required: true, unique: true },
  leader_name: { type: String, required: true },
  leader_bank_name: { type: String, required: true },
  leader_account_number: { type: String, required: true },
  document_status: { type: String, default: '미제출' },
})

const Payment = mongoose.model('Payment', paymentSchema)
export default Payment
