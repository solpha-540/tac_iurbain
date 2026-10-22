import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { createAgence as createAgenceRequest, deleteAgence as deleteAgenceRequest, getAgences, updateAgence as updateAgenceRequest } from "../components/Api/AgenceService"

const AgenceContext = createContext(null)

export const AgenceProvider = ({ children }) => {
  const [agences, setAgences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const fetchAgences = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setAgences(await getAgences())
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setError((responseData && responseData.message) || requestError.message || "Impossible de récupérer les agences.")
      setAgences([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createAgence = useCallback(async agence => {
    setCreating(true)
    setCreateError("")
    try { const result = await createAgenceRequest(agence); await fetchAgences(); return result } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setCreateError((responseData && responseData.message) || requestError.message || "Impossible de créer l'agence.")
      throw requestError
    } finally { setCreating(false) }
  }, [fetchAgences])

  const updateAgence = useCallback(async (id, agence) => {
    setUpdating(true)
    setUpdateError("")
    try { const result = await updateAgenceRequest(id, agence); await fetchAgences(); return result } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setUpdateError((responseData && responseData.message) || requestError.message || "Impossible de modifier l'agence.")
      throw requestError
    } finally { setUpdating(false) }
  }, [fetchAgences])

  const deleteAgence = useCallback(async id => {
    setDeleting(true)
    setDeleteError("")
    try { const result = await deleteAgenceRequest(id); await fetchAgences(); return result } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setDeleteError((responseData && responseData.message) || requestError.message || "Impossible de supprimer l'agence.")
      throw requestError
    } finally { setDeleting(false) }
  }, [fetchAgences])

  useEffect(() => { fetchAgences() }, [fetchAgences])

  return <AgenceContext.Provider value={{ agences, loading, error, fetchAgences, createAgence, creating, createError, clearCreateError: () => setCreateError(""), updateAgence, updating, updateError, clearUpdateError: () => setUpdateError(""), deleteAgence, deleting, deleteError, clearDeleteError: () => setDeleteError("") }}>{children}</AgenceContext.Provider>
}

export const useAgences = () => {
  const context = useContext(AgenceContext)
  if (!context) throw new Error("useAgences doit être utilisé dans AgenceProvider.")
  return context
}
