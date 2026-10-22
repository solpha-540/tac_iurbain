import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap"
import { Edit2, Home, Plus, RefreshCw, Search, Trash2 } from "react-feather"
import DataTable from "react-data-table-component"
import { getCommunes } from "../../../../components/Api/CommuneService"
import { getServices } from "../../../../components/Api/ServiceService"
import { AgenceProvider, useAgences } from "../../../../contexts/AgenceContext"
import { getUserId } from "../../../../utility/utlitaire"

const initialForm = { nom: "", contacts: "", id_commune: "", id_service: "", solde: "" }

const AgenceFields = ({ values, setValues, errors, disabled, communes, services, loading, prefix }) => {
  const update = key => event => setValues({ ...values, [key]: event.target.value })
  return <>
    <FormGroup><Label for={`${prefix}-nom`}>Nom <span className="text-danger">*</span></Label><Input id={`${prefix}-nom`} value={values.nom} onChange={update("nom")} invalid={Boolean(errors.nom)} disabled={disabled} autoFocus />{errors.nom && <FormFeedback>{errors.nom}</FormFeedback>}</FormGroup>
    <FormGroup><Label for={`${prefix}-contacts`}>Contacts <span className="text-danger">*</span></Label><Input id={`${prefix}-contacts`} type="tel" value={values.contacts} onChange={update("contacts")} invalid={Boolean(errors.contacts)} disabled={disabled} />{errors.contacts && <FormFeedback>{errors.contacts}</FormFeedback>}</FormGroup>
    <FormGroup><Label for={`${prefix}-commune`}>Commune <span className="text-danger">*</span></Label><Input id={`${prefix}-commune`} type="select" value={values.id_commune} onChange={update("id_commune")} invalid={Boolean(errors.id_commune)} disabled={disabled || loading}><option value="">Sélectionner une commune</option>{communes.map(commune => <option key={commune.id} value={commune.id}>{commune.labele || commune.libelle || commune.nom}</option>)}</Input>{errors.id_commune && <FormFeedback>{errors.id_commune}</FormFeedback>}</FormGroup>
    <FormGroup><Label for={`${prefix}-service`}>Service <span className="text-danger">*</span></Label><Input id={`${prefix}-service`} type="select" value={values.id_service} onChange={update("id_service")} invalid={Boolean(errors.id_service)} disabled={disabled || loading}><option value="">Sélectionner un service</option>{services.map(service => <option key={service.id} value={service.id}>{service.libelle}</option>)}</Input>{errors.id_service && <FormFeedback>{errors.id_service}</FormFeedback>}</FormGroup>
    <FormGroup><Label for={`${prefix}-solde`}>Solde initial <span className="text-danger">*</span></Label><Input id={`${prefix}-solde`} type="number" min="0" step="0.01" value={values.solde} onChange={update("solde")} invalid={Boolean(errors.solde)} disabled={disabled} />{errors.solde && <FormFeedback>{errors.solde}</FormFeedback>}</FormGroup>
  </>
}

