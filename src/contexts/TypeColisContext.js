import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  createTypeColis as createTypeColisRequest,
  deleteTypeColis as deleteTypeColisRequest,
  getTypesColis,
  updateTypeColis as updateTypeColisRequest,
} from "../components/Api/TypeColisService"

const TypeColisContext = createContext(null)
const message = (error, fallback) => (error.response && error.response.data && error.response.data.message) || error.message || fallback

export const TypeColisProvider = ({ children }) => {
  const [typesColis, setTypesColis] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const fetchTypesColis = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setTypesColis(await getTypesColis())
    } catch (requestError) {
      setError(message(requestError, "Impossible de récupérer les types de colis."))
      setTypesColis([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createTypeColis = useCallback(async typeColis => {
    setCreating(true)
    setCreateError("")
    try {
      const result = await createTypeColisRequest(typeColis)
      await fetchTypesColis()
      return result
    } catch (requestError) {
      setCreateError(message(requestError, "Impossible de créer le type de colis."))
      throw requestError
    } finally {
      setCreating(false)
    }
  }, [fetchTypesColis])

  const updateTypeColis = useCallback(async (id, typeColis) => {
    setUpdating(true)
    setUpdateError("")
    try {
      const result = await updateTypeColisRequest(id, typeColis)
      await fetchTypesColis()
      return result
    } catch (requestError) {
      setUpdateError(message(requestError, "Impossible de modifier le type de colis."))
      throw requestError
    } finally {
      setUpdating(false)
    }
  }, [fetchTypesColis])

  const deleteTypeColis = useCallback(async id => {
    setDeleting(true)
    setDeleteError("")
    try {
      const result = await deleteTypeColisRequest(id)
      await fetchTypesColis()
      return result
    } catch (requestError) {
      setDeleteError(message(requestError, "Impossible de supprimer le type de colis."))
      throw requestError
    } finally {
      setDeleting(false)
    }
  }, [fetchTypesColis])

  useEffect(() => { fetchTypesColis() }, [fetchTypesColis])

  return <TypeColisContext.Provider value={{
    typesColis, loading, error, fetchTypesColis,
    createTypeColis, creating, createError, clearCreateError: () => setCreateError(""),
    updateTypeColis, updating, updateError, clearUpdateError: () => setUpdateError(""),
    deleteTypeColis, deleting, deleteError, clearDeleteError: () => setDeleteError(""),
  }}>{children}</TypeColisContext.Provider>
}

export const useTypesColis = () => {
  const context = useContext(TypeColisContext)
  if (!context) throw new Error("useTypesColis doit être utilisé dans TypeColisProvider.")
  return context
}
