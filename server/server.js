import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js'

import userRouter from './routes/userRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import messageRouter from './routes/messageRoute.js'
import creditRouter from './routes/creditRoutes.js'
import { stripeWebhooks } from './controllers/webhook.js'

const app = express()

// ⚠️ Stripe webhook MUST be before json middleware
app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhooks
)

// middleware
app.use(cors())
app.use(express.json())

// ✅ DB connect INSIDE request lifecycle
let isConnected = false
app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB()
    isConnected = true
  }
  next()
})

// routes
app.get('/', (req, res) => res.send('Server is live!'))
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)

// ✅ VERCEL REQUIREMENT
export default app
