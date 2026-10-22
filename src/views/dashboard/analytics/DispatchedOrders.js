import React from "react"
import { Badge, Card, CardBody, CardHeader, CardTitle, Table } from "reactstrap"

const amount = value => value === null || value === undefined || value === "" ? "-" : `${Number(value).toLocaleString("fr-FR")} FC`
const agencyName = (tarif, agences) => tarif.nom_agence || tarif.agence_nom || (agences.find(agency => String(agency.id) === String(tarif.id_agence || tarif.agence_id)) || {}).nom || "-"

const DispatchedOrders = ({ tarifs, agences }) => (
  <Card>
    <CardHeader><CardTitle>Tarifs de transport disponibles</CardTitle></CardHeader>
    <CardBody className="p-0">
      <Table responsive className="dashboard-table table-hover-animation mb-0">
        <thead>
          <tr><th>LIGNE</th><th>TYPE</th><th>AGENCE</th><th>VOYAGE</th><th>FRET / COLIS</th><th>COURRIER</th></tr>
        </thead>
        <tbody>
          {tarifs.length ? tarifs.slice(0, 8).map((tarif, index) => (
            <tr key={tarif.id_rf_prix_ligne || tarif.id_prix_ligne || tarif.id || index}>
              <td className="font-weight-bold">{tarif.ligne}</td>
              <td><Badge color={tarif.type === "Ligne principale" ? "primary" : "info"}>{tarif.type}</Badge></td>
              <td>{agencyName(tarif, agences)}</td>
              <td>{amount(tarif.prix_voyage || tarif.Prix)}</td>
              <td>{amount(tarif.prix_fret)}</td>
              <td>{amount(tarif.prix_courrier)}</td>
            </tr>
          )) : <tr><td colSpan="6" className="text-center text-muted py-3">Aucun tarif de transport configuré.</td></tr>}
        </tbody>
      </Table>
    </CardBody>
  </Card>
)

export default DispatchedOrders
