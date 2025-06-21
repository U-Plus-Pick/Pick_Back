const checkMembershipGrade = async (plan_amount, inquiry_type, target_grade) => {
  try {
    const gradeRequirements = {
      VVIP: {
        planAmount: 95000,
        annualAmount: 2000000,
        description: 'VVIP 등급',
      },
      VIP: {
        planAmount: 74800,
        annualAmount: 1000000,
        description: 'VIP 등급',
      },
      우수: {
        planAmount: 0,
        annualAmount: 0,
        description: '우수 등급',
      },
    }

    if (inquiry_type === 'check_grade' && plan_amount) {
      let grade = '우수'
      if (plan_amount >= 95000) {
        grade = 'VVIP'
      } else if (plan_amount >= 74800) {
        grade = 'VIP'
      }

      return {
        inquiry_type: 'check_grade',
        plan_amount: plan_amount,
        grade: grade,
        description: `${plan_amount.toLocaleString()}원 요금제는 ${grade} 등급에 해당합니다.`,
        note:
          grade !== '우수'
            ? `또는 연간 누적 통신요금이 ${gradeRequirements[
                grade
              ].annualAmount.toLocaleString()}원 이상이면 ${grade} 등급을 유지할 수 있습니다.`
            : 'VIP 이상 등급을 원하시면 74,800원 이상 요금제 또는 연간 누적 통신요금 조건을 확인해주세요.',
      }
    }

    if (inquiry_type === 'grade_requirements') {
      if (!target_grade || !gradeRequirements[target_grade]) {
        return {
          error: '유효하지 않은 등급입니다. (VIP, VVIP, 우수 중 선택해주세요)',
        }
      }

      const requirements = gradeRequirements[target_grade]

      if (target_grade === '우수') {
        return {
          inquiry_type: 'grade_requirements',
          target_grade: target_grade,
          description: '우수 등급은 기본 등급으로, 별도 조건이 없습니다.',
          note: 'VIP 이상 등급을 원하시면 아래 조건을 확인해주세요.',
        }
      }

      return {
        inquiry_type: 'grade_requirements',
        target_grade: target_grade,
        requirements: {
          planAmount: requirements.planAmount,
          annualAmount: requirements.annualAmount,
        },
        description: `${target_grade} 등급 달성 조건 (둘 중 하나만 충족하면 됩니다):`,
        conditions: [
          `모바일 요금제: ${requirements.planAmount.toLocaleString()}원 이상`,
          `또는 연간 누적 통신요금: ${requirements.annualAmount.toLocaleString()}원 이상`,
        ],
        note: '위 두 조건 중 하나만 충족하면 해당 등급을 유지할 수 있습니다.',
      }
    }
    return { error: '올바르지 않은 문의 유형입니다.' }
  } catch (error) {
    console.error(error)
    return { error: '등급 확인 중 오류가 발생했습니다.' }
  }
}

export default checkMembershipGrade
