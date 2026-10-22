import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { getBookings } from "../components/Api/bookingService"

const BookingContext = createContext(null)

const errorMessage = error =>
  (error.response && error.response.data && error.response.data.message) ||
  error.message ||
  "Impossible de récupérer l'historique des réservations."

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setBookings(await getBookings())
    } catch (requestError) {
      setBookings([])
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  return (
    <BookingContext.Provider value={{ bookings, loading, error, fetchBookings }}>
      {children}
    </BookingContext.Provider>
  )
}

export const useBookings = () => {
  const context = useContext(BookingContext)
  if (!context) throw new Error("useBookings doit être utilisé dans BookingProvider.")
  return context
}
