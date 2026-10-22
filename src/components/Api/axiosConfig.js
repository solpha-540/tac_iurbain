import axios from "axios"

const api = axios.create({
  baseURL: "https://urbain-sandbox.trans-academia.cd/api/v1",
  timeout: 10000,
  adapter: axios.getAdapter("xhr")
})

export default api
