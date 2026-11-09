import { formatApiError } from "../../../../utility/apiError"
import React, { useEffect, useRef, useState } from "react"
import { Alert, Button, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from "reactstrap"
import { getAgents } from "../../../../components/Api/AgentService"
import { getCommunes } from "../../../../components/Api/CommuneService"
import { getServices } from "../../../../components/Api/ServiceService"
import { emptyAgentForm, kisaluAgentName, matchesKisaluAgent, prefillKisaluAgent, validateAgentForm } from "../../../../components/Api/agentUrbainForm"

const fields = [
  ["nom", "Nom"], ["postnom", "Postnom"], ["prenom", "Prénom"],
  ["Telephone", "Téléphone", "tel"], ["lieuNaissance", "Lieu de naissance"],
  ["DateNaissance", "Date de naissance", "date"], ["date_embauche", "Date d'embauche", "date"],
  ["email", "E-mail", "email"], ["Fonction", "Fonction"], ["Grade", "Grade"]
]
const errorMessage = formatApiError

const CreateAgentUrbainModal = ({ close, createAgent, onCreated }) => {
  const [source, setSource] = useState([])
  const [communes, setCommunes] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ ...emptyAgentForm })
  const [photo, setPhoto] = useState(null)
  const [selectionVersion, setSelectionVersion] = useState(0)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError("")
    Promise.all([getAgents(), getCommunes(), getServices()]).then(([agents, towns, catalog]) => {
      if (!active) return
      setSource(agents)
      setCommunes(towns)
      setServices(catalog)
    }).catch(requestError => { if (active) setLoadError(errorMessage(requestError)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])

  const choose = agent => {
    setSelected(agent)
    setSelectionVersion(value => value + 1)
    setForm(prefillKisaluAgent(agent, services))
    setErrors({})
    setError("")
    setPhoto(null)
  }
  const update = name => event => {
    const value = event.target.value
    setForm(previous => ({ ...previous, [name]: value }))
    setErrors(previous => ({ ...previous, [name]: "" }))
  }
  const submit = async event => {
    event.preventDefault()
    if (submitting.current || !selected) return
    const nextErrors = validateAgentForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    let created = false
    submitting.current = true
    setSaving(true)
    setError("")
    try {
      await createAgent(form, photo)
      created = true
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      submitting.current = false
      setSaving(false)
    }
    if (created) onCreated()
  }
  const results = query.trim().length >= 2 ? source.filter(agent => matchesKisaluAgent(agent, query)) : []
  const toggle = () => { if (!submitting.current) close() }
  return (
    <Modal className="urbain-dialog" isOpen toggle={toggle} centered size="lg" backdrop={saving ? "static" : true} keyboard={!saving}>
      <Form onSubmit={submit}>
        <ModalHeader toggle={saving ? undefined : toggle}>Créer un agent depuis Kisalu</ModalHeader>
        <ModalBody>
          {loading && <div role="status"><Spinner size="sm" /> Chargement des agents Kisalu et des références...</div>}
          {loadError && <Alert color="danger">{loadError} <Button type="button" size="sm" onClick={() => setAttempt(value => value + 1)}>Réessayer</Button></Alert>}
          {!loading && !loadError && <>
            <FormGroup>
              <Label for="kisalu-agent-search">Rechercher par nom, postnom, prénom ou téléphone</Label>
              <Input id="kisalu-agent-search" type="search" value={query} onChange={event => setQuery(event.target.value)} disabled={saving} placeholder="Saisissez au moins deux caractères" />
            </FormGroup>
            {query.trim().length >= 2 && <div className="border rounded mb-2" style={{ maxHeight: 220, overflowY: "auto" }}>
              {results.length === 0 && <p className="p-1 mb-0">Aucun agent Kisalu trouvé.</p>}
              {results.slice(0, 50).map((agent, index) => <Button type="button" key={agent.agentId || agent.id_generate || index} block outline color="primary" className="text-left m-0 rounded-0" disabled={saving} onClick={() => choose(agent)}>
                {kisaluAgentName(agent)} — {agent.telephone_un || agent.telephone_deux || agent.telephone_trois || "Sans téléphone"}
                <small className="d-block">{agent.matricule || agent.codeGenerateTac || ""}</small>
              </Button>)}
              {results.length > 50 && <p className="p-1 mb-0">Affinez la recherche pour afficher les autres résultats.</p>}
            </div>}
            {selected && <>
              <Alert color="info">Agent sélectionné : <strong>{kisaluAgentName(selected)}</strong>. Vérifiez les données préremplies et complétez les références Inter-urbain.</Alert>
              <Row>
                {fields.map(([name, label, type = "text"]) => <Col md="6" key={name}><FormGroup>
                  <Label for={"create-agent-" + name}>{label}{name !== "email" && " *"}</Label>
                  <Input id={"create-agent-" + name} type={type} value={form[name]} onChange={update(name)} disabled={saving} invalid={Boolean(errors[name])} required={name !== "email"} />
                  {errors[name] && <FormFeedback>{errors[name]}</FormFeedback>}
                </FormGroup></Col>)}
                <Col md="6"><FormGroup><Label for="create-agent-sexe">Sexe *</Label>
                  <Input id="create-agent-sexe" type="select" value={form.sexe} onChange={update("sexe")} disabled={saving} required invalid={Boolean(errors.sexe)}>
                    <option value="">Sélectionner</option><option value="M">Masculin</option><option value="F">Féminin</option>
                  </Input><FormFeedback>{errors.sexe}</FormFeedback>
                </FormGroup></Col>
                <Col md="6"><FormGroup><Label for="create-agent-commune">Commune Inter-urbain *</Label>
                  <Input id="create-agent-commune" type="select" value={form.id_commune} onChange={update("id_commune")} disabled={saving} required invalid={Boolean(errors.id_commune)}>
                    <option value="">Sélectionner une commune</option>{communes.map(item => <option key={item.id} value={item.id}>{item.labele || item.libelle || item.nom}</option>)}
                  </Input><FormFeedback>{errors.id_commune}</FormFeedback>
                </FormGroup></Col>
                <Col md="6"><FormGroup><Label for="create-agent-service">Service Inter-urbain *</Label>
                  <Input id="create-agent-service" type="select" value={form.Id_service} onChange={update("Id_service")} disabled={saving} required invalid={Boolean(errors.Id_service)}>
                    <option value="">Sélectionner un service</option>{services.map(item => <option key={item.id} value={item.id}>{item.libelle || item.labele || item.nom}</option>)}
                  </Input><FormFeedback>{errors.Id_service}</FormFeedback>
                </FormGroup></Col>
                <Col md="6"><FormGroup><Label for="create-agent-direction">Identifiant de direction Inter-urbain *</Label>
                  <Input id="create-agent-direction" type="number" min="1" step="1" value={form.Id_direction} onChange={update("Id_direction")} disabled={saving} required invalid={Boolean(errors.Id_direction)} />
                  <FormFeedback>{errors.Id_direction}</FormFeedback>
                  <small className="text-muted">Indiquez la référence Inter-urbain, distincte de celle de Kisalu.</small>
                </FormGroup></Col>
                <Col md="12"><FormGroup><Label for="create-agent-photo">Photo (facultatif)</Label>
                  <Input key={selectionVersion} id="create-agent-photo" type="file" accept="image/*" disabled={saving} onChange={event => setPhoto(event.target.files?.[0] || null)} />
                  <small className="text-muted">La référence photo Kisalu n'est pas un fichier transférable. Joignez une photo si nécessaire.</small>
                </FormGroup></Col>
              </Row>
            </>}
          </>}
          {error && <Alert color="danger" style={{ whiteSpace: "pre-line" }}>{error}</Alert>}
        </ModalBody>
        <ModalFooter>
          <Button type="button" outline color="secondary" onClick={toggle} disabled={saving}>Annuler</Button>
          <Button type="submit" color="primary" disabled={!selected || loading || Boolean(loadError) || saving}>{saving ? "Création en cours..." : "Créer l'agent"}</Button>
        </ModalFooter>
      </Form>
    </Modal>
  )
}
export default CreateAgentUrbainModal
