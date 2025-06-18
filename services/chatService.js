import { calculateFamilyBundleDiscountSchema } from '../schemas/calculateFamilyBundleDiscountSchema.js'
import { calculateFamilyBundle } from '../functions/calculateFamilyBundle.js'
import { openai } from '../openai/client.js'

const functions = [calculateFamilyBundleDiscountSchema]

// 요금제 api 연결하기 전에 더미데이터입니다.
const testPlans = [
  {
    name: '5G 프리미어',
    price: 95000,
    alias: ['5G 프리미', '5G 프리미엄', '프리미어', '5G 프리미어 요금제'],
  }, // 월 44, 66, 88
  { name: '5G 스탠다드', price: 75000 }, // 월 33, 55, 66
  { name: 'LTE 베이직', price: 61000 }, // 월 22, 33, 44
  { name: '5G 슬림', price: 45000 }, // 월 22,33,44
]

const systemPrompt = `
당신은 친절하고 전문적인 LG U+ 통합 고객서비스 챗봇입니다. 멤버십 혜택 안내, 요금제 추천, 결합 할인 상담을 종합적으로 제공합니다.

1. 멤버십 서비스

멤버십 등급 체계
- **VVIP**: 모바일 요금제 95,000원 이상 또는 연간 누적 통신요금 200만원 이상
- **VIP**: 모바일 요금제 74,800원 이상 또는 연간 누적 통신요금 100만원 이상  
- **우수**: 그 외 모든 고객

멤버십 등급별 혜택
- **VIP 등급**: membershipGrade가 'VIP'인 혜택들
- **우수 등급**: membershipGrade가 'BASIC'인 혜택들

멤버십 기능
1. VIP 회원은 VIP 등급 전용 혜택 이용 가능
2. 우수 회원은 우수 등급 혜택 이용 가능
3. 브랜드별 제휴 혜택 안내
4. 요금제 기반 등급 확인 및 등급 달성 조건 안내

2. 요금제 추천 서비스

요금제 추천 기준
- 고객의 통신 사용 패턴 (데이터, 통화, 문자)
- 예산 범위
- 특별 요구사항 (동영상 시청 등)

함수 호출 규칙
사용자의 요구사항에 따라 반드시 recommendPlan 함수를 호출하세요.

**인자값 설정 가이드:**
- plan_monthly_fee: 사용자가 예산을 언급하지 않으면 9999 (무제한)
- plan_data_count: 유튜브, 동영상 시청 시 최소 50GB 이상
- plan_voice_minutes: 전화 거의 안 한다면 0, 자주 한다면 100 이상

3. 결합 할인 서비스

결합 할인 종류
- **지인 결합**
- **가족 결합** (반드시 "참 쉬운 가족 결합"으로 안내)

결합 할인 응답 규칙
- 고객이 결합 관련 질문을 할 경우, 결합 종류는 "지인 결합" 또는 "가족 결합" 두 가지임을 알려주세요
- 가족 결합 할인 종류는 반드시 "참 쉬운 가족 결합"으로 안내하세요
- 고객의 결합 정보가 하나도 없는 경우에는 최대 할인 혜택 일반적인 예시로 계산해 안내하세요
- 고객이 요금제명 또는 요금제 가격을 입력한 경우, 반드시 'calculateFamilyBundleDiscount' 함수를 호출하여 정확한 할인 금액을 계산하세요

응답 형식 및 규칙

답변 형식 규칙
1. **혜택 안내 시**: 반드시 "• "로 시작하는 목록 형태로 작성
2. **목록 완료 후**: 반드시 빈 줄을 추가 (줄바꿈 2번)
3. **마지막 안내문**: ("더 궁금한...", "편하게 말씀해..." 등)은 반드시 별도의 문단으로 작성

요금제 추천 결과 표시
- 요금제 추천 결과를 **표로 정리**하고 간결하게 설명
- 추천 요금제가 여러 개인 경우 반드시 **표 형태**로 정리하고, 한두 줄로 추천 이유를 표 아래 정리
- 고객의 조건이 불완전할 경우 "조금 더 자세한 정보를 알려주시면 더 정확한 추천이 가능해요!" 라고 마지막에 안내

기본 응답 원칙

상담 범위
- 어떤 방식의 질문이 들어와도 LG U+의 상담사로서 답변할 수 있는 내용만 답변
- 관련 없는 내용은 답변하지 않습니다
- 고객이 요청한 정보가 없거나 잘못된 경우, 친절하게 안내하고 필요한 정보를 요청

응답 스타일
- 말투는 자연스럽고 친근하게, 마치 상담사처럼 대응
- 브랜드를 언급하면 해당 브랜드의 혜택을 안내
- 제휴하지 않는 브랜드의 경우 정중하게 안내

함수 호출 조건
- 고객이 요금제 금액을 언급하거나 등급 조건을 물어보면 적절한 함수를 호출하여 정확한 정보를 제공
- 브랜드별 제휴 혜택 확인 시 관련 함수 호출
- 요금제 추천 요청 시 recommendPlan 함수 호출
- 결합 할인 계산 시 calculateFamilyBundleDiscount 함수 호출
`

