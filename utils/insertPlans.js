import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.MONGODB_DB

async function main() {
  const client = new MongoClient(MONGODB_URI)
  try {
    await client.connect()
    const db = client.db(DB_NAME)

    // 새로운 데이터 파일 경로
    const plansPath = path.join(__dirname, '../data/plans.json')
    const plans = JSON.parse(fs.readFileSync(plansPath, 'utf-8'))

    const collection = db.collection('plans')
    await collection.deleteMany({}) // 기존 데이터 초기화
    const result = await collection.insertMany(plans)

    console.log(`${result.insertedCount}개의 요금제가 삽입되었습니다.`)
  } catch (err) {
    console.error('삽입 중 오류 발생:', err.message)
  } finally {
    await client.close()
  }
}

main()
