import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

let db

export async function getDb() {
  if (db) return db //재연결 방지
  const client = await MongoClient.connect(process.env.MONGODB_URI)
  db = client.db(decodeURIComponent(process.env.MONGODB_DB))
  return db
}
