import React, { useMemo, useState } from "react"
import { Alert, Badge, Button, Card, CardBody, CardHeader, CardTitle, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap"
import { Briefcase, Edit2, Plus, RefreshCw, Search, Trash2 } from "react-feather"
import DataTable from "react-data-table-component"
import { ServiceProvider, useServices } from "../../../../contexts/ServiceContext"
import { getUserId } from "../../../../utility/utlitaire"

const initialForm = { libelle: "", status: "ACTIVED" }
const statusColor = status => status === "ACTIVED" ? "success" : "secondary"
const statusLabel = status => status === "ACTIVED" ? "Activé" : "Désactivé"

const ServiceFields = ({ values, setValues, errors, disabled, prefix }) => {
  const update = key => event => setValues({ ...values, [key]: event.target.value })

  return <>
    <FormGroup>
      <Label for={`${prefix}-libelle`}>Libellé <span className="text-danger">*</span></Label>
      <Input id={`${prefix}-libelle`} value={values.libelle} onChange={update("libelle")} invalid={Boolean(errors.libelle)} disabled={disabled} autoFocus />
      {errors.libelle && <FormFeedback>{errors.libelle}</FormFeedback>}
    </FormGroup>
    <FormGroup>
      <Label for={`${prefix}-status`}>Statut <span className="text-danger">*</span></Label>
      <Input id={`${prefix}-status`} type="select" value={values.status} onChange={update("status")} disabled={disabled}>
        <option value="ACTIVED">Activé</option>
        <option value="DESACTIVED">Désactivé</option>
      </Input>
    </FormGroup>
  </>
}

const agencies = service => Array.isArray(service.agences) ? service.agences : []

const ServiceTable = () => {
  const { services, loading, error, fetchServices, createService, creating, createError, clearCreateError, updateService, updating, updateError, clearUpdateError, deleteService, deleting, deleteError, clearDeleteError } = useServices()
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [editForm, setEditForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")

  const userId = () => Number(getUserId())
  const validate = values => {
    const errors = {}
    if (!values.libelle.trim()) errors.libelle = "Le libellé est obligatoire."
    if (!userId()) errors.user = "Identifiant de l'utilisateur introuvable. Veuillez vous reconnecter."
    return errors
  }
  const payload = values => ({ libelle: values.libelle.trim(), status: values.status, Id_user_created_at: userId() })
  const closeCreate = () => { setCreateOpen(false); setForm(initialForm); setFormErrors({}); clearCreateError() }
  const closeEdit = () => { setEditOpen(false); setSelected(null); setEditForm(initialForm); setEditErrors({}); clearUpdateError() }
  const closeDelete = () => { setDeleteOpen(false); setSelected(null); clearDeleteError() }
  const onCreate = async event => { event.preventDefault(); const errors = validate(form); setFormErrors(errors); if (Object.keys(errors).length) return; try { await createService(payload(form)); closeCreate(); setSuccessMessage("Service créé avec succès.") } catch (_) {} }
  const onEdit = service => { setSelected(service); setEditForm({ libelle: service.libelle || "", status: service.status || "ACTIVED" }); setEditErrors({}); clearUpdateError(); setEditOpen(true) }
  const onUpdate = async event => { event.preventDefault(); const errors = validate(editForm); setEditErrors(errors); if (Object.keys(errors).length || !selected) return; try { await updateService(selected.id, payload(editForm)); closeEdit(); setSuccessMessage("Service modifié avec succès.") } catch (_) {} }
  const onDelete = async () => { if (!selected) return; try { await deleteService(selected.id); closeDelete(); setSuccessMessage("Service supprimé avec succès.") } catch (_) {} }

  const columns = useMemo(() => [
    { name: "ID", selector: "id", sortable: true, width: "80px" },
    { name: "Service", selector: "libelle", sortable: true, cell: row => <span className="d-flex align-items-center"><Briefcase size={16} className="text-primary mr-50" />{row.libelle || "-"}</span> },
    { name: "Statut", selector: "status", sortable: true, cell: row => <Badge color={statusColor(row.status)} pill>{statusLabel(row.status)}</Badge> },
    { name: "Agences associées", sortable: true, minWidth: "220px", cell: row => agencies(row).length ? <div>{agencies(row).map(agency => <Badge color="light-primary" className="mr-50 mb-25" key={agency.id}>{agency.nom || `Agence #${agency.id}`}</Badge>)}</div> : <span className="text-muted">Aucune agence</span> },
    { name: "Actions", ignoreRowClick: true, allowOverflow: true, button: true, width: "120px", cell: row => <div className="actions d-flex align-items-center"><Button.Ripple color="flat-primary" className="btn-icon p-0 mr-50" onClick={() => onEdit(row)} title="Modifier"><Edit2 size={17} /></Button.Ripple><Button.Ripple color="flat-danger" className="btn-icon p-0" onClick={() => { setSelected(row); clearDeleteError(); setDeleteOpen(true) }} title="Supprimer"><Trash2 size={17} /></Button.Ripple></div> },
  ], [])
  const filtered = services.filter(service => [service.id, service.libelle, service.status, ...agencies(service).map(agency => agency.nom)].some(value => String(value || "").toLowerCase().includes(search.toLowerCase())))

  return <Card>
    <CardHeader className="d-flex flex-wrap justify-content-between align-items-center"><CardTitle tag="h4">Liste des services</CardTitle><div className="d-flex align-items-center mt-1 mt-sm-0"><Button.Ripple color="primary" size="sm" className="mr-50" onClick={() => setCreateOpen(true)}><Plus size={15} className="mr-50" />Ajouter</Button.Ripple><Button.Ripple color="primary" outline size="sm" onClick={fetchServices} disabled={loading}><RefreshCw size={15} className="mr-50" />Actualiser</Button.Ripple></div></CardHeader>
    <CardBody>
      {successMessage && <Alert color="success" toggle={() => setSuccessMessage("")}>{successMessage}</Alert>}
      {error && <Alert color="danger">{error}</Alert>}
      <div className="d-flex justify-content-end mb-1"><div className="position-relative has-icon-left col-12 col-md-4 px-0"><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un service" /><div className="form-control-position"><Search size={15} /></div></div></div>
      <DataTable data={filtered} columns={columns} noHeader pagination progressPending={loading} progressComponent={<Spinner color="primary" className="my-2" />} noDataComponent="Aucun service trouvé." />
    </CardBody>
    <Modal isOpen={createOpen} toggle={closeCreate} centered><Form onSubmit={onCreate}><ModalHeader toggle={closeCreate}>Ajouter un service</ModalHeader><ModalBody>{(formErrors.user || createError) && <Alert color="danger">{formErrors.user || createError}</Alert>}<ServiceFields values={form} setValues={setForm} errors={formErrors} disabled={creating} prefix="create-service" /></ModalBody><ModalFooter><Button color="secondary" outline type="button" onClick={closeCreate} disabled={creating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={creating}>{creating ? <Spinner size="sm" /> : "Enregistrer"}</Button.Ripple></ModalFooter></Form></Modal>
    <Modal isOpen={editOpen} toggle={closeEdit} centered><Form onSubmit={onUpdate}><ModalHeader toggle={closeEdit}>Modifier un service</ModalHeader><ModalBody>{(editErrors.user || updateError) && <Alert color="danger">{editErrors.user || updateError}</Alert>}<ServiceFields values={editForm} setValues={setEditForm} errors={editErrors} disabled={updating} prefix="edit-service" /></ModalBody><ModalFooter><Button color="secondary" outline type="button" onClick={closeEdit} disabled={updating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={updating}>{updating ? <Spinner size="sm" /> : "Modifier"}</Button.Ripple></ModalFooter></Form></Modal>
    <Modal isOpen={deleteOpen} toggle={closeDelete} centered><ModalHeader toggle={closeDelete}>Supprimer un service</ModalHeader><ModalBody>{deleteError && <Alert color="danger">{deleteError}</Alert>}Voulez-vous vraiment supprimer le service {selected && selected.libelle} ?</ModalBody><ModalFooter><Button color="secondary" outline onClick={closeDelete} disabled={deleting}>Annuler</Button><Button.Ripple color="danger" onClick={onDelete} disabled={deleting}>{deleting ? <Spinner size="sm" /> : "Supprimer"}</Button.Ripple></ModalFooter></Modal>
  </Card>
}

const Service = () => <ServiceProvider><ServiceTable /></ServiceProvider>
export default Service
