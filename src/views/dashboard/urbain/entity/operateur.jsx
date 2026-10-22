import React, { useMemo, useState } from "react"
import { Alert, Badge, Button, Card, CardBody, CardHeader, CardTitle, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap"
import { CreditCard, Edit2, Plus, RefreshCw, Search, Trash2 } from "react-feather"
import DataTable from "react-data-table-component"
import { OperateurProvider, useOperateurs } from "../../../../contexts/OperateurContext"
import { getUserId } from "../../../../utility/utlitaire"

const initialForm = { libele: "", type_op: "MOBILE_MONEY", status: "ACTIF", is_disponible: "Y", gen_id_prefix: "" }
const statusColor = status => (status === "ACTIF" ? "success" : "secondary")
const availabilityColor = value => (value === "Y" ? "success" : "secondary")

const OperateurFields = ({ values, setValues, errors, disabled, prefix }) => {
  const update = key => event => setValues({ ...values, [key]: event.target.value })
  return <>
    <FormGroup><Label for={`${prefix}-libele`}>Libellé <span className="text-danger">*</span></Label><Input id={`${prefix}-libele`} value={values.libele} onChange={update("libele")} invalid={Boolean(errors.libele)} disabled={disabled} autoFocus />{errors.libele ? <FormFeedback>{errors.libele}</FormFeedback> : null}</FormGroup>
    <FormGroup><Label for={`${prefix}-type`}>Type <span className="text-danger">*</span></Label><Input id={`${prefix}-type`} type="select" value={values.type_op} onChange={update("type_op")} disabled={disabled}><option value="MOBILE_MONEY">Mobile Money</option><option value="MAKUTA">Makuta</option></Input></FormGroup>
    <FormGroup><Label for={`${prefix}-status`}>Statut <span className="text-danger">*</span></Label><Input id={`${prefix}-status`} type="select" value={values.status} onChange={update("status")} disabled={disabled}><option value="ACTIF">Actif</option><option value="INACTIF">Inactif</option></Input></FormGroup>
    <FormGroup><Label for={`${prefix}-available`}>Disponible <span className="text-danger">*</span></Label><Input id={`${prefix}-available`} type="select" value={values.is_disponible} onChange={update("is_disponible")} disabled={disabled}><option value="Y">Oui</option><option value="N">Non</option></Input></FormGroup>
    <FormGroup><Label for={`${prefix}-prefix`}>Préfixe généré <span className="text-danger">*</span></Label><Input id={`${prefix}-prefix`} value={values.gen_id_prefix} onChange={event => setValues({ ...values, gen_id_prefix: event.target.value.toUpperCase() })} invalid={Boolean(errors.gen_id_prefix)} disabled={disabled} placeholder="Ex. MPESA" />{errors.gen_id_prefix ? <FormFeedback>{errors.gen_id_prefix}</FormFeedback> : null}</FormGroup>
  </>
}

const OperateurTable = () => {
  const { operateurs, loading, error, fetchOperateurs, createOperateur, creating, createError, clearCreateError, updateOperateur, updating, updateError, clearUpdateError, deleteOperateur, deleting, deleteError, clearDeleteError } = useOperateurs()
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
    if (!values.libele.trim()) errors.libele = "Le libellé est obligatoire."
    if (!values.gen_id_prefix.trim()) errors.gen_id_prefix = "Le préfixe est obligatoire."
    if (!userId()) errors.user = "Identifiant de l'utilisateur introuvable. Veuillez vous reconnecter."
    return errors
  }
  const payload = values => ({ ...values, libele: values.libele.trim(), gen_id_prefix: values.gen_id_prefix.trim(), Id_user_created_at: userId() })
  const closeCreate = () => { setCreateOpen(false); setForm(initialForm); setFormErrors({}); clearCreateError() }
  const closeEdit = () => { setEditOpen(false); setSelected(null); setEditForm(initialForm); setEditErrors({}); clearUpdateError() }
  const closeDelete = () => { setDeleteOpen(false); setSelected(null); clearDeleteError() }
  const onCreate = async event => { event.preventDefault(); const errors = validate(form); setFormErrors(errors); if (Object.keys(errors).length) return; try { await createOperateur(payload(form)); closeCreate(); setSuccessMessage("Opérateur créé avec succès.") } catch (requestError) {} }
  const onEdit = operateur => { setSelected(operateur); setEditForm({ libele: operateur.libele || "", type_op: operateur.type_op || "MOBILE_MONEY", status: operateur.status || "ACTIF", is_disponible: operateur.is_disponible || "Y", gen_id_prefix: operateur.gen_id_prefix || "" }); setEditErrors({}); clearUpdateError(); setEditOpen(true) }
  const onUpdate = async event => { event.preventDefault(); const errors = validate(editForm); setEditErrors(errors); if (Object.keys(errors).length || !selected) return; try { await updateOperateur(selected.id, payload(editForm)); closeEdit(); setSuccessMessage("Opérateur modifié avec succès.") } catch (requestError) {} }
  const onDelete = async () => { if (!selected) return; try { await deleteOperateur(selected.id); closeDelete(); setSuccessMessage("Opérateur supprimé avec succès.") } catch (requestError) {} }

  const columns = useMemo(() => [
    { name: "ID", selector: "id", sortable: true, width: "80px" },
    { name: "Opérateur", selector: "libele", sortable: true, cell: row => <span className="d-flex align-items-center"><CreditCard size={16} className="text-primary mr-50" />{row.libele || "-"}</span> },
    { name: "Type", selector: "type_op", sortable: true },
    { name: "Statut", selector: "status", sortable: true, cell: row => <Badge color={statusColor(row.status)} pill>{row.status || "-"}</Badge> },
    { name: "Disponible", selector: "is_disponible", sortable: true, cell: row => <Badge color={availabilityColor(row.is_disponible)} pill>{row.is_disponible === "Y" ? "Oui" : "Non"}</Badge> },
    { name: "Préfixe", selector: "gen_id_prefix", sortable: true },
    { name: "Actions", ignoreRowClick: true, allowOverflow: true, button: true, width: "120px", cell: row => <div className="actions d-flex align-items-center"><Button.Ripple color="flat-primary" className="btn-icon p-0 mr-50" onClick={() => onEdit(row)}><Edit2 size={17} /></Button.Ripple><Button.Ripple color="flat-danger" className="btn-icon p-0" onClick={() => { setSelected(row); clearDeleteError(); setDeleteOpen(true) }}><Trash2 size={17} /></Button.Ripple></div> }
  ], [])
  const filtered = operateurs.filter(item => [item.id, item.libele, item.type_op, item.status, item.is_disponible, item.gen_id_prefix].some(value => String(value || "").toLowerCase().includes(search.toLowerCase())))

  return <Card><CardHeader className="d-flex flex-wrap justify-content-between align-items-center"><CardTitle tag="h4">Liste des opérateurs de paiement</CardTitle><div className="d-flex align-items-center mt-1 mt-sm-0"><Button.Ripple color="primary" size="sm" className="mr-50" onClick={() => setCreateOpen(true)}><Plus size={15} className="mr-50" />Ajouter</Button.Ripple><Button.Ripple color="primary" outline size="sm" onClick={fetchOperateurs} disabled={loading}><RefreshCw size={15} className="mr-50" />Actualiser</Button.Ripple></div></CardHeader><CardBody>{successMessage ? <Alert color="success" toggle={() => setSuccessMessage("")}>{successMessage}</Alert> : null}{error ? <Alert color="danger">{error}</Alert> : null}<div className="d-flex justify-content-end mb-1"><div className="position-relative has-icon-left col-12 col-md-4 px-0"><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un opérateur" /><div className="form-control-position"><Search size={15} /></div></div></div><DataTable data={filtered} columns={columns} noHeader pagination progressPending={loading} progressComponent={<Spinner color="primary" className="my-2" />} noDataComponent="Aucun opérateur trouvé." /></CardBody>
    <Modal isOpen={createOpen} toggle={closeCreate} centered><Form onSubmit={onCreate}><ModalHeader toggle={closeCreate}>Ajouter un opérateur</ModalHeader><ModalBody>{formErrors.user || createError ? <Alert color="danger">{formErrors.user || createError}</Alert> : null}<OperateurFields values={form} setValues={setForm} errors={formErrors} disabled={creating} prefix="create-operateur" /></ModalBody><ModalFooter><Button color="secondary" outline type="button" onClick={closeCreate} disabled={creating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={creating}>{creating ? <Spinner size="sm" /> : "Enregistrer"}</Button.Ripple></ModalFooter></Form></Modal>
    <Modal isOpen={editOpen} toggle={closeEdit} centered><Form onSubmit={onUpdate}><ModalHeader toggle={closeEdit}>Modifier un opérateur</ModalHeader><ModalBody>{editErrors.user || updateError ? <Alert color="danger">{editErrors.user || updateError}</Alert> : null}<OperateurFields values={editForm} setValues={setEditForm} errors={editErrors} disabled={updating} prefix="edit-operateur" /></ModalBody><ModalFooter><Button color="secondary" outline type="button" onClick={closeEdit} disabled={updating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={updating}>{updating ? <Spinner size="sm" /> : "Modifier"}</Button.Ripple></ModalFooter></Form></Modal>
    <Modal isOpen={deleteOpen} toggle={closeDelete} centered><ModalHeader toggle={closeDelete}>Supprimer un opérateur</ModalHeader><ModalBody>{deleteError ? <Alert color="danger">{deleteError}</Alert> : null}Voulez-vous vraiment supprimer l’opérateur {selected && selected.libele} ?</ModalBody><ModalFooter><Button color="secondary" outline onClick={closeDelete} disabled={deleting}>Annuler</Button><Button.Ripple color="danger" onClick={onDelete} disabled={deleting}>{deleting ? <Spinner size="sm" /> : "Supprimer"}</Button.Ripple></ModalFooter></Modal>
  </Card>
}

const Operateur = () => <OperateurProvider><OperateurTable /></OperateurProvider>
export default Operateur
