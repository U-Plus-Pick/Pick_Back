// scripts/migrateUserPlans.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Plan from '../models/Plan.js'

dotenv.config()

async function migratePlans() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected')

    const users = await User.find({ plan: { $exists: true } })

    for (const user of users) {
      if (typeof user.plan === 'string') {
        const planDoc = await Plan.findOne({ plan_name: user.plan })
        if (planDoc) {
          user.plan_id = planDoc._id
          user.plan = undefined // 문자열 필드 제거
          await user.save()
          console.log(`✅ Updated user: ${user.email}`)
        } else {
          console.warn(`⚠️ Plan not found: "${user.plan}" for ${user.email}`)
        }
      }
    }

    console.log('🎉 모든 사용자 마이그레이션 완료')
    process.exit(0)
  } catch (err) {
    console.error('❌ 오류 발생:', err)
    process.exit(1)
  }
}

migratePlans()
