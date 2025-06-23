// scripts/migratePlanId.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Plan from '../models/Plan.js'

dotenv.config()

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('DB connected')

    // plan_id 필드가 없거나 null인 유저 찾기
    const users = await User.find({ plan_id: { $exists: false } }).lean()

    for (const user of users) {
      if (user.plan) {
        // plan 필드 값으로 Plan 컬렉션에서 문서 조회
        const planDoc = await Plan.findOne({ plan_name: user.plan })
        if (planDoc) {
          // plan_id 업데이트 + plan 필드 완전 삭제
          await User.updateOne(
            { _id: user._id },
            {
              $set: { plan_id: planDoc._id },
              $unset: { plan: '' },
            }
          )
          console.log(`User ${user.email} updated with plan_id ${planDoc._id}`)
        } else {
          console.log(`Plan not found for user ${user.email}, plan name: ${user.plan}`)
        }
      } else {
        console.log(`User ${user.email} has no plan field`)
      }
    }

    await mongoose.disconnect()
    console.log('Migration complete')
  } catch (error) {
    console.error(error)
  }
}

migrate()
