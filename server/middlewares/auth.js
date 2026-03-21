import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  let token = req.headers.authorization

  if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1]
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(401).json({ message: "Not authorised, user not found" })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" })
  }
}