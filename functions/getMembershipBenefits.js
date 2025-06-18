const Benefit = require('../models/Benefit');

const getMembershipBenefits = async (grade) => {
    try {
        const dbGrade = grade === '우수' ? 'BASIC' : grade.toUpperCase();
        const benefits = await Benefit.find({
            membership_grade: dbGrade,
        })
            .select('membership_brand membership_description usageLimit membership_grade')
            .limit(3);

        if (benefits.length === 0) {
            return {
                error: `${grade} 등급에 해당하는 혜택을 찾을 수 없습니다.`,
            };
        }
        return {
            grade: grade,
            benefits: benefits.map((benefit) => ({
                brand: benefit.membership_brand,
                description: benefit.membership_description,
                usageLimit: grade === 'VIP' ? '월 1회 사용 가능' : '횟수 제한 없음',
                membership_grade: benefit.membership_grade,
            })),
        };
    } catch (error) {
        return { error: '혜택을 조회하는 중 오류가 발생했습니다.' };
    }
};

module.exports = getMembershipBenefits;
