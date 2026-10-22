import React, { useCallback, useEffect, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MapPin, RefreshCw, Truck } from "react-feather"
import { getAgences } from "../../../components/Api/AgenceService"
import { getLignesPrincipales, getLignesSecondaires, getPrixLignes } from "../../../components/Api/LigneService"
import ActivityTimeline from "./ActivityTimeline"
import DispatchedOrders from "./DispatchedOrders"
import SalesCard from "./SalesCard"
import "../../../assets/scss/pages/dashboard-analytics.scss"

const priceId = row => row.id_rf_prix_ligne || row.id_prix_ligne || row.id
const lineName = row => row.libele_ligne || row.libelle_ligne || row.Parcours || row.Parcour_ligne || row.parcours_ligne || "Itinéraire non renseigné"

const flattenPrices = prices => prices.reduce((rows, item) => {
  const main = item.Destination_principale || item.destination_principale
  if (!main) return rows.concat(item)

  const children = main.Destinations_secondaires || main.destinations_secondaires || []
  if (priceId(main)) rows.push({ ...main, type: "Ligne principale", ligne: lineName(main) })
  children.forEach(child => rows.push({ ...main, ...child, type: "Destination secondaire", ligne: lineName(child) }))
  return rows
}, [])

const StatCard = ({ color, icon: Icon, label, value, detail }) => (
  <Card className="mb-0">
    <CardBody className="d-flex align-items-center">
      <div className={`avatar bg-light-${color} mr-1`}>
        <div className="avatar-content"><Icon size={22} className={`text-${color}`} /></div>
      </div>
      <div>
        <p className="mb-25 text-muted">{label}</p>
        <h3 className="mb-0">{value}</h3>
        {detail && <small className="text-muted">{detail}</small>}
      </div>
    </CardBody>
  </Card>
)

const AnalyticsDashboard = () => {
  const [data, setData] = useState({ principales: [], secondaires: [], agences: [], tarifs: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [principales, secondaires, agences, prix] = await Promise.all([
        getLignesPrincipales(),
        getLignesSecondaires(),
        getAgences(),
        getPrixLignes(),
      ])
      setData({ principales, secondaires, agences, tarifs: flattenPrices(prix) })
    } catch (requestError) {
      setError(requestError.message || "Impossible de charger les données du tableau de bord.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
        <div><h2 className="mb-25">Tableau de bord inter-urbain</h2><p className="mb-0 text-muted">Suivi des lignes et des offres de transport de colis.</p></div>
        <Button.Ripple color="primary" outline onClick={loadDashboard} disabled={loading} className="mt-1 mt-sm-0"><RefreshCw size={16} className="mr-50" />Actualiser</Button.Ripple>
      </div>
      {error && <Alert color="danger">{error}</Alert>}
      {loading ? <div className="text-center my-5"><Spinner color="primary" /></div> : <>
        <Row className="match-height">
          <Col lg="6" md="12"><SalesCard principales={data.principales} secondaires={data.secondaires} agences={data.agences} /></Col>
          <Col lg="3" md="6" sm="12"><StatCard color="primary" icon={MapPin} label="Lignes principales" value={data.principales.length} detail={`${data.secondaires.length} destinations secondaires`} /></Col>
          <Col lg="3" md="6" sm="12"><StatCard color="success" icon={Truck} label="Tarifs configurés" value={data.tarifs.length} detail={`${data.agences.length} agences enregistrées`} /></Col>
        </Row>
        <Row className="match-height">
          <Col lg="8"><DispatchedOrders tarifs={data.tarifs} agences={data.agences} /></Col>
          <Col lg="4"><ActivityTimeline principales={data.principales} secondaires={data.secondaires} tarifs={data.tarifs} /></Col>
        </Row>
      </>}
    </>
  )
}

export default AnalyticsDashboard
