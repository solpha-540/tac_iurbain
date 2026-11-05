import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { getAllAgent, createAgentUrbain as createAgentRequest, assignAgentUrbain, createAgentAccount } from "../components/Api/Agent_urbainService"

const AgentUrbainContext = createContext(null)

export const AgentUrbainProvider = ({ children }) => {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const requestId = useRef(0)

  const fetchAgents = useCallback(async () => {
    const current = ++requestId.current
    setLoading(true)
    setError("")
    try {
      const data = await getAllAgent()
      if (current === requestId.current) setAgents(data)
    } catch (requestError) {
      if (current === requestId.current) {
        setAgents([])
        setError(requestError.response?.data?.message || requestError.message || "Impossible de récupérer les agents Inter-urbain.")
      }
    } finally {
      if (current === requestId.current) setLoading(false)
    }
  }, [])


  const createAgent = useCallback(async (form, photo) => {
    const result = await createAgentRequest(form, photo)
    await fetchAgents()
    return result
  }, [fetchAgents])

  const assignAgent = useCallback(async (agentId, form) => {
    const result = await assignAgentUrbain(agentId, form)
    await fetchAgents()
    return result
  }, [fetchAgents])
  const createAccount = useCallback(async (agentId, form) => {
    const result = await createAgentAccount(agentId, form)
    await fetchAgents()
    return result
  }, [fetchAgents])

  useEffect(() => {
    fetchAgents()
    return () => { requestId.current++ }
  }, [fetchAgents])

  return (
    <AgentUrbainContext.Provider value={{ agents, loading, error, fetchAgents, createAgent, assignAgent, createAccount }}>
      {children}
    </AgentUrbainContext.Provider>
  )
}

export const useAgentsUrbain = () => {
  const context = useContext(AgentUrbainContext)
  if (!context) throw new Error("useAgentsUrbain doit être utilisé dans AgentUrbainProvider.")
  return context
}
