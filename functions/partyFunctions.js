import Party from '../models/party.model.js'
import PartyApplicant from '../models/PartyApplicant.model.js'
import User from '../models/User.js'
import Plan from '../models/Plan.js'

// 현재 로그인한 사용자의 파티 정보를 조회하는 함수
// 본인이 속한 파티 정보를 찾아서 리턴 (파티장 또는 멤버 가능)
export const getMyPartyInfo = async (req, res) => {
  try {
    const userId = req.user.id
    console.log('현재 로그인된 유저 ID:', userId)

    // 본인이 리더거나 파티원인 파티 조회
    const party = await Party.findOne({
      $or: [{ party_leader_id: userId }, { 'party_members.member_id': userId }],
      party_status: { $ne: '파티 해체' },
    })
      .populate('party_leader_id', 'name email plan')
      .populate('party_members.member_id', 'name email plan')

    if (!party) {
      return res.status(404).json({ message: '참여 중인 파티가 없습니다.' })
    }

    // 리더 정보
    const leader = party.party_leader_id
    const leaderPlan = await Plan.findOne({ plan_name: leader.plan })

    const leader_infor = {
      leader_email: leader.email,
      leader_name: leader.name,
      plan_name: leaderPlan?.plan_name || '',
      plan_fee: leaderPlan?.plan_monthly_fee || 0,
    }

    // 파티원 정보
    const crew_infor = await Promise.all(
      party.party_members.map(async m => {
        const member = m.member_id
        const plan = await Plan.findOne({ plan_name: member.plan })
        return {
          member_email: member.email,
          member_name: member.name,
          plan_name: plan?.plan_name || '',
          plan_monthly_fee: plan?.plan_monthly_fee || 0,
        }
      })
    )

    // 응답 데이터
    const responseData = {
      party_status: party.party_status,
      created_at: party.created_at,
      leader_infor,
      crew_infor,
    }

    res.json({ message: '파티 정보 조회 성공', party: responseData })
  } catch (err) {
    console.error('파티 조회 오류:', err)
    res.status(500).json({ message: '서버 오류' })
  }
}

//Member, Leader 분기점점
export const handleApplicationByRole = async (req, res) => {
  try {
    const userId = req.user.id
    const { role } = req.body

    if (!role || !['leader', 'member'].includes(role)) {
      return res.status(400).send({ message: 'role은 leader 또는 member여야 합니다.' })
    }

    if (role === 'leader') {
      return await handleLeaderApplication(req, res)
    } else {
      return await handleMemberApplication(req, res)
    }
  } catch (err) {
    console.error('[handleApplicationByRole] 오류:', err)
    return res.status(500).send({ message: '서버 오류' })
  }
}

