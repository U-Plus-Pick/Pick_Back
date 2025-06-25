import express from 'express'
import upload from '../middleware/upload.js'
import SubmitDocument from '../models/SubmitDocument.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// multipart/form-data로 전송된 파일 중 document 필드를 처리하여 req.file에 저장
router.post('/', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    const { party_id } = req.body //파일 이외의 텍스트 필드
    const file = req.file // 업로드된 파일
    const user_email = req.user.email // JWT에서 추출된 사용자 이메일

    if (!party_id || !file) {
      return res.status(400).json({ error: '필수 정보 누락됨' })
    }

    const submitted_at = new Date()

    const newDoc = new SubmitDocument({
      party_id,
      user_email,
      documents_name: file.originalname,
      documents: file.buffer,
      submitted_at: new Date(),
    })

    await newDoc.save()
    res.status(201).json({ message: '서류 저장 성공', submitted_at })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '서류 저장 실패' })
  }
})

export default router
