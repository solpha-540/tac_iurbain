import React from "react"
import { Card, CardBody } from "reactstrap"
import { Truck } from "react-feather"
import decorLeft from "../../../assets/img/elements/decore-left.png"
import decorRight from "../../../assets/img/elements/decore-right.png"

const SalesCard = ({ principales, secondaires, agences }) => (
  <Card className="bg-analytics text-white sales-card">
    <CardBody className="text-center">
      <img src={decorLeft} alt="Décoration" className="img-left" />
      <img src={decorRight} alt="Décoration" className="img-right" />
      <div className="avatar avatar-xl bg-primary shadow avatar-dashboard mt-0"><div className="avatar-content"><Truck className="text-white" size={28} /></div></div>
      <div className="award-info text-center">
        <h1 className="mb-2 text-white">Réseau inter-urbain</h1>
        <p className="m-auto mb-0 w-75">{principales.length} lignes principales, {secondaires.length} destinations secondaires et {agences.length} agences participent à votre offre de transport.</p>
      </div>
    </CardBody>
  </Card>
)

export default SalesCard
