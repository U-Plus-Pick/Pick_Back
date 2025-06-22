// scripts/importPlans.js
import mongoose from 'mongoose'
import Plan from '../models/Plan.js'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

const plansFile = path.resolve('data/plans.json')

async function importPlans() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    const data = await fs.readFile(plansFile, 'utf-8')
    const plans = JSON.parse(data)

    await Plan.deleteMany({})
    await Plan.insertMany(plans)

    console.log('✅ 요금제 데이터 MongoDB에 삽입 완료')
    process.exit()
  } catch (err) {
    console.error('❌ 요금제 삽입 오류:', err)
    process.exit(1)
  }
}

importPlans()