//멤버가 파티 신청을 했을 경우
//빈자리가 있는 기존 파티 -> 자동 가입
//없다면 PartyApplicant 등록 및 대기
export const handleMemberApplication = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId)

    if (!user) return res.status(404).send({ message: '사용자를 찾을 수 없습니다.' })

    // 이미 다른 파티에 속해있으면 중복 방지
    const existingParty = await Party.findOne({
      $or: [{ party_leader_id: userId }, { 'party_members.member_id': userId }],
      party_status: { $ne: '파티 해체' },
    })
    if (existingParty) {
      return res.status(400).send({ message: '이미 파티에 참여 중입니다.' })
    }

    // 현재 모집중이고 멤버가 4명 미만인 파티 찾기
    const availableParty = await Party.findOne({
      party_status: '모집중',
      'party_members.3': { $exists: false }, // 최대 3명 이하
    })

    if (availableParty) {
      availableParty.party_members.push({
        member_id: user._id,
        member_email: user.email,
      })

      if (availableParty.party_members.length === 4) {
        availableParty.party_status = '모집완료'
      }

      await availableParty.save()

      return res.status(200).send({
        message: '기존 파티에 자동으로 가입되었습니다.',
        party_id: availableParty._id,
      })
    }

    // 아직 파티가 없으므로 대기열 등록 전 → 생성 가능성 체크
    const waitingLeader = await PartyApplicant.findOne({
      apply_division: 'leader',
      party_id: null,
    }).sort({ applicant_priority: -1, created_at: 1 })

    const waitingMembers = await PartyApplicant.find({
      apply_division: 'member',
      party_id: null,
    })
      .sort({ applicant_priority: -1, created_at: 1 })
      .limit(3) // 현재 user 포함하면 총 4명

    // 조건 충족: 리더 1명 + 멤버 3명 + 지금 신청한 유저 = 총 4명
    if (waitingLeader && waitingMembers.length === 3) {
      const leaderUser = await User.findOne({ email: waitingLeader.applicant_email })
      const otherMemberUsers = await User.find({
        email: { $in: waitingMembers.map(m => m.applicant_email) },
      })

      const newParty = new Party({
        party_leader_id: leaderUser._id,
        party_leader_email: leaderUser.email,
        party_leader_name: leaderUser.name,
        party_members: [
          ...otherMemberUsers.map(mu => ({
            member_id: mu._id,
            member_email: mu.email,
          })),
          {
            member_id: user._id,
            member_email: user.email,
          },
        ],
        party_status: '모집완료',
      })

      await newParty.save()

      // 대기열에서 리더 + 멤버 3명 제거
      await PartyApplicant.deleteOne({ applicant_email: leaderUser.email })
      await PartyApplicant.deleteMany({
        applicant_email: { $in: waitingMembers.map(m => m.applicant_email) },
      })

      return res.status(201).send({
        message: '리더와 멤버가 충족되어 파티가 생성되었습니다.',
        party_id: newParty._id,
      })
    }

    // 대기열 PartyApplicant에 현재 유저 추가
    const duplicate = await PartyApplicant.findOne({ applicant_email: user.email })
    if (duplicate) {
      return res.status(400).send({ message: '이미 대기 중입니다.' })
    }

    const newApplicant = new PartyApplicant({
      party_id: null,
      applicant_phone: user.phone,
      applicant_email: user.email,
      applicant_birth: user.birthdate,
      applicant_plan: user.plan,
      apply_division: 'member',
      applicant_priority: 0,
    })

    await newApplicant.save()

    return res
      .status(201)
      .send({ message: '현재 가입 가능한 파티가 없어 대기열에 등록되었습니다.' })
  } catch (err) {
    console.error('[handleMemberApplication] 오류:', err)
    return res.status(500).send({ message: '서버 오류' })
  }
}

//리더가 파티 신청을 누른경우
//대기 중 멤버 4명 이상 -> 즉시 파티 생성
//멤버가 부족하면 PartyApplicant
export const handleLeaderApplication = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId)

    if (!user) return res.status(404).send({ message: '사용자를 찾을 수 없습니다.' })

    // 이미 파티 참여 중인지 확인
    const existingParty = await Party.findOne({
      $or: [{ party_leader_id: userId }, { 'party_members.member_id': userId }],
      party_status: { $ne: '파티 해체' },
    })
    if (existingParty) {
      return res.status(400).send({ message: '이미 파티에 참여 중입니다.' })
    }

    // 대기 중인 멤버 찾기 (우선순위 높은 순)
    const waitingMembers = await PartyApplicant.find({
      apply_division: 'member',
      party_id: null,
    })
      .sort({ applicant_priority: -1, created_at: 1 })
      .limit(4)

    // 멤버 4명 이상 → 즉시 파티 생성
    if (waitingMembers.length >= 4) {
      const memberEmails = waitingMembers.map(m => m.applicant_email)
      const memberUsers = await User.find({ email: { $in: memberEmails } })

      const newParty = new Party({
        party_leader_id: user._id,
        party_leader_email: user.email,
        party_leader_name: user.name,
        party_members: memberUsers.map(mu => ({
          member_id: mu._id,
          member_email: mu.email,
        })),
        party_status: '모집완료',
      })

      await newParty.save()

      // PartyApplicant에서 멤버 제거
      await PartyApplicant.deleteMany({ applicant_email: { $in: memberEmails } })

      await PartyApplicant.deleteOne({ applicant_email: user.email })

      return res.status(201).send({
        message: '멤버가 충분하여 파티가 즉시 생성되었습니다.',
        party_id: newParty._id,
      })
    }

    // 멤버 부족 → 리더를 대기열에 등록
    const duplicate = await PartyApplicant.findOne({ applicant_email: user.email })
    if (duplicate) {
      return res.status(400).send({ message: '이미 대기 중입니다.' })
    }

    const newApplicant = new PartyApplicant({
      party_id: null,
      applicant_phone: user.phone,
      applicant_email: user.email,
      applicant_birth: user.birthdate,
      applicant_plan: user.plan,
      apply_division: 'leader',
      applicant_priority: 0,
    })

    await newApplicant.save()

    return res.status(201).send({ message: '멤버가 부족하여 대기열에 등록되었습니다.' })
  } catch (err) {
    console.error('[handleLeaderApplication] 오류:', err)
    return res.status(500).send({ message: '서버 오류' })
  }
}

