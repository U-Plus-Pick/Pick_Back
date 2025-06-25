import multer from 'multer'
// 파일 업로드 처리(multer)
// 메모리 저장소 설정 (파일을 Buffer로 메모리에 저장)
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 파일 크기 20MB 제한
  fileFilter: (req, file, cb) => {
    //pdf만 허용
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('PDF 파일만 업로드 가능합니다.'))
    }
  },
})

export default upload
