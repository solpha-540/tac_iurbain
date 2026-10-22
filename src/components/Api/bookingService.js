import api from "./axiosConfig"

// L'historique est déjà enrichi par l'API (agence, ligne, colis et paiements).
export const getBookings = async () => {
  const response = await api.get("/resource/clients/historique")
  const responseData = response.data || {}

  if (responseData.code && responseData.code !== 200) {
    throw new Error(responseData.message || "Impossible de récupérer l'historique des réservations.")
  }

  const data = responseData.data || {}
  return Array.isArray(data.reservations) ? data.reservations : []
}
