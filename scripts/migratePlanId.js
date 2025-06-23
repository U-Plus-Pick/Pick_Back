import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js' // scripts 폴더에서 models 폴더로 상대경로 맞춤
import Plan from '../models/Plan.js'

dotenv.config()

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('DB connected')

    const users = await User.find({ plan_id: { $exists: false } })

    for (const user of users) {
      if (user.plan) {
        const planDoc = await Plan.findOne({ plan_name: user.plan })
        if (planDoc) {
          user.plan_id = planDoc._id
          user.plan = undefined // 필요하면 제거
          await user.save()
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
