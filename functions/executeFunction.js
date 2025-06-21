import checkMembershipGrade from './checkMembershipGrade.js'
import getMembershipBenefits from './getMembershipBenefits.js'
import getBrandBenefits from './getBrandBenefits.js'

const executeFunction = async (functionName, functionArgs) => {
  switch (functionName) {
    case 'get_membership_benefits':
      return await getMembershipBenefits(functionArgs.grade)
    case 'get_brand_benefits':
      return await getBrandBenefits(functionArgs.brand_name, functionArgs.member_grade)
    case 'check_membership_grade':
      return await checkMembershipGrade(
        functionArgs.plan_amount,
        functionArgs.inquiry_type,
        functionArgs.target_grade
      )
    default:
      throw new Error(`Unknown function: ${functionName}`)
  }
}

export default executeFunction
