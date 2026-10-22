import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  createVille as createVilleRequest,
  deleteVille as deleteVilleRequest,
  getVilles,
  updateVille as updateVilleRequest
} from "../components/Api/VilleService"

const VilleContext = createContext(null)

export const VilleProvider = ({ children }) => {
  const [villes, setVilles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const fetchVilles = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const villeList = await getVilles()
      setVilles(villeList)
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setError((responseData && responseData.message) || requestError.message || "Impossible de récupérer les villes.")
      setVilles([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createVille = useCallback(async ville => {
    setCreating(true)
    setCreateError("")
    try {
      const createdVille = await createVilleRequest(ville)
      await fetchVilles()
      return createdVille
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setCreateError((responseData && responseData.message) || requestError.message || "Impossible de créer la ville.")
      throw requestError
    } finally {
      setCreating(false)
    }
  }, [fetchVilles])

  const clearCreateError = useCallback(() => setCreateError(""), [])
  const clearUpdateError = useCallback(() => setUpdateError(""), [])
  const clearDeleteError = useCallback(() => setDeleteError(""), [])

  const updateVille = useCallback(async (id, ville) => {
    setUpdating(true)
    setUpdateError("")
    try {
      const updatedVille = await updateVilleRequest(id, ville)
      await fetchVilles()
      return updatedVille
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setUpdateError((responseData && responseData.message) || requestError.message || "Impossible de modifier la ville.")
      throw requestError
    } finally {
      setUpdating(false)
    }
  }, [fetchVilles])

  const deleteVille = useCallback(async id => {
    setDeleting(true)
    setDeleteError("")
    try {
      const deletedVille = await deleteVilleRequest(id)
      await fetchVilles()
      return deletedVille
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setDeleteError((responseData && responseData.message) || requestError.message || "Impossible de supprimer la ville.")
      throw requestError
    } finally {
      setDeleting(false)
    }
  }, [fetchVilles])

  useEffect(() => {
    fetchVilles()
  }, [fetchVilles])

  return (
    <VilleContext.Provider value={{
      villes, loading, error, fetchVilles,
      createVille, creating, createError, clearCreateError,
      updateVille, updating, updateError, clearUpdateError,
      deleteVille, deleting, deleteError, clearDeleteError
    }}>
      {children}
    </VilleContext.Provider>
  )
}

export const useVilles = () => {
  const context = useContext(VilleContext)
  if (!context) throw new Error("useVilles doit être utilisé dans VilleProvider.")
  return context
}
