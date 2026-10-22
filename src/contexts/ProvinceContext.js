import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  createProvince as createProvinceRequest,
  deleteProvince as deleteProvinceRequest,
  updateProvince as updateProvinceRequest,
  getProvinces
} from "../components/Api/ProvinceService"

const ProvinceContext = createContext(null)

export const ProvinceProvider = ({ children }) => {
  const [provinces, setProvinces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const fetchProvinces = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const provinceList = await getProvinces()
      setProvinces(provinceList)
    } catch (requestError) {
      const responseData = requestError.response && requestError.response.data
      setError(
        (responseData && responseData.message) ||
          requestError.message ||
          "Impossible de récupérer les provinces."
      )
      setProvinces([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createProvince = useCallback(
    async province => {
      setCreating(true)
      setCreateError("")

      try {
        const createdProvince = await createProvinceRequest(province)
        await fetchProvinces()
        return createdProvince
      } catch (requestError) {
        const responseData = requestError.response && requestError.response.data
        setCreateError(
          (responseData && responseData.message) ||
            requestError.message ||
            "Impossible de créer la province."
        )
        throw requestError
      } finally {
        setCreating(false)
      }
    },
    [fetchProvinces]
  )

  const clearCreateError = useCallback(() => setCreateError(""), [])
  const clearUpdateError = useCallback(() => setUpdateError(""), [])
  const clearDeleteError = useCallback(() => setDeleteError(""), [])

  const updateProvince = useCallback(
    async (id, province) => {
      setUpdating(true)
      setUpdateError("")

      try {
        const updatedProvince = await updateProvinceRequest(id, province)
        await fetchProvinces()
        return updatedProvince
      } catch (requestError) {
        const responseData = requestError.response && requestError.response.data
        setUpdateError(
          (responseData && responseData.message) ||
            requestError.message ||
            "Impossible de modifier la province."
        )
        throw requestError
      } finally {
        setUpdating(false)
      }
    },
    [fetchProvinces]
  )

  const deleteProvince = useCallback(
    async id => {
      setDeleting(true)
      setDeleteError("")

      try {
        const deletedProvince = await deleteProvinceRequest(id)
        await fetchProvinces()
        return deletedProvince
      } catch (requestError) {
        const responseData = requestError.response && requestError.response.data
        setDeleteError(
          (responseData && responseData.message) ||
            requestError.message ||
            "Impossible de supprimer la province."
        )
        throw requestError
      } finally {
        setDeleting(false)
      }
    },
    [fetchProvinces]
  )

  useEffect(() => {
    fetchProvinces()
  }, [fetchProvinces])

  return (
    <ProvinceContext.Provider
      value={{
        provinces,
        loading,
        error,
        fetchProvinces,
        createProvince,
        creating,
        createError,
        clearCreateError,
        updateProvince,
        updating,
        updateError,
        clearUpdateError,
        deleteProvince,
        deleting,
        deleteError,
        clearDeleteError
      }}
    >
      {children}
    </ProvinceContext.Provider>
  )
}

export const useProvinces = () => {
  const context = useContext(ProvinceContext)

  if (!context) {
    throw new Error("useProvinces doit être utilisé dans ProvinceProvider.")
  }

  return context
}
