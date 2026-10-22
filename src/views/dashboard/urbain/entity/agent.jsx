import React, { useEffect, useMemo, useState } from "react"
import { Alert, Badge, Button, Card, CardBody, CardHeader, CardTitle, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner, UncontrolledDropdown } from "reactstrap"
import DataTable from "react-data-table-component"
import { Briefcase, MoreVertical, RefreshCw, Search, User, Users } from "react-feather"
import { getAgences } from "../../../../components/Api/AgenceService"
import { AgentProvider, useAgents } from "../../../../contexts/AgentContext"

const fullName = agent => [agent.nom, agent.postNom, agent.prenom].filter(Boolean).join(" ") || "Agent non renseigné"
const initials = agent => fullName(agent).split(" ").filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase()
const contact = agent => agent.telephone_un || agent.login || ""

const StatCard = ({ icon: Icon, color, label, value }) => <Col md="4" sm="6" className="mb-1"><Card className="border-0 shadow-sm mb-0"><CardBody className="d-flex align-items-center py-1"><div className={`rounded-circle bg-light-${color} text-${color} p-1 mr-1`}><Icon size={20} /></div><div><small className="text-muted d-block">{label}</small><h4 className="mb-0">{value}</h4></div></CardBody></Card></Col>

const AssignmentModal = ({ agent, agencies, loading, agenciesError, close }) => {
  const [form, setForm] = useState({ id_agence: "", date_affectation: "" })
  const [errors, setErrors] = useState({})
  useEffect(() => { setForm({ id_agence: "", date_affectation: "" }); setErrors({}) }, [agent])
  if (!agent) return null
  const submit = event => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.id_agence) nextErrors.id_agence = "Veuillez sélectionner une agence."
    if (!form.date_affectation) nextErrors.date_affectation = "La date d'affectation est obligatoire."
    setErrors(nextErrors)
    if (!Object.keys(nextErrors).length) close()
  }
  return <Modal isOpen toggle={close} centered size="lg"><Form onSubmit={submit}><ModalHeader toggle={close}>Affecter un agent</ModalHeader><ModalBody><p className="text-muted mb-2">Informations récupérées depuis le profil de l’agent.</p><Row><Col md="4"><FormGroup><Label for="affectation-nom">Nom</Label><Input id="affectation-nom" value={agent.nom || ""} disabled /></FormGroup></Col><Col md="4"><FormGroup><Label for="affectation-postnom">Postnom</Label><Input id="affectation-postnom" value={agent.postNom || ""} disabled /></FormGroup></Col><Col md="4"><FormGroup><Label for="affectation-prenom">Prénom</Label><Input id="affectation-prenom" value={agent.prenom || ""} disabled /></FormGroup></Col><Col md="6"><FormGroup><Label for="affectation-fonction">Fonction</Label><Input id="affectation-fonction" value={agent.fonctionLibelle || "Non renseignée"} disabled /></FormGroup></Col><Col md="6"><FormGroup><Label for="affectation-contact">Contact</Label><Input id="affectation-contact" value={contact(agent) || "Non renseigné"} disabled /></FormGroup></Col></Row>{agenciesError && <Alert color="danger">{agenciesError}</Alert>}<Row><Col md="6"><FormGroup className="mb-md-0"><Label for="affectation-agence">Agence <span className="text-danger">*</span></Label><Input id="affectation-agence" type="select" value={form.id_agence} onChange={event => setForm({ ...form, id_agence: event.target.value })} invalid={Boolean(errors.id_agence)} disabled={loading || Boolean(agenciesError)}><option value="">{loading ? "Chargement des agences..." : "Sélectionner une agence"}</option>{agencies.map(agency => <option key={agency.id} value={agency.id}>{agency.nom}</option>)}</Input>{errors.id_agence && <FormFeedback>{errors.id_agence}</FormFeedback>}</FormGroup></Col><Col md="6"><FormGroup className="mb-0"><Label for="affectation-date">Date d'affectation <span className="text-danger">*</span></Label><Input id="affectation-date" type="date" value={form.date_affectation} onChange={event => setForm({ ...form, date_affectation: event.target.value })} invalid={Boolean(errors.date_affectation)} />{errors.date_affectation && <FormFeedback>{errors.date_affectation}</FormFeedback>}</FormGroup></Col></Row></ModalBody><ModalFooter><Button type="button" color="secondary" outline onClick={close}>Annuler</Button><Button.Ripple type="submit" color="primary" disabled={loading || Boolean(agenciesError)}>Affecter</Button.Ripple></ModalFooter></Form></Modal>
}

