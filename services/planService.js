import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import Plan from '../models/allPlan.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.MONGODB_DB

export const getAllPlans = async (req, res) => {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(DB_NAME)
    const rawPlans = await db.collection('plans').find().toArray()

    // console.log('전체 요금제 수:', rawPlans.length)

    // Plan 클래스로 가공
    const formattedPlans = rawPlans.map(planData => {
      const plan = new Plan(planData)
      return plan.toDisplayFormat()
    })

    //console.log('최종 표시할 요금제 수:', formattedPlans.length)

    res.status(200).json(formattedPlans)
  } catch (err) {
    console.error('전체 요금제 조회 오류:', err) // 스택 트레이스 포함
    res.status(500).json({ error: '요금제 데이터를 불러오는 중 오류가 발생' })
  } finally {
    try {
      await client.close()
    } catch (closeErr) {
      console.error('MongoDB 클라이언트 종료 오류:', closeErr)
    }
  }
}
