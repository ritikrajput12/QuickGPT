import User from "../models/User.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import Chat from "../models/Chat.js"

const generationToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  })
}

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body

  try {
    if (!password || password.length < 6) {
      return res.json({ success: false, message: "Password must be at least 6 characters" })
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.json({ success: false, message: "User already exists" })
    }

    const user = await User.create({
      name,
      email,
      password
    })

    const token = generationToken(user._id)

    res.json({ success: true, token })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" })
    }

    const token = generationToken(user._id)

    res.json({ success: true, token })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getUser = async (req, res) => {
  res.json({ success: true, user: req.user })
}

export const getPublishedImages = async (req, res) => {
  try {
    const images = await Chat.aggregate([
      { $unwind: "$messages" },
      {
        $match: {
          "messages.isImage": true,
          "messages.isPublished": true
        }
      },
      {
        $project: {
          _id: 0,
          imageUrl: "$messages.content",
          userName: "$userName"
        }
      }
    ])

    res.json({ success: true, images: images.reverse() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