const ACCOUNT_ROLES = [
  { value: "caissiere", label: "Caissière" },
  { value: "chef_agence", label: "Chef d'agence" },
  { value: "bagagiste", label: "Bagagiste" },
  { value: "convoyeur", label: "Convoyeur" },
  { value: "chef_reseau_connexe", label: "Chef réseau connexe" },
]

const AccountCreationModal = ({ agent, close }) => {
  const [form, setForm] = useState({ role: "", password: "", confirmPassword: "" })
  const [errors, setErrors] = useState({})
  useEffect(() => { setForm({ role: "", password: "", confirmPassword: "" }); setErrors({}) }, [agent])
  if (!agent) return null
  const submit = event => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.role) nextErrors.role = "Veuillez sélectionner un rôle."
    if (!form.password) nextErrors.password = "Le mot de passe est obligatoire."
    else if (form.password.length < 6) nextErrors.password = "Le mot de passe doit contenir au moins 6 caractères."
    if (!form.confirmPassword) nextErrors.confirmPassword = "Veuillez confirmer le mot de passe."
    else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Les mots de passe ne correspondent pas."
    setErrors(nextErrors)
    if (!Object.keys(nextErrors).length) close()
  }
  return <Modal isOpen toggle={close} centered size="lg">
    <Form onSubmit={submit}><ModalHeader toggle={close}>Créer un compte agent</ModalHeader>
    <ModalBody><p className="text-muted mb-2">Les informations suivantes sont liées au profil sélectionné.</p>
    <Row>
      <Col md="6">
      <FormGroup><Label for="compte-nom">Nom</Label>
      <Input id="compte-nom" value={agent.nom || ""} disabled />
      </FormGroup>
      </Col>
      <Col md="6"><FormGroup><Label for="compte-postnom">Postnom</Label>
      <Input id="compte-postnom" value={agent.postNom || ""} disabled />
      </FormGroup>
      </Col>
      <Col md="6"><FormGroup><Label for="compte-prenom">Prenom</Label>
      <Input id="compte-prenom" value={agent.prenom || ""} disabled />
      </FormGroup>
      </Col>
      <Col md="6"><FormGroup><Label for="compte-contact">Contact</Label>
      <Input id="compte-contact" value={contact(agent) || "Non renseigné"} disabled /></FormGroup></Col><Col md="6"><FormGroup><Label for="compte-fonction">Fonction</Label><Input id="compte-fonction" value={agent.fonctionLibelle || "Non renseignée"} disabled /></FormGroup></Col><Col md="6"><FormGroup><Label for="compte-role">Rôle <span className="text-danger">*</span></Label><Input id="compte-role" type="select" value={form.role} onChange={event => setForm({ ...form, role: event.target.value })} invalid={Boolean(errors.role)}><option value="">Sélectionner un rôle</option>{ACCOUNT_ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}</Input>{errors.role && <FormFeedback>{errors.role}</FormFeedback>}</FormGroup></Col><Col md="6"><FormGroup><Label for="compte-password">Mot de passe <span className="text-danger">*</span></Label><Input id="compte-password" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} invalid={Boolean(errors.password)} autoComplete="new-password" />{errors.password && <FormFeedback>{errors.password}</FormFeedback>}</FormGroup></Col><Col md="6"><FormGroup className="mb-0"><Label for="compte-confirm-password">Confirmer le mot de passe <span className="text-danger">*</span></Label><Input id="compte-confirm-password" type="password" value={form.confirmPassword} onChange={event => setForm({ ...form, confirmPassword: event.target.value })} invalid={Boolean(errors.confirmPassword)} autoComplete="new-password" />{errors.confirmPassword && <FormFeedback>{errors.confirmPassword}</FormFeedback>}</FormGroup></Col></Row></ModalBody><ModalFooter><Button type="button" color="secondary" outline onClick={close}>Annuler</Button><Button.Ripple type="submit" color="primary">Créer le compte</Button.Ripple></ModalFooter></Form></Modal>
}

