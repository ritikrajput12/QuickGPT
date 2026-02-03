import { createContext, useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL

const AppContext = createContext()

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loadingUser, setLoadingUser] = useState(true)

  const fetchUserChats = async () => {
    try {
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        setChats(data.chats)

        if (!selectedChat && data.chats.length > 0) {
          setSelectedChat(data.chats[0])
        }
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const createNewChat = async () => {
    try {
      if (!user) return toast.error("Login first")

      setSelectedChat(null)

      const { data } = await axios.get("/api/chat/create", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        await fetchUserChats()
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        setUser(data.user)
        await fetchUserChats()
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoadingUser(false)
    }
  }

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    if (!user) {
      setChats([])
      setSelectedChat(null)
    }
  }, [user])

  useEffect(() => {
    if (token) fetchUser()
    else {
      setUser(null)
      setLoadingUser(false)
    }
  }, [token])

  const value = {
    navigate,
    user,
    setUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    fetchUserChats,
    fetchUser,
    loadingUser,
    token,
    setToken,
    axios,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)


