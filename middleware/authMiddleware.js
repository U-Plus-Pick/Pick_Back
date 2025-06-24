import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) {
    return res.status(401).send({ message: '인증 토큰이 필요합니다.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch (err) {
    console.error(err)
    res.status(401).send({ message: '유효하지 않은 토큰입니다.' })
  }
}

export default authMiddleware
