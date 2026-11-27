import React from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Card, CardBody, CardTitle } from "reactstrap"
import WorkspacePage from "../../../components/urbain/WorkspacePage"

const AgencyHome = () => {
  const agency = useSelector(state => state.auth.login.values?.agency)
  return (
    <WorkspacePage title="Accueil" description="Espace chef d’agence" category="Agence">
      <Card>
        <CardBody>
          <CardTitle tag="h4">{agency?.nom || "Mon agence"}</CardTitle>
          <p>Consultez les tarifs de location cargo de votre agence et ajoutez un tarif par ligne.</p>
          <Link className="btn btn-primary" to="/prixcargo">Voir les tarifs cargo</Link>
        </CardBody>
      </Card>
    </WorkspacePage>
  )
}

export default AgencyHome
