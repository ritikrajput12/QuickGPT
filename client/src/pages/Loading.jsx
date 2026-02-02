import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const Loading = () => {
  const navigate = useNavigate()
  const { fetchUser } = useAppContext()

  useEffect(() => {
    const run = async () => {
      await fetchUser()     //  wait till user + chats load
      navigate('/')         //  then go home
    }

    const timeout = setTimeout(run, 3000) // 3s enough, 8s overkill
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="bg-gradient-to-b from-[#531B81] to-[#29184B]
      flex items-center justify-center h-screen w-screen">
      <div className="w-10 h-10 rounded-full border-4
        border-white border-t-transparent animate-spin" />
    </div>
  )
}

export default Loading
