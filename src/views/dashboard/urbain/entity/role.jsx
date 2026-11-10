import React, { useMemo, useRef, useState } from "react"
import { Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"
import { Plus, RefreshCw, Shield } from "react-feather"
import WorkspacePage from "../../../../components/urbain/WorkspacePage"
import BusinessTable from "../../../../components/urbain/BusinessTable"
import SearchInput from "../../../../components/urbain/SearchInput"
import { RoleProvider, useRoles } from "../../../../contexts/RoleContext"
import { formatApiError } from "../../../../utility/apiError"

const RoleTable = () => {
  const { roles, loading, error, fetchRoles, createRole } = useRoles()
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("")
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState("")
  const [success, setSuccess] = useState("")
  const pending = useRef(false)
  const close = () => { if (!pending.current) { setOpen(false); setLabel(""); setCreateError("") } }
  const submit = async event => {
    event.preventDefault()
    if (pending.current) return
    pending.current = true
    setSaving(true)
    setCreateError("")
    let done = false
    try { await createRole(label); done = true }
    catch (e) { setCreateError(formatApiError(e)) }
    finally { pending.current = false; setSaving(false) }
    if (done) { close(); setSuccess("Rôle créé avec succès.") }
  }
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr")
    return roles.filter(role => [role.id, role.label].some(value => String(value ?? "").toLocaleLowerCase("fr").includes(term)))
  }, [roles, search])
  const columns = useMemo(() => [
    { name: "ID", selector: row => row.id, sortable: true, width: "100px" },
    { name: "Rôle", selector: row => row.label || "", sortable: true, cell: row => <span className="d-flex align-items-center"><Shield size={17} className="text-primary mr-50" />{row.label || "Non renseigné"}</span> }
  ], [])
  return <WorkspacePage title="Rôles" category="Administration" description="Gérez les rôles proposés lors de la création des comptes agents." links={[{to:"/agents-urbain",label:"Agents"}]}>
    {success && <Alert color="success" role="status" toggle={() => setSuccess("")}>{success}</Alert>}
    {error && <Alert color="danger" role="alert" style={{whiteSpace:"pre-line"}}>{error}<Button type="button" outline color="danger" size="sm" className="ml-1" onClick={fetchRoles} disabled={loading}>Réessayer</Button></Alert>}
    <Card><CardHeader className="d-flex justify-content-between align-items-center">
      <CardTitle tag="h2">Liste des rôles</CardTitle>
      <div className="d-flex"><Button color="primary" className="mr-50" onClick={() => { setSuccess(""); setOpen(true) }}><Plus size={16} className="mr-50" />Ajouter un rôle</Button>
      <Button outline color="primary" onClick={fetchRoles} disabled={loading}><RefreshCw size={16} className="mr-50" />Actualiser</Button></div>
    </CardHeader><CardBody>
      <div className="col-12 col-md-5 px-0 mb-2"><Label for="role-search">Rechercher un rôle</Label><SearchInput id="role-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Libellé ou identifiant" /></div>
      <BusinessTable data={filtered} columns={columns} noHeader pagination progressPending={loading} noDataComponent={error ? "La liste des rôles est indisponible." : "Aucun rôle trouvé."} />
    </CardBody></Card>
    <Modal className="urbain-dialog" isOpen={open} toggle={close} centered backdrop={saving ? "static" : true} keyboard={!saving}>
      <Form onSubmit={submit}><ModalHeader toggle={saving ? undefined : close}>Ajouter un rôle</ModalHeader><ModalBody>
        {createError && <Alert color="danger" role="alert" style={{whiteSpace:"pre-line"}}>{createError}</Alert>}
        <FormGroup><Label for="role-label">Libellé du rôle *</Label><Input id="role-label" value={label} onChange={event => setLabel(event.target.value)} required autoFocus disabled={saving} placeholder="Ex. CAISSIER" /></FormGroup>
      </ModalBody><ModalFooter><Button type="button" outline color="secondary" onClick={close} disabled={saving}>Annuler</Button><Button type="submit" color="primary" disabled={saving || !label.trim()}>{saving ? "Enregistrement..." : "Créer le rôle"}</Button></ModalFooter></Form>
    </Modal>
  </WorkspacePage>
}
const Roles = () => <RoleProvider><RoleTable /></RoleProvider>
export default Roles
