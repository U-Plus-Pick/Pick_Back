import express from 'express'
import auth from '../middleware/authMiddleware.js'
import {
  getPartyStatus,
  getMyPartyInfo,
  leaveParty,
  checkMatchStatus,
  executePartyMatch,
} from '../functions/partyFunctions.js'

const router = express.Router()

router.get('/status', auth, getPartyStatus)
router.get('/infor', auth, getMyPartyInfo)
router.post('/leave', auth, leaveParty)
router.get('/match', auth, checkMatchStatus)
router.post('/match', auth, executePartyMatch)

export default router
