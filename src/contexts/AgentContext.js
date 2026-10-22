import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { getAgents } from "../components/Api/AgentService"

const AgentContext = createContext(null)

const getErrorMessage = error =>
  (error.response && error.response.data && error.response.data.message) ||
  error.message ||
  "Impossible de récupérer les agents."

export const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setAgents(await getAgents())
    } catch (requestError) {
      setAgents([])
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAgents() }, [fetchAgents])

  return <AgentContext.Provider value={{ agents, loading, error, fetchAgents }}>{children}</AgentContext.Provider>
}

export const useAgents = () => {
  const context = useContext(AgentContext)
  if (!context) throw new Error("useAgents doit être utilisé dans AgentProvider.")
  return context
}
