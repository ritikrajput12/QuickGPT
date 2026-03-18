import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'

const ChatBox = () => {

const containerRef = useRef(null)

const {
selectedChat,
setSelectedChat,
chats,
setChats,
theme,
user,
axios,
token,
setUser
} = useAppContext()

const [loading, setLoading] = useState(false)
const [prompt, setPrompt] = useState('')
const [mode, setMode] = useState('text')
const [isPublished, setIsPublished] = useState(false)

const onSubmit = async (e) => {
e.preventDefault()

if (!user) {
toast('Login to send message')
return
}

if (!selectedChat) {
toast.error('No chat selected')
return
}

if (!prompt.trim()) return

const promptCopy = prompt
setPrompt('')
setLoading(true)

const userMessage = {
role: 'user',
content: promptCopy,
timestamps: Date.now(),
isImage: false
}

setSelectedChat(prev => {
const firstMessage = prev.messages.length === 0

const updatedChat = {
...prev,
name: firstMessage ? promptCopy.slice(0, 30) : prev.name,
messages: prev.messages.concat(userMessage),
updatedAt: Date.now()
}

setChats(prevChats =>
prevChats
.map(chat =>
chat._id === updatedChat._id
? { ...updatedChat }
: chat
)
.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
)

return { ...updatedChat }
})

try {
const { data } = await axios.post(
`/api/message/${mode}`,
{ chatId: selectedChat._id, prompt: promptCopy, isPublished },
{ headers: { Authorization: `Bearer ${token}` } }
)

if (data.success) {
setSelectedChat(prev => {
const updatedChat = {
...prev,
messages: prev.messages.concat(data.reply),
updatedAt: Date.now()
}

setChats(prevChats =>
prevChats
.map(chat =>
chat._id === updatedChat._id
? { ...updatedChat }
: chat
)
.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
)

return { ...updatedChat }
})

setUser(prev => ({
...prev,
credits: Math.max(
0,
prev.credits - (mode === 'image' ? 2 : 1)
)
}))
} else {
toast.error(data.message)
}
} catch (err) {
toast.error(err.message)
} finally {
setLoading(false)
}
}

useEffect(() => {
if (containerRef.current) {
containerRef.current.scrollTo({
top: containerRef.current.scrollHeight,
behavior: 'smooth'
})
}
}, [selectedChat?.messages])

return (
<div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40'>

<div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>

{(!selectedChat || selectedChat.messages.length === 0) && (
<div className='h-full flex flex-col items-center justify-center gap-2'>
<img
src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
className='w-full max-w-56 sm:max-w-68'
alt=''
/>
<p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white'>
Ask me anything.
</p>
</div>
)}

{selectedChat?.messages.map((msg, i) => (
<Message key={i} message={msg} />
))}

{loading && (
<div className='flex gap-1.5 mt-2'>
<div className='w-1.5 h-1.5 bg-gray-500 dark:bg-white rounded-full animate-bounce'></div>
<div className='w-1.5 h-1.5 bg-gray-500 dark:bg-white rounded-full animate-bounce'></div>
<div className='w-1.5 h-1.5 bg-gray-500 dark:bg-white rounded-full animate-bounce'></div>
</div>
)}

</div>

{mode === 'image' && (
<label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
<p className='text-xs'>Publish Generated Image to Community</p>
<input
type='checkbox'
checked={isPublished}
onChange={(e) => setIsPublished(e.target.checked)}
/>
</label>
)}

<form
onSubmit={onSubmit}
className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-2 items-center'
>

<select
value={mode}
onChange={(e) => setMode(e.target.value)}
className='text-sm pl-3 pr-2 outline-none'
>
<option value='text'>Text</option>
<option value='image'>Image</option>
</select>

<input
value={prompt}
onChange={(e) => setPrompt(e.target.value)}
placeholder='Type your prompt here...'
className='flex-1 min-w-0 text-sm outline-none'
/>

<button disabled={loading} className="flex-shrink-0">
<img
src={loading ? assets.stop_icon : assets.send_icon}
className='w-8'
alt=''
/>
</button>

</form>

</div>
)
}

export default ChatBox