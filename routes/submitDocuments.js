import express from 'express'
import upload from '../middleware/upload.js'
import SubmitDocument from '../models/SubmitDocument.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import User from '../models/User.js'
import Party from '../models/party.model.js'

const router = express.Router()

// multipart/form-data로 전송된 파일 중 document 필드를 처리하여 req.file에 저장
router.post('/', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    const file = req.file // 업로드된 파일
    const user_email = req.user.email // JWT에서 추출된 사용자 이메일

    if (!user_email || !file) {
      return res.status(400).json({ error: 'user_email 또는 파일이 누락되었습니다.' })
    }

    // user_email로 User 찾기
    const user = await User.findOne({ email: user_email })
    if (!user) {
      return res.status(404).json({ error: '해당 이메일의 사용자를 찾을 수 없습니다.' })
    }

    // Party에서 party_id 찾기 (party_members.member_id에 user._id가 포함된 경우)
    const party = await Party.findOne({ 'party_members.member_id': user._id })
    if (!party) {
      return res.status(404).json({ error: '해당 사용자의 파티 정보를 찾을 수 없습니다.' })
    }
    const party_id = party._id.toString()
    const submitted_at = new Date()

    const newDoc = new SubmitDocument({
      party_id,
      user_email,
      documents_name: file.originalname,
      documents: file.buffer,
      submitted_at,
    })

    await newDoc.save()
    res.status(201).json({ message: '서류 저장 성공', submitted_at })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '서류 저장 실패' })
  }
})

export default router
