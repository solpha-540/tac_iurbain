import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  createService as createServiceRequest,
  deleteService as deleteServiceRequest,
  getServices,
  updateService as updateServiceRequest,
} from "../components/Api/ServiceService"

const ServiceContext = createContext(null)
const message = (error, fallback) => (error.response && error.response.data && error.response.data.message) || error.message || fallback

export const ServiceProvider = ({ children }) => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setServices(await getServices())
    } catch (requestError) {
      setError(message(requestError, "Impossible de récupérer les services."))
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createService = useCallback(async service => {
    setCreating(true)
    setCreateError("")
    try {
      const result = await createServiceRequest(service)
      await fetchServices()
      return result
    } catch (requestError) {
      setCreateError(message(requestError, "Impossible de créer le service."))
      throw requestError
    } finally {
      setCreating(false)
    }
  }, [fetchServices])

  const updateService = useCallback(async (id, service) => {
    setUpdating(true)
    setUpdateError("")
    try {
      const result = await updateServiceRequest(id, service)
      await fetchServices()
      return result
    } catch (requestError) {
      setUpdateError(message(requestError, "Impossible de modifier le service."))
      throw requestError
    } finally {
      setUpdating(false)
    }
  }, [fetchServices])

  const deleteService = useCallback(async id => {
    setDeleting(true)
    setDeleteError("")
    try {
      const result = await deleteServiceRequest(id)
      await fetchServices()
      return result
    } catch (requestError) {
      setDeleteError(message(requestError, "Impossible de supprimer le service."))
      throw requestError
    } finally {
      setDeleting(false)
    }
  }, [fetchServices])

  useEffect(() => { fetchServices() }, [fetchServices])

  return <ServiceContext.Provider value={{
    services, loading, error, fetchServices,
    createService, creating, createError, clearCreateError: () => setCreateError(""),
    updateService, updating, updateError, clearUpdateError: () => setUpdateError(""),
    deleteService, deleting, deleteError, clearDeleteError: () => setDeleteError(""),
  }}>{children}</ServiceContext.Provider>
}

export const useServices = () => {
  const context = useContext(ServiceContext)
  if (!context) throw new Error("useServices doit être utilisé dans ServiceProvider.")
  return context
}
