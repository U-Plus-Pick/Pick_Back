import express from 'express'
import JoinRequest from '../models/joinRequest.model.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const newRequest = new JoinRequest(req.body)
    await newRequest.save()
    res.status(201).json({ message: 'Join request created', data: newRequest })
  } catch (err) {
    res.status(400).json({ message: 'Error creating join request', error: err.message })
  }
})

export default router
