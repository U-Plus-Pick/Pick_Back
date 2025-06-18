//express 불러오기
import express from 'express'
//express 사용
const app = express()
//port 번호 설정
const port = 3000

//http 서버 실행
app.listen(port, () => {
  console.log(`Server started... ${port}`)
})

app.get('/', (req, res) => {
  res.send('Hello!')
})