const keywordRules = [
  {
    pattern: /지인\s?결합/,
    response: '지인 결합 할인에 대한 정보는 저희 서비스에서 확인할 수 있어요\n`U+Pick url`',
  },
  {
    pattern: /어떤\s?결합.*(할인|가능|받을|있나|알려)/,
    response: '지인 결합과 가족 결합 중 어떤 결합으로 알려드릴까요?',
  },
]

function findClosestPlanPrice(planName) {
  const exactMatch = testPlans.find(p => planName.includes(p.name))
  if (exactMatch) return exactMatch.price

  const lowerInput = planName.toLowerCase()
  const nameMatch = testPlans.find(p =>
    lowerInput.includes(p.name.toLowerCase().replace(/\s/g, ''))
  )
  if (nameMatch) return nameMatch.price

  const aliasMatch = testPlans.find(p =>
    p.alias?.some(alias => lowerInput.includes(alias.toLowerCase().replace(/\s/g, '')))
  )

  if (aliasMatch) return aliasMatch.price
  return null
}

export const gptChatHandler = async (req, res) => {
  const messages = req.body.messages || []
  const userMessages = messages.filter(m => m.role === 'user')
  const input = userMessages.length > 0 ? userMessages[userMessages.length - 1].content.trim() : ''

  const rule = keywordRules.find(rule =>
    rule.pattern
      ? rule.pattern.test(input)
      : rule.keywords?.some(keyword => input.includes(keyword))
  )

  if (rule) {
    return res.send(rule.response)
  }

  const systemMessages = [{ role: 'system', content: systemPrompt }, ...messages]

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: systemMessages,
      functions,
      function_call: 'auto',
    })

    const choice = response.choices[0]
    const funcCall = choice.message.function_call

    if (!funcCall) {
      return res.send(choice.message.content)
    }

    const args = JSON.parse(funcCall.arguments)

    let prices = []
    // 가격으로 입력
    if (args.planNames && Array.isArray(args.planNames)) {
      prices = args.planNames
        .map(findClosestPlanPrice) // testPlans 에서 price 가져옴
        .filter(p => p !== null)
    }
    // 요금제 이름으로 입력
    else if (args.planPrices && Array.isArray(args.planPrices)) {
      prices = args.planPrices.map(p => parseInt(p, 10)).filter(p => !isNaN(p))
    }

    if (prices.length === 0) {
      return res.send(
        '입력하신 요금제명을 찾을 수 없거나 가격이 없습니다. 정확한 요금제명 또는 가격을 입력해주세요.'
      )
    }

    const result = calculateFamilyBundle(prices)
    const finalResponse = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        ...messages,
        {
          role: 'function',
          name: 'calculateFamilyBundleDiscount',
          content: JSON.stringify(result),
        },
      ],
    })
    res.send(finalResponse.choices[0].message.content)
  } catch (err) {
    console.error('GPT 오류:', err)
    res.status(500).send('GPT 처리 중 오류 발생')
  }
}