//파티 탈퇴 로직
//리더면 -> 파티 해체, 전원 PartyApplicant 재등록
//멤버면 -> 멤버 제거 -> 파티 인원이 3명 이하가 될 경우 해체 및 재등록
//아닐 시 파티 유지 + 새로운 사람 재등록
// partyFunctions.js 내부에 추가

export const handlePartyLeave = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId)
    if (!user) return res.status(404).send({ message: '사용자를 찾을 수 없습니다.' })

    const party = await Party.findOne({
      $or: [{ party_leader_id: userId }, { 'party_members.member_id': userId }],
      party_status: { $ne: '파티 해체' },
    })
    if (!party) return res.status(404).send({ message: '속해있는 파티가 없습니다.' })

    const isLeader = party.party_leader_id.toString() === userId
    const memberIndex = party.party_members.findIndex(m => m.member_id?.toString() === userId)

    //리더가 탈퇴한 경우
    if (isLeader) {
      party.party_status = '파티 해체'
      await party.save()

      const remainingUsers = await Promise.all(
        party.party_members.map(async m => await User.findById(m.member_id))
      )

      for (const u of remainingUsers) {
        if (!u) continue

        // 이미 대기 중인 우선순위 낮은 멤버
        await PartyApplicant.create({
          party_id: null,
          applicant_phone: u.phone,
          applicant_email: u.email,
          applicant_birth: u.birthdate,
          applicant_plan: u.plan,
          apply_division: 'member', // 또는 리더일 경우 'leader'
          applicant_priority: 1, // 우선권 부여
        })
      }

      // 리더는 PartyApplicant에서 삭제
      await PartyApplicant.deleteOne({ applicant_email: user.email })

      return res.send({ message: '리더 탈퇴로 인해 파티가 해체되었습니다. 멤버 재등록 완료' })
    }

    // 멤버가 탈퇴한 경우
    if (memberIndex !== -1) {
      party.party_members.splice(memberIndex, 1)

      if (party.party_members.length < 3) {
        party.party_status = '파티 해체'
        await party.save()

        const remainingUsers = await Promise.all(
          party.party_members.map(async m => await User.findById(m.member_id))
        )

        for (const u of remainingUsers) {
          if (!u) continue

          // 리더가 아니므로 apply_division: 'member'
          const applyDivision =
            u._id.toString() === party.party_leader_id.toString() ? 'leader' : 'member'

          await PartyApplicant.create({
            party_id: null,
            applicant_phone: u.phone,
            applicant_email: u.email,
            applicant_birth: u.birthdate,
            applicant_plan: u.plan,
            apply_division: applyDivision,
            applicant_priority: 1,
          })
        }

        return res.send({ message: '멤버 탈퇴로 인해 파티가 해체되었습니다. 남은 멤버버 재등록됨' })
      }

      // 파티 유지, 탈퇴자만 재등록
      await party.save()

      return res.send({ message: '정상적으로 파티 탈퇴. 탈퇴자는 대기열에 추가 X' })
    }
    return res.status(400).send({ message: '해당 멤버를 파티에서 찾을 수 없습니다.' })
  } catch (err) {
    console.error('[handlePartyLeave] 오류:', err)
    return res.status(500).send({ message: '서버 오류' })
  }
}

