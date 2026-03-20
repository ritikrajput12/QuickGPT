import Chat from "../models/Chat.js"
import User from "../models/User.js"
import openai from "../configs/openai.js"
import axios from "axios"
import imagekit from "../configs/imagekit.js"

export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id
    const { chatId, prompt } = req.body

    if (!chatId || !prompt) {
      return res.status(400).json({ success: false, message: "chatId and prompt required" })
    }

    const user = await User.findById(userId)
    if (!user || user.credits <= 0) {
      return res.status(403).json({ success: false, message: "Not enough credits" })
    }

    const chat = await Chat.findOne({ _id: chatId, userId })
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" })
    }

    const userMsg = {
      role: "user",
      content: prompt,
      timestamps: Date.now(),
      isImage: false
    }

    chat.messages.push(userMsg)

    const messages = chat.messages.map(m => ({
      role: m.role,
      content: m.content
    }))

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages
    })

    const aiMsg = {
      role: "assistant",
      content: completion.choices[0].message.content,
      timestamps: Date.now(),
      isImage: false
    }

    chat.messages.push(aiMsg)

    if (!chat.name || chat.name === "New Chat") {
      chat.name = prompt.slice(0, 30)
    }

    chat.updatedAt = new Date()
    await chat.save()

    await User.updateOne(
      { _id: userId, credits: { $gt: 0 } },
      { $inc: { credits: -1 } }
    )

    res.json({ success: true, reply: aiMsg })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id
    const { chatId, prompt, isPublished } = req.body

    if (!chatId || !prompt) {
      return res.status(400).json({ success: false, message: "chatId and prompt required" })
    }

    const user = await User.findById(userId)
    if (!user || user.credits < 2) {
      return res.status(403).json({ success: false, message: "Not enough credits" })
    }

    const chat = await Chat.findOne({ _id: chatId, userId })
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" })
    }

    const userMsg = {
      role: "user",
      content: prompt,
      timestamps: Date.now(),
      isImage: false
    }

    chat.messages.push(userMsg)

    if (!chat.name || chat.name === "New Chat") {
      chat.name = prompt.slice(0, 30)
    }

    chat.updatedAt = new Date()

    const encodedPrompt = encodeURIComponent(prompt)
    const uniqueName = Date.now() + ".png"

    const imageUrl =
      process.env.IMAGEKIT_URL_ENDPOINT +
      "/ik-genimg-prompt-" +
      encodedPrompt +
      "/quickgpt/" +
      uniqueName

    const img = await axios.get(imageUrl, { responseType: "arraybuffer" })

    if (!img.data || img.data.length === 0) {
      throw new Error("Image generation failed")
    }

    const base64Image =
      "data:image/png;base64," +
      Buffer.from(img.data).toString("base64")

    const upload = await imagekit.upload({
      file: base64Image,
      fileName: uniqueName,
      folder: "quickgpt"
    })

    const aiMsg = {
      role: "assistant",
      content: upload.url,
      timestamps: Date.now(),
      isImage: true,
      isPublished: Boolean(isPublished)
    }

    chat.messages.push(aiMsg)
    await chat.save()

    await User.updateOne(
      { _id: userId, credits: { $gte: 2 } },
      { $inc: { credits: -2 } }
    )

    res.json({ success: true, reply: aiMsg })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}