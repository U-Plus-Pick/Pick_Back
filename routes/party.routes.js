import express from 'express'
import auth from '../middleware/authMiddleware.js'
import {
  getMyPartyInfo,
  handleApplicationByRole,
  handlePartyLeave,

  // getPartyStatus,
  // leaveParty,
  // checkMatchStatus,
  // executePartyMatch,
} from '../functions/partyFunctions.js'

const router = express.Router()

//파티 가입 정보 가져오기
router.get('/infor', auth, getMyPartyInfo)

//body 에 role을 받고, 처리
router.post('/apply', auth, handleApplicationByRole)

//파티 탈퇴
router.post('/leave', auth, handlePartyLeave)

// router.get('/status', auth, getPartyStatus)
// router.post('/leave', auth, leaveParty)
// router.get('/match', auth, checkMatchStatus)
// router.post('/match', auth, executePartyMatch)

export default router
