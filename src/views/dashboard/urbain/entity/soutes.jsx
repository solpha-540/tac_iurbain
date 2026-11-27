import React, { useState } from "react"
import { Alert, Button, Card, CardBody, Form, FormGroup, Input, Label, Spinner } from "reactstrap"
import { BusProvider, useBuses } from "../../../../contexts/busContext"
import { SoutesProvider, useSoutes } from "../../../../contexts/soutesContext"
import BusinessTable from "../../../../components/urbain/BusinessTable"
import WorkspacePage from "../../../../components/urbain/WorkspacePage"

const columns = [
  { name: "Code", selector: "code", sortable: true },
  { name: "Libellé", selector: "libelle", sortable: true },
  { name: "Statut", selector: "status", sortable: true }
]

const BusSoutes = () => {
  const { soutes, loading, saving, error, saveError, load, addSoute } = useSoutes()
  const [code, setCode] = useState("")
  const [libelle, setLibelle] = useState("")
  const [success, setSuccess] = useState(false)

  const submit = async event => {
    event.preventDefault()
    if (loading || saving || !code.trim() || !libelle.trim()) return
    setSuccess(false)
    if (await addSoute({ code: code.trim(), libelle: libelle.trim() })) {
      setCode("")
      setLibelle("")
      setSuccess(true)
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-1">
        <h2 className="h4 mb-0">Soutes du bus</h2>
        <Button outline color="primary" size="sm" onClick={() => load()} disabled={loading || saving}>
          Actualiser
        </Button>
      </div>
      {error && <Alert color="danger" role="alert">{error}</Alert>}
      <BusinessTable
        columns={columns}
        data={soutes}
        noHeader
        pagination
        progressPending={loading}
        progressComponent={<Spinner color="primary" className="my-2" />}
        noDataComponent={error ? "Liste indisponible." : "Aucune soute pour ce bus."}
      />
      <Form onSubmit={submit} className="mt-2">
        <h2 className="h4">Ajouter une soute</h2>
        {success && <Alert color="success" role="status">Soute créée.</Alert>}
        {saveError && <Alert color="danger" role="alert">{saveError}</Alert>}
        <FormGroup>
          <Label for="soute-code">Code</Label>
          <Input id="soute-code" value={code} onChange={event => setCode(event.target.value)} disabled={saving} required />
        </FormGroup>
        <FormGroup>
          <Label for="soute-label">Libellé</Label>
          <Input id="soute-label" value={libelle} onChange={event => setLibelle(event.target.value)} disabled={saving} required />
        </FormGroup>
        <Button type="submit" color="primary" disabled={loading || saving || !code.trim() || !libelle.trim()}>
          {saving ? "Enregistrement…" : "Créer la soute"}
        </Button>
      </Form>
    </>
  )
}

const SoutesWorkspace = () => {
  const { buses, loading, error, fetchBuses } = useBuses()
  const [selectedBus, setSelectedBus] = useState("")
  const interurbainBuses = buses.filter(bus =>
    bus.service?.libelle?.trim().toUpperCase() === "SERVICE INTERURBAIN"
  )
  const bus = interurbainBuses.find(item => String(item.id) === selectedBus)

  return (
    <WorkspacePage
      title="Soutes"
      description="Consultez et créez les soutes des bus interurbains."
      category="Transport"
      links={[{ label: "Accueil", to: "/accueil-agence" }]}
    >
      <Card>
        <CardBody>
          <FormGroup>
            <Label for="soute-bus">Bus interurbain</Label>
            <Input id="soute-bus" name="id_bus" type="select" value={bus ? selectedBus : ""} onChange={event => setSelectedBus(event.target.value)} disabled={loading || !interurbainBuses.length}>
              <option value="">{loading ? "Chargement des bus…" : "Sélectionner un bus"}</option>
              {interurbainBuses.map(item => (
                <option key={item.id} value={item.id}>{[item.num_bus, item.marque].filter(Boolean).join(" — ")}</option>
              ))}
            </Input>
          </FormGroup>
          {error && (
            <Alert color="danger" role="alert">
              {error}{" "}
              <Button outline color="danger" size="sm" onClick={fetchBuses}>Réessayer</Button>
            </Alert>
          )}
          {!loading && !error && !interurbainBuses.length && <p>Aucun bus interurbain disponible.</p>}
          {bus && <SoutesProvider key={bus.id} idBus={Number(bus.id)}><BusSoutes /></SoutesProvider>}
        </CardBody>
      </Card>
    </WorkspacePage>
  )
}

const Soutes = () => <BusProvider><SoutesWorkspace /></BusProvider>

export default Soutes
