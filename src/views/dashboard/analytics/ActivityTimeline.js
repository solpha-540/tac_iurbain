import React from "react"
import { Card, CardBody, CardHeader, CardTitle } from "reactstrap"
import { Check, MapPin, Package, Plus } from "react-feather"

const lineName = line => line.libele_ligne || line.libelle_ligne || line.parcours_ligne || "Ligne non renseignée"

const ActivityTimeline = ({ principales, secondaires, tarifs }) => {
  const activities = [
    ...principales.slice(0, 2).map(line => ({ icon: MapPin, color: "primary", title: "Ligne principale", description: lineName(line) })),
    ...secondaires.slice(0, 2).map(line => ({ icon: Plus, color: "info", title: "Destination secondaire", description: lineName(line) })),
    ...tarifs.slice(0, 2).map(tarif => ({ icon: Package, color: "success", title: "Tarif colis / fret", description: `${tarif.ligne} — ${Number(tarif.prix_fret || 0).toLocaleString("fr-FR")} FC` })),
  ]

  return (
    <Card>
      <CardHeader><CardTitle>Aperçu du réseau</CardTitle></CardHeader>
      <CardBody>
        <ul className="activity-timeline timeline-left list-unstyled">
          {activities.length ? activities.map((activity, index) => {
            const Icon = activity.icon
            return <li key={`${activity.title}-${index}`}><div className={`timeline-icon bg-${activity.color}`}><Icon size={16} /></div><div className="timeline-info"><p className="font-weight-bold mb-0">{activity.title}</p><span className="font-small-3">{activity.description}</span></div></li>
          }) : <li><div className="timeline-icon bg-secondary"><Check size={16} /></div><div className="timeline-info"><p className="font-weight-bold mb-0">Aucune donnée disponible</p><span className="font-small-3">Configurez des lignes et tarifs pour alimenter le tableau de bord.</span></div></li>}
        </ul>
      </CardBody>
    </Card>
  )
}

export default ActivityTimeline
