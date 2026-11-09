import SearchInput from "../../../../components/urbain/SearchInput"
import WorkspacePage from "../../../../components/urbain/WorkspacePage"
import React, { useMemo, useState } from "react"
import {
  Alert, Badge, Button, Card, CardBody, CardHeader, CardTitle, Col, Input,
  Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner,
} from "reactstrap"
import DataTable from "../../../../components/urbain/BusinessTable"
import {
  Box, Calendar, ChevronRight, CreditCard, MapPin, Package, RefreshCw, Search,
  Tag, Truck,
} from "react-feather"
import { BookingProvider, useBookings } from "../../../../contexts/bookingContext"

const money = (value, currency = "FC") => `${Number(value || 0).toLocaleString("fr-FR")} ${currency}`
const dateTime = value => {
  if (!value) return "—"
  const date = new Date(String(value).replace(" ", "T"))
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
}

const statusStyle = status => {
  const normalized = String(status || "").toLowerCase()
  if (["success", "paid", "payé", "termine", "terminé"].includes(normalized)) return "success"
  if (["pending", "pendding", "en attente"].includes(normalized)) return "warning"
  if (["failed", "cancelled", "annulé", "annule"].includes(normalized)) return "danger"
  return "secondary"
}

const statusLabel = status => {
  const normalized = String(status || "").toLowerCase()
  if (["pending", "pendding"].includes(normalized)) return "En attente"
  if (normalized === "success") return "Confirmée"
  return status || "Inconnu"
}

const Metric = ({ icon: Icon, label, value, color = "primary" }) => <Col md="3" sm="6" className="mb-1">
  <Card className="mb-0 border-0 shadow-sm h-100"><CardBody className="d-flex align-items-center py-1">
    <div className={`rounded-circle bg-light-${color} text-${color} p-1 mr-1`}><Icon size={20} /></div>
    <div><small className="text-muted d-block">{label}</small><h4 className="mb-0">{value}</h4></div>
  </CardBody></Card>
</Col>

const BookingDetails = ({ booking, close }) => {
  if (!booking) return null
  const reservation = booking.reservation || {}
  const payment = booking.paiement || {}
  const line = (booking.ligne || {}).principale || (booking.ligne || {}).secondaire || {}
  const currency = (((booking.historique_paiements || [])[0] || {}).currency_symbol) || "FC"
  const payments = booking.historique_paiements || []

  return <Modal isOpen={Boolean(booking)} toggle={close} centered size="lg" className="urbain-dialog" >
    <ModalHeader toggle={close}>Détail de la réservation #{booking.id_reservation || "—"}</ModalHeader>
    <ModalBody>
      <div className="d-flex flex-wrap justify-content-between align-items-center bg-light rounded p-1 mb-2">
        <div><small className="text-muted d-block">Ticket QR</small><strong>{reservation.ticket_qr || "—"}</strong></div>
        <Badge color={statusStyle(reservation.status)} pill className="px-1 py-50">{statusLabel(reservation.status)}</Badge>
      </div>
      <Row>
        <Col md="6" className="mb-2"><h6 className="text-primary"><MapPin size={16} className="mr-50" />Trajet</h6><p className="mb-25 font-weight-bold">{line.libele_ligne || "Trajet non renseigné"}</p><small className="text-muted">{line.parcours_ligne || "—"}</small></Col>
        <Col md="6" className="mb-2"><h6 className="text-primary"><Truck size={16} className="mr-50" />Agence</h6><p className="mb-25 font-weight-bold">{(booking.agence || {}).nom || "—"}</p><small className="text-muted">{(booking.agence || {}).contacts || "Contact non renseigné"}</small></Col>
        <Col md="6" className="mb-2"><h6 className="text-primary"><Calendar size={16} className="mr-50" />Réservation</h6><p className="mb-0">{dateTime(reservation.date_reservation || reservation.created_at)}</p></Col>
        <Col md="6" className="mb-2"><h6 className="text-primary"><CreditCard size={16} className="mr-50" />Paiement</h6><p className="mb-25">Total : <strong>{money(payment.montant_total || reservation.montant_total, currency)}</strong></p><small className="text-muted">Payé {money(payment.montant_paye || reservation.montant_paye, currency)} · Reste {money(payment.montant_restant || reservation.montant_restant, currency)}</small></Col>
      </Row>
      <h6 className="text-primary mt-1"><Package size={16} className="mr-50" />Colis ({(booking.colis || []).length})</h6>
      {(booking.colis || []).length ? <div className="table-responsive"><table className="table table-sm"><thead><tr><th>Description</th><th>Qté</th><th>Poids</th><th>Montant</th></tr></thead><tbody>{booking.colis.map(item => <tr key={item.id}><td>{item.description || "—"}</td><td>{item.nombre || 0}</td><td>{item.poids || 0} kg</td><td>{money(item.montant, currency)}</td></tr>)}</tbody></table></div> : <p className="text-muted mb-0">Aucun colis associé.</p>}
      {payments.length > 0 && <><h6 className="text-primary mt-2">Historique de paiement</h6><div className="table-responsive"><table className="table table-sm"><thead><tr><th>Référence</th><th>Opérateur</th><th>Montant</th><th>État</th></tr></thead><tbody>{payments.map(item => <tr key={item.Id || item.transaction_rf}><td>{item.transaction_rf || "—"}</td><td>{item.operateur_libele || "—"}</td><td>{money(item.amount, item.currency_symbol || currency)}</td><td><Badge color={statusStyle(item.status)} pill>{item.status || "—"}</Badge></td></tr>)}</tbody></table></div></>}
    </ModalBody>
    <ModalFooter><Button color="primary" onClick={close}>Fermer</Button></ModalFooter>
  </Modal>
}