const AgenceTable = () => {
  const ctx = useAgences()
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
  const [communes, setCommunes] = useState([])
  const [services, setServices] = useState([])
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [referencesError, setReferencesError] = useState("")

  useEffect(() => {
    const fetchReferences = async () => {
      setReferencesLoading(true)
      setReferencesError("")
      try {
        const [communeList, serviceList] = await Promise.all([getCommunes(), getServices()])
        setCommunes(communeList)
        setServices(serviceList)
      } catch (error) {
        setReferencesError(error.message || "Impossible de charger les communes et les services.")
      } finally {
        setReferencesLoading(false)
      }
    }
    fetchReferences()
  }, [])

  const validate = values => {
    const errors = {}
    if (!values.nom.trim()) errors.nom = "Le nom de l'agence est obligatoire."
    if (!String(values.contacts).trim()) errors.contacts = "Le contact est obligatoire."
    if (!Number(values.id_commune)) errors.id_commune = "La commune est obligatoire."
    if (!Number(values.id_service)) errors.id_service = "Le service est obligatoire."
    if (values.solde === "" || !Number.isFinite(Number(values.solde)) || Number(values.solde) < 0) errors.solde = "Le solde doit être positif ou nul."
    if (!Number(getUserId())) errors.user = "Identifiant de l'utilisateur introuvable. Veuillez vous reconnecter."
    return errors
  }
  const payload = values => ({ nom: values.nom.trim(), contacts: Number(values.contacts), id_commune: Number(values.id_commune), Id_user_created_at: Number(getUserId()), solde: Number(values.solde), id_service: Number(values.id_service) })
  const closeCreate = () => { setCreateOpen(false); setForm(initialForm); setFormErrors({}); ctx.clearCreateError() }
  const closeEdit = () => { setEditOpen(false); setSelected(null); setEditForm(initialForm); setEditErrors({}); ctx.clearUpdateError() }
  const closeDelete = () => { setDeleteOpen(false); setSelected(null); ctx.clearDeleteError() }
  const onCreate = async event => { event.preventDefault(); const errors = validate(form); setFormErrors(errors); if (Object.keys(errors).length) return; try { await ctx.createAgence(payload(form)); closeCreate(); setSuccessMessage("Agence créée avec succès.") } catch (_) {} }
  const onEdit = item => { setSelected(item); setEditForm({ nom: item.nom || "", contacts: String(item.contacts || ""), id_commune: String(item.id_commune || ""), id_service: String(item.id_service || ""), solde: String(item.solde || "") }); setEditErrors({}); ctx.clearUpdateError(); setEditOpen(true) }
  const onUpdate = async event => { event.preventDefault(); const errors = validate(editForm); setEditErrors(errors); if (Object.keys(errors).length || !selected) return; try { await ctx.updateAgence(selected.id, payload(editForm)); closeEdit(); setSuccessMessage("Agence modifiée avec succès.") } catch (_) {} }
  const onDelete = async () => { if (!selected) return; try { await ctx.deleteAgence(selected.id); closeDelete(); setSuccessMessage("Agence supprimée avec succès.") } catch (_) {} }

  const columns = useMemo(() => [
    { name: "ID", selector: "id", sortable: true, width: "80px" },
    { name: "Agence", selector: "nom", sortable: true, cell: row => <span className="d-flex align-items-center"><Home size={16} className="text-primary mr-50" />{row.nom || "-"}</span> },
    { name: "Contacts", selector: "contacts", sortable: true, cell: row => row.contacts || "-" },
    { name: "Solde", selector: "solde", sortable: true, cell: row => Number(row.solde || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 }) },
    { name: "Actions", ignoreRowClick: true, allowOverflow: true, button: true, width: "120px", cell: row => <div className="actions d-flex align-items-center"><Button.Ripple color="flat-primary" className="btn-icon p-0 mr-50" onClick={() => onEdit(row)}><Edit2 size={17} /></Button.Ripple><Button.Ripple color="flat-danger" className="btn-icon p-0" onClick={() => { setSelected(row); ctx.clearDeleteError(); setDeleteOpen(true) }}><Trash2 size={17} /></Button.Ripple></div> },
  ], [])
  const filtered = ctx.agences.filter(item => [item.id, item.nom, item.contacts, item.solde].some(value => String(value || "").toLowerCase().includes(search.toLowerCase())))
  const referenceError = referencesError || ""

  return <Card><CardHeader className="d-flex flex-wrap justify-content-between align-items-center"><CardTitle tag="h4">Liste des agences</CardTitle><div className="d-flex align-items-center mt-1 mt-sm-0"><Button.Ripple color="primary" size="sm" className="mr-50" onClick={() => setCreateOpen(true)}><Plus size={15} className="mr-50" />Ajouter</Button.Ripple><Button.Ripple color="primary" outline size="sm" onClick={ctx.fetchAgences} disabled={ctx.loading}><RefreshCw size={15} className="mr-50" />Actualiser</Button.Ripple></div></CardHeader><CardBody>{successMessage && <Alert color="success" toggle={() => setSuccessMessage("")}>{successMessage}</Alert>}{ctx.error && <Alert color="danger">{ctx.error}</Alert>}{referenceError && <Alert color="danger">{referenceError}</Alert>}<div className="d-flex justify-content-end mb-1"><div className="position-relative has-icon-left col-12 col-md-4 px-0"><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher une agence" /><div className="form-control-position"><Search size={15} /></div></div></div><DataTable data={filtered} columns={columns} noHeader pagination progressPending={ctx.loading} progressComponent={<Spinner color="primary" className="my-2" />} noDataComponent="Aucune agence trouvée." /></CardBody>
    <Modal isOpen={createOpen} toggle={closeCreate} centered><Form onSubmit={onCreate}><ModalHeader toggle={closeCreate}>Ajouter une agence</ModalHeader><ModalBody>{(formErrors.user || ctx.createError || referenceError) && <Alert color="danger">{formErrors.user || ctx.createError || referenceError}</Alert>}<AgenceFields values={form} setValues={setForm} errors={formErrors} disabled={ctx.creating} communes={communes} services={services} loading={referencesLoading} prefix="create-agence" /></ModalBody><ModalFooter><Button color="secondary" outline type="button" onClick={closeCreate} disabled={ctx.creating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={ctx.creating || referencesLoading || Boolean(referenceError)}>{ctx.creating ? <Spinner size="sm" /> : "Enregistrer"}</Button.Ripple></ModalFooter></Form></Modal>
    <Modal isOpen={editOpen} toggle={closeEdit} centered><Form onSubmit={onUpdate}><ModalHeader toggle={closeEdit}>Modifier une agence</ModalHeader><ModalBody>{(editErrors.user || ctx.updateError || referenceError) && <Alert color="danger">{editErrors.user || ctx.updateError || referenceError}</Alert>}<AgenceFields values={editForm} setValues={setEditForm} errors={editErrors} disabled={ctx.updating} communes={communes} services={services} loading={referencesLoading} prefix="edit-agence" /></ModalBody><ModalFooter><Button color="secondary" outline type="button" onClick={closeEdit} disabled={ctx.updating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={ctx.updating || referencesLoading || Boolean(referenceError)}>{ctx.updating ? <Spinner size="sm" /> : "Modifier"}</Button.Ripple></ModalFooter></Form></Modal>
    <Modal isOpen={deleteOpen} toggle={closeDelete} centered><ModalHeader toggle={closeDelete}>Supprimer une agence</ModalHeader><ModalBody>{ctx.deleteError && <Alert color="danger">{ctx.deleteError}</Alert>}Voulez-vous vraiment supprimer l’agence {selected && selected.nom} ?</ModalBody><ModalFooter><Button color="secondary" outline onClick={closeDelete} disabled={ctx.deleting}>Annuler</Button><Button.Ripple color="danger" onClick={onDelete} disabled={ctx.deleting}>{ctx.deleting ? <Spinner size="sm" /> : "Supprimer"}</Button.Ripple></ModalFooter></Modal>
  </Card>
}

const Agence = () => <AgenceProvider><AgenceTable /></AgenceProvider>
export default Agence
