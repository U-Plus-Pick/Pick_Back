import Benefit from '../models/Benefit.js'

const getBrandBenefits = async (brand_name, member_grade = '우수') => {
  try {
    const normalizedBrandName = brand_name.trim()
    let brandBenefits = []

    const searchTermWithoutSpaces = normalizedBrandName.replace(/\s+/g, '')
    const searchTermRegex = normalizedBrandName.replace(/\s+/g, '\\s*')
    brandBenefits = await Benefit.find({
      membership_brand: { $regex: new RegExp(searchTermRegex, 'i') },
    })

    if (brandBenefits.length === 0) {
      brandBenefits = await Benefit.find({
        $or: [
          { membership_brand: { $regex: new RegExp(searchTermWithoutSpaces, 'i') } },
          {
            membership_brand: { $regex: new RegExp(normalizedBrandName.replace(/\s+/g, ''), 'i') },
          },
        ],
      })
    }

    if (brandBenefits.length === 0) {
      brandBenefits = await Benefit.find({
        aliases: { $in: [new RegExp(searchTermRegex, 'i')] },
      })
    }

    if (brandBenefits.length === 0) {
      const words = normalizedBrandName.split(/\s+/)
      if (words.length > 1) {
        const wordRegexes = words.map(word => new RegExp(word, 'i'))
        brandBenefits = await Benefit.find({
          $or: wordRegexes.map(regex => ({ membership_brand: regex })),
        })
      }
    }

    if (brandBenefits.length === 0) {
      try {
        brandBenefits = await Benefit.find({
          $text: { $search: normalizedBrandName },
        })
      } catch (textSearchError) {
        console.log('텍스트 검색 실패:', textSearchError.message)
      }
    }

    if (brandBenefits.length === 0) {
      return {
        partnership: false,
        brand_name: brand_name,
        message: `죄송합니다. ${brand_name}은(는) 현재 LG 멤버십 제휴 브랜드가 아닙니다.`,
      }
    }
    const grade = member_grade.toUpperCase()
    let filteredBenefits = brandBenefits

    filteredBenefits = brandBenefits

    if (filteredBenefits.length === 0) {
      return {
        partnership: true,
        brand_name: brand_name,
        member_grade: grade,
        message: `${brand_name}는 제휴 브랜드이지만 ${grade} 등급에는 해당하는 혜택이 없습니다.`,
      }
    }
    return {
      partnership: true,
      brand_name: filteredBenefits[0].membership_brand,
      member_grade: grade,
      message: `이외에도 다양한 혜택이 있으니 참고하세요.`,
      benefits: filteredBenefits.slice(0, 3).map(benefit => ({
        membership_grade: benefit.membership_grade,
        description: benefit.membership_description,
        usageLimit:
          benefit.membership_grade === 'VIP'
            ? '월 1회 사용 가능'
            : benefit.membership_grade === 'BASIC'
              ? '횟수 제한 없음'
              : benefit.usageLimit || '이용 조건 확인 필요',
        availableForUser:
          grade === 'VIP' ||
          benefit.membership_grade === 'BASIC' ||
          benefit.membership_grade === grade,
      })),
    }
  } catch (error) {
    console.error(error)
    return { error: '브랜드 혜택을 조회하는 중 오류가 발생했습니다.' }
  }
}

export default getBrandBenefits
