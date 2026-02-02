import Chat from "../models/Chat.js"
import User from "../models/User.js"
import genAI from "../configs/gemini.js"
import axios from "axios"
import imagekit from "../configs/imagekit.js"

// TEXT MESSAGE
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id
    const { chatId, prompt } = req.body

    if (!chatId || !prompt) {
      return res.json({ success: false, message: "chatId and prompt required" })
    }

    const chat = await Chat.findOne({ _id: chatId, userId })
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" })
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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    })

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    const aiMsg = {
      role: "assistant",
      content: responseText,
      timestamps: Date.now(),
      isImage: false
    }

    chat.messages.push(aiMsg)
    await chat.save()

    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -1 } }
    )

    res.json({ success: true, reply: aiMsg })
  } catch (err) {
    console.log("GEMINI ERROR:", err.message)
    res.json({ success: false, message: err.message })
  }
}

// IMAGE MESSAGE
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id
    const { chatId, prompt, isPublished } = req.body

    if (!chatId || !prompt) {
      return res.json({ success: false, message: "chatId and prompt required" })
    }

    const chat = await Chat.findOne({ _id: chatId, userId })
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" })
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
    const imageUrl =
      process.env.IMAGEKIT_URL_ENDPOINT +
      "/ik-genimg-prompt-" +
      encodedPrompt +
      "/quickgpt.png"

    const img = await axios.get(imageUrl, { responseType: "arraybuffer" })

    const base64Image =
      "data:image/png;base64," +
      Buffer.from(img.data).toString("base64")

    const upload = await imagekit.upload({
      file: base64Image,
      fileName: Date.now() + ".png",
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
      { _id: userId },
      { $inc: { credits: -2 } }
    )

    res.json({ success: true, reply: aiMsg })
  } catch (err) {
    console.log("IMAGE ERROR:", err.message)
    res.json({ success: false, message: err.message })
  }
}