const AgentTable = () => {
  const { agents, loading, error, fetchAgents } = useAgents()
  const [search, setSearch] = useState("")
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [accountAgent, setAccountAgent] = useState(null)
  const [agencies, setAgencies] = useState([])
  const [agenciesLoading, setAgenciesLoading] = useState(true)
  const [agenciesError, setAgenciesError] = useState("")
  useEffect(() => {
    const loadAgencies = async () => { setAgenciesLoading(true); try { setAgencies(await getAgences()) } catch (requestError) { setAgenciesError(requestError.message || "Impossible de récupérer les agences.") } finally { setAgenciesLoading(false) } }
    loadAgencies()
  }, [])
  const filteredAgents = useMemo(() => { const term = search.trim().toLowerCase(); return !term ? agents : agents.filter(agent => [fullName(agent), agent.login, agent.matricule, agent.role_libelle, agent.fonctionLibelle, contact(agent)].some(value => String(value || "").toLowerCase().includes(term))) }, [agents, search])
  const stats = useMemo(() => ({ total: agents.length, active: agents.filter(agent => Number(agent.statut) === 0).length, roles: new Set(agents.map(agent => agent.role_libelle).filter(Boolean)).size }), [agents])
  const columns = useMemo(() => [
    { name: "Agent", minWidth: "230px", sortable: true, selector: row => fullName(row), cell: row => <div className="d-flex align-items-center py-50"><div className="rounded-circle bg-light-primary text-primary d-flex align-items-center justify-content-center mr-1" style={{ width: 34, height: 34, fontWeight: 600 }}>{initials(row)}</div><div><strong>{fullName(row)}</strong><small className="d-block text-muted">{row.matricule || row.codeGenerateTac || "Sans matricule"}</small></div></div> },
    { name: "Rôle / fonction", minWidth: "210px", cell: row => <div className="py-50"><Badge color="light-primary">{row.role_libelle || "—"}</Badge><small className="d-block text-muted mt-25">{row.fonctionLibelle || row.serviceLibelle || "Non renseigné"}</small></div> },
    { name: "Service", minWidth: "150px", cell: row => row.serviceLibelle || row.directionLibelle || "—" },
    { name: "Contact", minWidth: "190px", cell: row => <div className="py-50"><span>{contact(row) || "—"}</span><small className="d-block text-muted">{row.mail || "—"}</small></div> },
    { name: "Actions", width: "75px", button: true, cell: row => <UncontrolledDropdown><DropdownToggle color="flat-primary" className="btn-icon p-50" title="Actions" aria-label={`Actions pour ${fullName(row)}`}><MoreVertical size={18} /></DropdownToggle><DropdownMenu right><DropdownItem onClick={() => setSelectedAgent(row)}>Affecter</DropdownItem><DropdownItem onClick={() => setAccountAgent(row)}>Créer un compte</DropdownItem></DropdownMenu></UncontrolledDropdown> },
  ], [])
  return <><Row><StatCard icon={Users} color="primary" label="Agents" value={stats.total} /><StatCard icon={User} color="success" label="Agents actifs" value={stats.active} /><StatCard icon={Briefcase} color="info" label="Rôles" value={stats.roles} /></Row><Card className="border-0 shadow-sm"><CardHeader className="d-flex flex-wrap justify-content-between align-items-center pb-1"><div><CardTitle tag="h4" className="mb-25">Liste des agents</CardTitle><small className="text-muted">Informations synchronisées avec Kisalu.</small></div><Button.Ripple outline color="primary" size="sm" onClick={fetchAgents} disabled={loading} className="mt-1 mt-sm-0"><RefreshCw size={15} className="mr-50" />Actualiser</Button.Ripple></CardHeader><CardBody>{error && <Alert color="danger">{error}</Alert>}<div className="position-relative has-icon-left col-12 col-md-5 px-0 mb-2"><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un agent, rôle ou contact" /><div className="form-control-position"><Search size={15} /></div></div><DataTable columns={columns} data={filteredAgents} noHeader pagination highlightOnHover responsive progressPending={loading} progressComponent={<Spinner color="primary" className="my-2" />} noDataComponent={error ? "" : "Aucun agent trouvé."} /></CardBody></Card><AssignmentModal agent={selectedAgent} agencies={agencies} loading={agenciesLoading} agenciesError={agenciesError} close={() => setSelectedAgent(null)} /><AccountCreationModal agent={accountAgent} close={() => setAccountAgent(null)} /></>
}

const Agent = () => <AgentProvider><AgentTable /></AgentProvider>
export default Agent
