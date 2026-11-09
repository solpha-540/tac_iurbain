import React, { useEffect, useMemo, useState } from "react"
import { Alert, Badge, Button, Card, CardBody, CardHeader, CardTitle, Input, Label, Spinner, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap"
import DataTable from "react-data-table-component"
import { RefreshCw, MoreVertical, Users, UserCheck, MapPin, Search, Plus, X, UserPlus } from "react-feather"
import AgentActionModal from "./AgentActionModal"
import CreateAgentUrbainModal from "./CreateAgentUrbainModal"
import { AgentUrbainProvider, useAgentsUrbain } from "../../../../contexts/Agent_urbainContext"

const fullName = agent => [agent.nom, agent.postnom, agent.prenom].filter(Boolean).join(" ") || "Agent non renseigné"
const initials = agent => [agent.prenom, agent.nom].filter(Boolean).map(value => value.charAt(0)).join("").toUpperCase() || "AG"
const accountStatus = agent => !agent.account ? "Sans compte" : agent.account.is_active ? "Actif" : "Inactif"
const normalize = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
const filterOptions = [["all", "Tous les agents"], ["unassigned", "Sans agence"], ["noaccount", "Sans compte"], ["active", "Compte actif"], ["inactive", "Compte inactif"]]

const AgentUrbainTable = () => {
  const { agents, loading, error, fetchAgents, createAgent, assignAgent, createAccount } = useAgentsUrbain()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [resetPage, setResetPage] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [agentAction, setAgentAction] = useState(null)
  const [success, setSuccess] = useState("")
  useEffect(() => { setResetPage(value => !value) }, [search, filter])
  const stats = useMemo(() => ({
    total: agents.length,
    active: agents.filter(agent => agent.account?.is_active).length,
    unassigned: agents.filter(agent => !agent.agency).length
  }), [agents])
  const filteredAgents = useMemo(() => agents.filter(agent => {
    if (filter === "unassigned" && agent.agency) return false
    if (filter === "noaccount" && agent.account) return false
    if (filter === "active" && !agent.account?.is_active) return false
    if (filter === "inactive" && (!agent.account || agent.account.is_active)) return false
    const haystack = normalize([
      fullName(agent), agent.code_generate_user, agent.Telephone, agent.email,
      agent.Fonction, agent.Grade, agent.service?.libelle, agent.role?.label,
      agent.agency?.nom, agent.account?.login
    ].filter(Boolean).join(" "))
    return normalize(search).trim().split(/\s+/).every(term => haystack.includes(term))
  }), [agents, search, filter])
  const clearFilters = () => { setSearch(""); setFilter("all") }

  const columns = useMemo(() => [
    {
      name: "Agent", selector: fullName, sortable: true, minWidth: "220px",
      cell: row => <div className="agent-identity">
        <span className="agent-avatar" aria-hidden="true">{initials(row)}</span>
        <div><strong>{fullName(row)}</strong><small className="d-block text-muted">{row.code_generate_user || "Code non renseigné"}</small></div>
      </div>
    },
    {
      name: "Fonction", selector: row => row.Fonction || "", sortable: true, minWidth: "150px",
      cell: row => <div><span>{row.Fonction || "—"}</span><small className="d-block text-muted">{row.Grade || "Grade non renseigné"}</small></div>
    },
    {
      name: "Service et rôle", selector: row => row.service?.libelle || "", sortable: true, minWidth: "170px",
      cell: row => <div><span>{row.service?.libelle || "—"}</span><small className="d-block text-muted">{row.role?.label || "Sans rôle"}</small></div>
    },
    {
      name: "Agence", selector: row => row.agency?.nom || "", sortable: true, minWidth: "140px",
      cell: row => row.agency?.nom || <span className="text-muted">Non affecté</span>
    },
    {
      name: "Contact", minWidth: "200px",
      cell: row => <div><span>{row.Telephone || "—"}</span><small className="d-block text-muted">{row.email || "E-mail non renseigné"}</small></div>
    },
    {
      name: "Compte", selector: accountStatus, sortable: true, minWidth: "120px",
      cell: row => <Badge color={!row.account ? "light-secondary" : row.account.is_active ? "light-success" : "light-danger"}>{accountStatus(row)}</Badge>
    },
    {
      name: "Actions", width: "85px", button: true, allowOverflow: true,
      cell: row => <UncontrolledDropdown>
        <DropdownToggle color="flat-primary" className="btn-icon" aria-label={"Actions pour " + fullName(row)}><MoreVertical size={18} /></DropdownToggle>
        <DropdownMenu right positionFixed>
          <DropdownItem onClick={() => { setSuccess(""); setAgentAction({ agent: row, action: "assign" }) }}><MapPin size={15} className="mr-50" />Affecter à une agence</DropdownItem>
          <DropdownItem disabled={Boolean(row.account)} onClick={() => { setSuccess(""); setAgentAction({ agent: row, action: "account" }) }}><UserPlus size={15} className="mr-50" />{row.account ? "Compte déjà créé" : "Créer un compte"}</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    }
  ], [])

  const narrowed = Boolean(search.trim()) || filter !== "all"
  return <section className="agent-directory" aria-labelledby="agents-title">
    <header className="directory-heading">
      <div><span className="directory-eyebrow">Inter-urbain / Équipe</span><h1 id="agents-title">Agents</h1><p className="directory-subtitle">Gérez votre équipe, les affectations et les accès depuis un seul espace.</p></div>
      <div className="directory-actions">
        <Button outline color="primary" onClick={fetchAgents} disabled={loading}><RefreshCw size={16} className="mr-50" />{loading ? "Actualisation..." : "Actualiser"}</Button>
        <Button color="primary" onClick={() => { setSuccess(""); setCreateOpen(true) }}><Plus size={17} className="mr-50" />Créer un agent</Button>
      </div>
    </header>
    <div className="directory-stats">
      {[[Users, "Agents au total", stats.total], [UserCheck, "Comptes actifs", stats.active], [MapPin, "Sans agence", stats.unassigned]].map(([Icon, label, value]) =>
        <div className="directory-stat" key={label}><span className="stat-icon" aria-hidden="true"><Icon size={21} /></span><div><span className="stat-number">{loading ? "—" : value}</span><span className="stat-label">{label}</span></div></div>
      )}
    </div>
    {success && <Alert color="success" role="status" toggle={() => setSuccess("")}>{success}</Alert>}
    {error && <Alert color="danger" role="alert">{error} <Button type="button" size="sm" color="danger" outline onClick={fetchAgents} disabled={loading}>Réessayer</Button></Alert>}
    <Card>
      <CardHeader><div><CardTitle tag="h2" className="mb-0">Répertoire des agents</CardTitle></div></CardHeader>
      <CardBody>
        <div className="directory-toolbar">
          <div className="directory-search">
            <Label for="agent-urbain-search">Rechercher</Label><Search size={17} className="search-icon" aria-hidden="true" />
            <Input id="agent-urbain-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nom, téléphone, service ou agence..." />
            {search && <button type="button" className="search-clear" aria-label="Effacer la recherche" onClick={() => setSearch("")}><X size={16} /></button>}
          </div>
          <div className="directory-filter"><Label for="agent-status-filter">Afficher</Label><Input id="agent-status-filter" type="select" value={filter} onChange={event => setFilter(event.target.value)}>{filterOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Input></div>
        </div>
        <p className="directory-results" role="status" aria-live="polite">{loading ? "Chargement du répertoire..." : error ? "Répertoire indisponible" : filteredAgents.length + " résultat(s) sur " + agents.length + " agent(s)"}</p>
        <DataTable keyField="id" columns={columns} data={filteredAgents} noHeader pagination paginationResetDefaultPage={resetPage}
          paginationComponentOptions={{ rowsPerPageText: "Lignes par page", rangeSeparatorText: "sur", selectAllRowsItem: true, selectAllRowsItemText: "Tout" }}
          highlightOnHover responsive progressPending={loading}
          progressComponent={<div className="directory-loading" role="status"><Spinner size="sm" color="primary" />Chargement des agents...</div>}
          noDataComponent={<div className="directory-empty"><Users size={32} aria-hidden="true" /><h3>{error ? "Impossible de charger les agents" : narrowed ? "Aucun résultat" : "Votre répertoire est vide"}</h3>
            <p>{error ? "Réessayez pour récupérer les données." : narrowed ? "Essayez un autre nom ou élargissez les filtres." : "Créez votre premier agent à partir du répertoire Kisalu."}</p>
            {!error && (narrowed ? <Button outline color="primary" onClick={clearFilters}>Réinitialiser les filtres</Button> : <Button color="primary" onClick={() => setCreateOpen(true)}>Créer un agent</Button>)}
          </div>}
        />
      </CardBody>
    </Card>
    {agentAction && <AgentActionModal key={agentAction.action + "-" + agentAction.agent.id} {...agentAction} close={() => setAgentAction(null)} submitAction={agentAction.action === "assign" ? assignAgent : createAccount} onSuccess={() => { setSuccess(agentAction.action === "assign" ? "Affectation créée avec succès." : "Compte créé avec succès."); setAgentAction(null) }} />}
    {createOpen && <CreateAgentUrbainModal close={() => setCreateOpen(false)} createAgent={createAgent} onCreated={() => { setCreateOpen(false); setSuccess("Agent créé avec succès.") }} />}
  </section>
}
const AgentUrbain = () => <AgentUrbainProvider><AgentUrbainTable /></AgentUrbainProvider>
export default AgentUrbain
