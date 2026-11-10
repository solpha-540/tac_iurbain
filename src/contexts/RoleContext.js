import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { getRoles, createRole as createRoleRequest } from "../components/Api/RoleService"
import { formatApiError } from "../utility/apiError"

const RoleContext = createContext(null)
export const RoleProvider = ({ children }) => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const latest = useRef(0)
  const fetchRoles = useCallback(async () => {
    const current = ++latest.current
    setLoading(true)
    setError("")
    try {
      const data = await getRoles()
      if (current === latest.current) setRoles(data)
    } catch (e) {
      if (current === latest.current) { setRoles([]); setError(formatApiError(e)) }
    } finally {
      if (current === latest.current) setLoading(false)
    }
  }, [])
  const createRole = useCallback(async label => {
    const result = await createRoleRequest(label)
    await fetchRoles()
    return result
  }, [fetchRoles])
  useEffect(() => { fetchRoles(); return () => { latest.current++ } }, [fetchRoles])
  return <RoleContext.Provider value={{ roles, loading, error, fetchRoles, createRole }}>{children}</RoleContext.Provider>
}
export const useRoles = () => {
  const context = useContext(RoleContext)
  if (!context) throw new Error("useRoles doit être utilisé dans RoleProvider.")
  return context
}
