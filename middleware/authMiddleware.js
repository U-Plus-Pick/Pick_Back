const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '인증되지 않았습니다.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // req.user.id 등으로 사용 가능
    next()
  } catch (err) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' })
  }
}
