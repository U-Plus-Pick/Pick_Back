import { getDb } from '../config/mongo.js'
import { Plan } from '../models/Plan.js'

export async function runRecommendPlan(args) {
  try {
    const db = await getDb()
    const collection = db.collection('plans')

    const query = {
      $and: [
        {
          plan_name: {
            $not: {
              $regex: /(시니어|복지|청소년|키즈|현역병사|유쓰)/i,
            },
          },
        },
      ],
    }

    if (args.plan_monthly_fee && args.plan_monthly_fee < 1000000) {
      query.$and.push({ plan_monthly_fee: { $lte: args.plan_monthly_fee } })
    }

    if (args.plan_data_count && args.plan_data_count > 0 && args.plan_data_count !== 50) {
      query.$and.push({ plan_data_count: { $gte: args.plan_data_count } })
    }
    if (args.plan_voice_minutes && args.plan_voice_minutes > 0) {
      query.$and.push({
        plan_voice_minutes: { $gte: args.plan_voice_minutes },
      })
    }

    const plans = await collection.find(query).toArray() // JavaScript에서 추가 필터링
    const filteredPlans = plans.filter(plan => {
      const planModel = new Plan(plan)
      return !planModel.isExcluded()
    })

    if (!filteredPlans || filteredPlans.length === 0) {
      const defaultPlans = await collection
        .find({
          plan_name: {
            $not: {
              $regex: /(시니어|복지|청소년|키즈|현역병사|유쓰)/i,
            },
          },
        })
        .sort({ plan_monthly_fee: -1 })
        .limit(3)
        .toArray()

      if (defaultPlans.length === 0) {
        return []
      }

      const filteredDefaultPlans = defaultPlans.filter(plan => {
        const planModel = new Plan(plan)
        return !planModel.isExcluded()
      })

      return filteredDefaultPlans.map(plan => {
        const planModel = new Plan(plan)
        return planModel.toDisplayFormat()
      })
    }

    const sortedPlans = filteredPlans
      .map(plan => {
        const planModel = new Plan(plan)
        return {
          ...plan,
          is5G: planModel.is5G(),
        }
      })
      .sort((a, b) => {
        if (a.is5G && !b.is5G) return -1
        if (!a.is5G && b.is5G) return 1
        return b.plan_monthly_fee - a.plan_monthly_fee
      })
      .slice(0, 5)

    const result = sortedPlans.map(plan => {
      const planModel = new Plan(plan)
      return planModel.toDisplayFormat()
    })

    return result
  } catch (err) {
    console.error('recommendPlan 오류:', err.message)
    return []
  }
}
