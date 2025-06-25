import mongoose from 'mongoose'

const submitDocumentSchema = new mongoose.Schema(
  {
    party_id: { type: String, required: true },
    user_email: { type: String, required: true },
    documents_name: { type: String, required: true },
    documents: { type: Buffer, required: true }, // pdf 파일을 Buffer 타입으로 저장->binary 데이터 저장
  },
  {
    collection: 'submit_documents', // 컬렉션 이름 명시
  }
)

const SubmitDocument = mongoose.model('SubmitDocument', submitDocumentSchema)
export default SubmitDocument
