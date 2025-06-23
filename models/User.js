import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthdate: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plan: { type: String, maxlength: 50, default: null },
})

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    try {
      this.password = await bcrypt.hash(this.password, 10)
    } catch (err) {
      return next(err)
    }
  }
  next()
})

userSchema.methods.comparePassword = async function (password) {
  if (!password || !this.password) {
    throw new Error('비밀번호 또는 저장된 해시가 누락되었습니다.')
  }
  return await bcrypt.compare(password, this.password)
}

export default mongoose.model('User', userSchema)