// // 현재 매칭 가능한 파티장/파티원 수를 조회하는 함수
// export const checkMatchStatus = async (req, res) => {
//   // leaderCount, memberCount 계산 → 매칭 가능한지 여부 반환
//   try {
//     const leaderCount = await PartyApplicant.countDocuments({
//       apply_division: 'leader',
//       party_id: null,
//       applicant_plan: { $ne: null },
//     })
//     const memberCount = await PartyApplicant.countDocuments({
//       apply_division: 'member',
//       party_id: null,
//       applicant_plan: { $ne: null },
//     })
//     res.send({
//       message: '매칭 상태 조회',
//       leaderCount,
//       memberCount,
//       canMatch: leaderCount >= 1 && memberCount >= 4,
//     })
//   } catch (err) {
//     console.error(err)
//     res.status(500).send({ message: '서버 오류' })
//   }
// }

// // 파티 매칭 실행: 조건 충족 시 하나의 파티 생성
// export const executePartyMatch = async (req, res) => {
//   try {
//     // ✅ 유효한 요금제 목록
//     const allowedPlans = [
//       '5G 시그니처',
//       '5G 프리미어 슈퍼',
//       '5G 프리미어 플러스',
//       '5G 프리미어 레귤러',
//       '5G 프리미어 에센셜',
//       '5G 스마트',
//       '5G 프리미엄',
//       '5G 스페셜',
//       '5G 슈퍼 플래티넘',
//       '5G 플래티넘',
//       'LTE 프리미어 플러스',
//       'LTE 프리미어 에센셜',
//     ]
//     const isPlanValid = planName =>
//       allowedPlans.map(p => p.trim().toLowerCase()).includes(planName.trim().toLowerCase())

//     // ✅ 리더 1명 찾기
//     const leaderApplicant = await PartyApplicant.findOne({
//       apply_division: 'leader',
//       party_id: null,
//     }).sort({ applicant_priority: -1, created_at: 1 })

//     if (!leaderApplicant || !isPlanValid(leaderApplicant.applicant_plan)) {
//       return res.status(400).json({ message: '유효한 파티장 정보가 없습니다.' })
//     }

//     // ✅ 멤버 4명 찾기
//     const memberApplicants = await PartyApplicant.find({
//       apply_division: 'member',
//       party_id: null,
//     })
//       .sort({ applicant_priority: -1, created_at: 1 })
//       .limit(4)

//     if (memberApplicants.length < 4 || memberApplicants.some(m => !isPlanValid(m.applicant_plan))) {
//       return res.status(400).json({ message: '유효한 파티원이 부족합니다.' })
//     }

//     // ✅ 유저 정보 조회
//     const leaderUser = await User.findOne({ email: leaderApplicant.applicant_email })
//     const memberUsers = await User.find({
//       email: { $in: memberApplicants.map(m => m.applicant_email) },
//     })

//     if (!leaderUser || memberUsers.length !== 4) {
//       return res.status(400).json({ message: '일치하는 사용자 정보를 찾을 수 없습니다.' })
//     }

