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
      return res.json({ success: false, message: "chatId and prompt required" })
    }

    const chat = await Chat.findOne({ _id: chatId, userId })
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" })
    }

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamps: Date.now(),
      isImage: false
    })

    if (!chat.name || chat.name === "New Chat") {
      chat.name = prompt.slice(0, 30)
    }

    chat.updatedAt = new Date()

    const completion = await openai.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }]
    })

    chat.messages.push({
      role: "assistant",
      content: completion.choices[0].message.content,
      timestamps: Date.now(),
      isImage: false
    })

    await chat.save()

    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -1 } }
    )

    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

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

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamps: Date.now(),
      isImage: false
    })

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

    chat.messages.push({
      role: "assistant",
      content: upload.url,
      timestamps: Date.now(),
      isImage: true,
      isPublished: Boolean(isPublished)
    })

    await chat.save()

    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -2 } }
    )

    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}





