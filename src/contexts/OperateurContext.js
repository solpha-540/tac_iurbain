import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  createOperateur as createOperateurRequest,
  deleteOperateur as deleteOperateurRequest,
  getOperateurs,
  updateOperateur as updateOperateurRequest
} from "../components/Api/OperateurService"

const OperateurContext = createContext(null)

export const OperateurProvider = ({ children }) => {
  const [operateurs, setOperateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const fetchOperateurs = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const operateurList = await getOperateurs()
      setOperateurs(operateurList)
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setError(
        (responseData && responseData.message) ||
          requestError.message ||
          "Impossible de récupérer les opérateurs de paiement."
      )
      setOperateurs([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createOperateur = useCallback(async operateur => {
    setCreating(true)
    setCreateError("")
    try {
      const createdOperateur = await createOperateurRequest(operateur)
      await fetchOperateurs()
      return createdOperateur
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setCreateError((responseData && responseData.message) || requestError.message || "Impossible de créer l'opérateur de paiement.")
      throw requestError
    } finally {
      setCreating(false)
    }
  }, [fetchOperateurs])

  const updateOperateur = useCallback(async (id, operateur) => {
    setUpdating(true)
    setUpdateError("")
    try {
      const updatedOperateur = await updateOperateurRequest(id, operateur)
      await fetchOperateurs()
      return updatedOperateur
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setUpdateError((responseData && responseData.message) || requestError.message || "Impossible de modifier l'opérateur de paiement.")
      throw requestError
    } finally {
      setUpdating(false)
    }
  }, [fetchOperateurs])

  const deleteOperateur = useCallback(async id => {
    setDeleting(true)
    setDeleteError("")
    try {
      const deletedOperateur = await deleteOperateurRequest(id)
      await fetchOperateurs()
      return deletedOperateur
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setDeleteError((responseData && responseData.message) || requestError.message || "Impossible de supprimer l'opérateur de paiement.")
      throw requestError
    } finally {
      setDeleting(false)
    }
  }, [fetchOperateurs])

  const clearCreateError = useCallback(() => setCreateError(""), [])
  const clearUpdateError = useCallback(() => setUpdateError(""), [])
  const clearDeleteError = useCallback(() => setDeleteError(""), [])

  useEffect(() => {
    fetchOperateurs()
  }, [fetchOperateurs])

  return (
    <OperateurContext.Provider value={{
      operateurs, loading, error, fetchOperateurs,
      createOperateur, creating, createError, clearCreateError,
      updateOperateur, updating, updateError, clearUpdateError,
      deleteOperateur, deleting, deleteError, clearDeleteError
    }}>
      {children}
    </OperateurContext.Provider>
  )
}

export const useOperateurs = () => {
  const context = useContext(OperateurContext)

  if (!context) {
    throw new Error("useOperateurs doit être utilisé dans OperateurProvider.")
  }

  return context
}
