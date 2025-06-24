import express from 'express'
import auth from '../middleware/authMiddleware.js'
import { applyToParty } from '../functions/partyApplicantFunctions.js'

const router = express.Router()

router.post('/', auth, applyToParty)

export default router
