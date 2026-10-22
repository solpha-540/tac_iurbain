import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  createCommune as createCommuneRequest,
  deleteCommune as deleteCommuneRequest,
  getCommunes,
  updateCommune as updateCommuneRequest
} from "../components/Api/CommuneService"

const CommuneContext = createContext(null)

export const CommuneProvider = ({ children }) => {
  const [Communes, setCommunes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const fetchCommunes = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const CommuneList = await getCommunes()
      setCommunes(CommuneList)
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setError((responseData && responseData.message) || requestError.message || "Impossible de récupérer les Communes.")
      setCommunes([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createCommune = useCallback(async Commune => {
    setCreating(true)
    setCreateError("")
    try {
      const createdCommune = await createCommuneRequest(Commune)
      await fetchCommunes()
      return createdCommune
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setCreateError((responseData && responseData.message) || requestError.message || "Impossible de créer la Commune.")
      throw requestError
    } finally {
      setCreating(false)
    }
  }, [fetchCommunes])

  const clearCreateError = useCallback(() => setCreateError(""), [])
  const clearUpdateError = useCallback(() => setUpdateError(""), [])
  const clearDeleteError = useCallback(() => setDeleteError(""), [])

  const updateCommune = useCallback(async (id, Commune) => {
    setUpdating(true)
    setUpdateError("")
    try {
      const updatedCommune = await updateCommuneRequest(id, Commune)
      await fetchCommunes()
      return updatedCommune
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setUpdateError((responseData && responseData.message) || requestError.message || "Impossible de modifier la Commune.")
      throw requestError
    } finally {
      setUpdating(false)
    }
  }, [fetchCommunes])

  const deleteCommune = useCallback(async id => {
    setDeleting(true)
    setDeleteError("")
    try {
      const deletedCommune = await deleteCommuneRequest(id)
      await fetchCommunes()
      return deletedCommune
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setDeleteError((responseData && responseData.message) || requestError.message || "Impossible de supprimer la Commune.")
      throw requestError
    } finally {
      setDeleting(false)
    }
  }, [fetchCommunes])

  useEffect(() => {
    fetchCommunes()
  }, [fetchCommunes])

  return (
    <CommuneContext.Provider value={{
      Communes, loading, error, fetchCommunes,
      createCommune, creating, createError, clearCreateError,
      updateCommune, updating, updateError, clearUpdateError,
      deleteCommune, deleting, deleteError, clearDeleteError
    }}>
      {children}
    </CommuneContext.Provider>
  )
}

export const useCommunes = () => {
  const context = useContext(CommuneContext)
  if (!context) throw new Error("useCommunes doit être utilisé dans CommuneProvider.")
  return context
}
