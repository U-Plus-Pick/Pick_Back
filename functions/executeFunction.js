const checkMembershipGrade = require('./checkMembershipGrade');
const getMembershipBenefits = require('./getMembershipBenefits');
const getBrandBenefits = require('./getBrandBenefits');

const executeFunction = async (functionName, functionArgs) => {
    switch (functionName) {
        case 'get_membership_benefits':
            return await getMembershipBenefits(functionArgs.grade);
        case 'get_brand_benefits':
            return await getBrandBenefits(functionArgs.brand_name, functionArgs.member_grade);
        case 'check_membership_grade':
            return await checkMembershipGrade(
                functionArgs.plan_amount,
                functionArgs.inquiry_type,
                functionArgs.target_grade
            );
        default:
            throw new Error(`Unknown function: ${functionName}`);
    }
};

module.exports = executeFunction;