const BookingTable = () => {
  const { bookings, loading, error, fetchBookings } = useBookings()
  const [search, setSearch] = useState("")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return bookings
    return bookings.filter(item => {
      const reservation = item.reservation || {}
      const line = (item.ligne || {}).principale || {}
      return [item.id_reservation, reservation.ticket_qr, reservation.status, (item.agence || {}).nom, line.libele_ligne]
        .some(value => String(value || "").toLowerCase().includes(term))
    })
  }, [bookings, search])
  const summary = useMemo(() => bookings.reduce((result, item) => {
    const reservation = item.reservation || {}
    result.total += 1
    result.paid += Number((item.paiement || {}).montant_paye || reservation.montant_paye || 0)
    result.pending += String(reservation.status || "").toLowerCase().match(/pending|pendding/) ? 1 : 0
    result.parcels += (item.colis || []).reduce((sum, parcel) => sum + Number(parcel.nombre || 0), 0)
    return result
  }, { total: 0, paid: 0, pending: 0, parcels: 0 }), [bookings])
  const columns = useMemo(() => [
    { name: "Réservation", minWidth: "180px", sortable: true, selector: row => (row.reservation || {}).ticket_qr || "", cell: row => <div className="py-50"><strong>{(row.reservation || {}).ticket_qr || `#${row.id_reservation}`}</strong><small className="d-block text-muted">#{row.id_reservation} · {dateTime((row.reservation || {}).date_reservation)}</small></div> },
    { name: "Trajet / agence", minWidth: "220px", cell: row => { const line = (row.ligne || {}).principale || (row.ligne || {}).secondaire || {}; return <div className="py-50"><span className="font-weight-bold">{line.libele_ligne || "Trajet non renseigné"}</span><small className="d-block text-muted">{(row.agence || {}).nom || "Agence non renseignée"}</small></div> } },
    { name: "Montant", sortable: true, selector: row => Number(((row.paiement || {}).montant_total || (row.reservation || {}).montant_total || 0)), cell: row => { const payment = row.paiement || {}; const r = row.reservation || {}; return <div><strong>{money(payment.montant_total || r.montant_total)}</strong><small className="d-block text-success">Payé : {money(payment.montant_paye || r.montant_paye)}</small></div> } },
    { name: "État", width: "125px", cell: row => <Badge color={statusStyle((row.reservation || {}).status)} pill className="text-capitalize">{statusLabel((row.reservation || {}).status)}</Badge> },
    { name: "", width: "72px", button: true, cell: row => <Button.Ripple color="flat-primary" className="btn-icon" onClick={() => setSelectedBooking(row)} aria-label="Voir le détail"><ChevronRight size={20} /></Button.Ripple> },
  ], [])

  return <>
    <Row><Metric icon={Tag} label="Réservations" value={summary.total} /><Metric icon={CreditCard} label="Montant encaissé" value={money(summary.paid)} color="success" /><Metric icon={Calendar} label="En attente" value={summary.pending} color="warning" /><Metric icon={Box} label="Colis" value={summary.parcels} color="info" /></Row>
    <Card className="shadow-sm border-0">
      <CardHeader className="d-flex flex-wrap align-items-center justify-content-between pb-1"><div><CardTitle tag="h4" className="mb-25">Historique des réservations</CardTitle><small className="text-muted">Suivez les réservations, paiements et colis en temps réel.</small></div><Button.Ripple outline color="primary" size="sm" onClick={fetchBookings} disabled={loading} className="mt-1 mt-sm-0"><RefreshCw size={15} className={`mr-50 ${loading ? "fa-spin" : ""}`} />Actualiser</Button.Ripple></CardHeader>
      <CardBody>{error && <Alert color="danger" className="mb-2">{error}</Alert>}<div className="position-relative has-icon-left col-12 col-md-5 px-0 mb-2"><SearchInput value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un ticket, trajet ou une agence"  aria-label="Rechercher un ticket, trajet ou une agence" /><div className="form-control-position"><Search size={15} /></div></div><DataTable columns={columns} data={filteredBookings} noHeader pagination highlightOnHover responsive progressPending={loading} progressComponent={<Spinner color="primary" className="my-2" />} noDataComponent={error ? "" : "Aucune réservation trouvée."} /></CardBody>
    </Card>
    <BookingDetails booking={selectedBooking} close={() => setSelectedBooking(null)} />
  </>
}

const Booking = () => <BookingProvider><BookingTable /></BookingProvider>
const BookingWorkspace = () => <WorkspacePage title="Réservations" description="Suivez les trajets, les colis et les paiements de vos réservations." category="Opérations" links={[{"label":"Agences","to":"/agences"},{"label":"Tarifs","to":"/prixlignes"}]}><Booking /></WorkspacePage>
export default BookingWorkspace