//     // ✅ 파티 생성
//     const newParty = new Party({
//       party_leader_id: leaderUser._id,
//       party_leader_email: leaderUser.email,
//       party_leader_name: leaderUser.name,
//       party_members: memberApplicants.map(m => {
//         const matchedUser = memberUsers.find(u => u.email === m.applicant_email)
//         return {
//           member_id: matchedUser?._id,
//           member_email: m.applicant_email,
//           member_name: matchedUser?.name || 'Unknown',
//         }
//       }),
//       party_status: '모집완료',
//     })

//     await newParty.save()

//     // ✅ 파티ID 업데이트
//     const allApplicants = [leaderApplicant, ...memberApplicants]
//     await Promise.all(
//       allApplicants.map(app =>
//         PartyApplicant.findByIdAndUpdate(app._id, { party_id: newParty._id })
//       )
//     )

//     return res
//       .status(201)
//       .json({ message: '파티가 성공적으로 생성되었습니다.', party_id: newParty._id })
//   } catch (err) {
//     console.error('파티 매칭 중 오류:', err)
//     return res.status(500).json({ message: '서버 오류로 인해 파티 생성에 실패했습니다.' })
//   }
// }

// // 사용자가 파티에서 탈퇴하거나 파티장이 나갈 경우 파티를 해체하는 함수
// export const leaveParty = async (req, res) => {
//   // 파티장 → 파티 해체
//   // 파티원 → 멤버 목록에서 제거, 신청 기록 삭제
//   // 나머지 멤버 우선순위 +1 및 party_id null 처리

//   try {
//     const userId = req.user.id
//     const user = await User.findById(userId)
//     const party = await Party.findOne({
//       $or: [{ party_leader_id: userId }, { 'party_members.member_id': userId }],
//       party_status: { $ne: '파티 해체' },
//     })

//     if (!party) return res.status(404).send({ message: '속해있는 파티가 없습니다.' })

//     const isLeader = party.party_leader_id.toString() === userId
//     const memberIndex = party.party_members.findIndex(m => m.member_id?.toString() === userId)

//     if (!isLeader && memberIndex === -1)
//       return res.status(400).send({ message: '해당 사용자는 파티 멤버가 아닙니다.' })

//     if (isLeader || party.party_members.length <= 3) {
//       party.party_status = '파티 해체'
//       await party.save()

//       await PartyApplicant.deleteOne({ applicant_email: user.email, party_id: party._id })
//       await PartyApplicant.updateMany(
//         { party_id: party._id, applicant_email: { $ne: user.email } },
//         { $set: { party_id: null }, $inc: { applicant_priority: 1 } }
//       )

//       const reason = isLeader
//         ? '파티장이 탈퇴하여 파티가 해체되었습니다.'
//         : '파티원이 3명 이하로 남아 파티가 해체되었습니다.'
//       return res.send({ message: reason })
//     }

//     party.party_members.splice(memberIndex, 1)
//     await party.save()
//     await PartyApplicant.deleteOne({ applicant_email: user.email, party_id: party._id })

//     res.send({ message: '정상적으로 파티에서 탈퇴되었고 신청 기록이 삭제되었습니다.' })
//   } catch (err) {
//     console.error(err)
//     res.status(500).send({ message: '서버 오류' })
//   }
// }

// // 로그인한 사용자가 현재 파티에 소속되어 있는지 상태를 조회하는 함수
// export const getPartyStatus = async (req, res) => {
//   // 파티장인지, 파티원인지, 아니면 소속 없음인지 상태 반환
//   try {
//     const userId = req.user.id
//     const user = await User.findById(userId)
//     const party = await Party.findOne({
//       $or: [{ party_leader_email: user.email }, { 'party_members.member_email': user.email }],
//       party_status: { $ne: '파티 해체' },
//     })

//     if (!party) return res.send({ status: 'none', user_email: user.email })

//     const isLeader = party.party_leader_email === user.email
//     res.send({ status: isLeader ? 'leader' : 'member', user_email: user.email })
//   } catch (err) {
//     console.error(err)
//     res.status(500).send({ message: '서버 오류' })
//   }
// }
