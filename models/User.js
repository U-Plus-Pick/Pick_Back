import mongoose from 'mongoose'
import bcrypt from 'bcryptjs' // bcryptjs로 통일

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthdate: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan', // 여기 중요!
  },
})

// 저장 전 비밀번호 해싱
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model('User', userSchema)
