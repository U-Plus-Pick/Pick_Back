// 전체 요금제 조회 API
import express from 'express'
import { getAllPlans } from '../services/planService.js'

const router = express.Router()

router.get('/', getAllPlans)

export default router
