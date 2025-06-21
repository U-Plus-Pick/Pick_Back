import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI) // ← 여기를 수정!
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('❌ DB connection error:', err.message)
    process.exit(1)
  }
}

export default connectDB
