import AgentActionModal from "./AgentActionModal"
import CreateAgentUrbainModal from "./CreateAgentUrbainModal"
import React, { useMemo, useState } from "react"
import { Alert, Badge, Button, Card, CardBody, CardHeader, CardTitle, Input, Label, Spinner, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap"
import DataTable from "react-data-table-component"
import { RefreshCw, MoreVertical } from "react-feather"
import { AgentUrbainProvider, useAgentsUrbain } from "../../../../contexts/Agent_urbainContext"

const fullName = agent => [agent.nom, agent.postnom, agent.prenom].filter(Boolean).join(" ") || "Agent non renseigné"
const accountStatus = agent => !agent.account ? "Sans compte" : agent.account.is_active ? "Actif" : "Inactif"

const AgentUrbainTable = () => {
  const { agents, loading, error, fetchAgents, createAgent, assignAgent, createAccount } = useAgentsUrbain()
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [agentAction, setAgentAction] = useState(null)
  const [success, setSuccess] = useState("")
  const filteredAgents = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr")
    return !term ? agents : agents.filter(agent => [
      fullName(agent), agent.code_generate_user, agent.Telephone, agent.email,
      agent.Fonction, agent.Grade, agent.service?.libelle, agent.role?.label,
      agent.agency?.nom, agent.account?.login, accountStatus(agent)
    ].some(value => String(value ?? "").toLocaleLowerCase("fr").includes(term)))
  }, [agents, search])

  const columns = useMemo(() => [
    {
      name: "Agent",
      selector: row => fullName(row),
      sortable: true,
      minWidth: "240px",
      cell: row => (
        <div className="py-50">
          <strong>{fullName(row)}</strong>
          <small className="d-block text-muted">{row.code_generate_user || "Sans code"}</small>
        </div>
      )
    },
    {
      name: "Fonction / grade",
      selector: row => row.Fonction || "",
      sortable: true,
      minWidth: "170px",
      cell: row => (
        <div className="py-50">
          <span>{row.Fonction || "—"}</span>
          <small className="d-block text-muted">{row.Grade || "—"}</small>
        </div>
      )
    },
    { name: "Service", selector: row => row.service?.libelle || "—", sortable: true, minWidth: "170px" },
    { name: "Rôle", selector: row => row.role?.label || "—", sortable: true, minWidth: "150px" },
    { name: "Agence", selector: row => row.agency?.nom || "Non affecté", sortable: true, minWidth: "150px" },
    {
      name: "Contact",
      minWidth: "220px",
      cell: row => (
        <div className="py-50">
          <span>{row.Telephone || "—"}</span>
          <small className="d-block text-muted">{row.email || "—"}</small>
        </div>
      )
    },
    {
      name: "Compte",
      selector: row => accountStatus(row),
      sortable: true,
      minWidth: "130px",
      cell: row => (
        <Badge color={!row.account ? "light-secondary" : row.account.is_active ? "light-success" : "light-danger"}>
          {accountStatus(row)}
        </Badge>
      )
    }
    , {
      name: "Actions",
      width: "100px",
      button: true,
      allowOverflow: true,
      cell: row => <UncontrolledDropdown>
        <DropdownToggle color="flat-primary" className="btn-icon" aria-label={"Actions pour " + fullName(row)}><MoreVertical size={18} /></DropdownToggle>
        <DropdownMenu right positionFixed>
          <DropdownItem onClick={() => { setSuccess(""); setAgentAction({ agent: row, action: "assign" }) }}>Affecter</DropdownItem>
          <DropdownItem disabled={Boolean(row.account)} onClick={() => { setSuccess(""); setAgentAction({ agent: row, action: "account" }) }}>{row.account ? "Compte déjà créé" : "Créer un compte"}</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    }
  ], [])

  return (
    <><Card className="border-0 shadow-sm">
      <CardHeader className="d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <CardTitle tag="h4">Agents Inter-urbain</CardTitle>
          <small className="text-muted">{agents.length} agent(s)</small>
        </div>
        <div className="d-flex align-items-center"><Button color="primary" size="sm" className="mr-1" onClick={() => { setSuccess(""); setCreateOpen(true) }}>Créer Agent</Button>
        <Button outline color="primary" size="sm" onClick={fetchAgents} disabled={loading}>
          <RefreshCw size={15} className="mr-50" />Actualiser
        </Button></div>
      </CardHeader>
      <CardBody>
        {success && <Alert color="success" toggle={() => setSuccess("")}>{success}</Alert>}
        {error && <Alert color="danger">{error}</Alert>}
        <div className="col-12 col-md-5 px-0 mb-2">
          <Label for="agent-urbain-search">Rechercher un agent</Label>
          <Input
            id="agent-urbain-search"
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Nom, téléphone, service, rôle ou agence"
          />
        </div>
        <DataTable
          keyField="id"
          columns={columns}
          data={filteredAgents}
          noHeader
          pagination
          paginationComponentOptions={{ rowsPerPageText: "Lignes par page", rangeSeparatorText: "sur" }}
          highlightOnHover
          responsive
          progressPending={loading}
          progressComponent={<Spinner color="primary" className="my-2" />}
          noDataComponent={error ? "La liste des agents est indisponible." : "Aucun agent trouvé."}
        />
      </CardBody>
    </Card>
    {agentAction && <AgentActionModal key={agentAction.action + "-" + agentAction.agent.id} {...agentAction} close={() => setAgentAction(null)} submitAction={agentAction.action === "assign" ? assignAgent : createAccount} onSuccess={() => { setSuccess(agentAction.action === "assign" ? "Affectation créée avec succès." : "Compte créé avec succès."); setAgentAction(null) }} />}
    {createOpen && <CreateAgentUrbainModal close={() => setCreateOpen(false)} createAgent={createAgent} onCreated={() => { setCreateOpen(false); setSuccess("Agent créé avec succès."); }} />}</>
  )
}

const AgentUrbain = () => <AgentUrbainProvider><AgentUrbainTable /></AgentUrbainProvider>
export default AgentUrbain
