import SearchInput from "../../../../components/urbain/SearchInput"
import WorkspacePage from "../../../../components/urbain/WorkspacePage"
import React, { useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap"
import { DollarSign, Edit2, Plus, RefreshCw, Search, Trash2 } from "react-feather"
import DataTable from "../../../../components/urbain/BusinessTable"
import { CurrencyProvider, useCurrencies } from "../../../../contexts/CurrencyContext"
import { getUserId } from "../../../../utility/utlitaire"

const initialForm = { name: "", format_key: "", symbol: "", taux_change: "", min_monentary_unit: "0.01", iso_format: "" }

const CurrencyFields = ({ values, setValues, errors, disabled, prefix }) => {
  const update = key => event => setValues({ ...values, [key]: event.target.value })
  return <>
    <FormGroup><Label for={`${prefix}-name`}>Nom <span className="text-danger">*</span></Label><Input id={`${prefix}-name`} value={values.name} onChange={update("name")} invalid={Boolean(errors.name)} disabled={disabled} autoFocus />{errors.name ? <FormFeedback>{errors.name}</FormFeedback> : null}</FormGroup>
    <FormGroup><Label for={`${prefix}-format`}>Clé de format <span className="text-danger">*</span></Label><Input id={`${prefix}-format`} value={values.format_key} onChange={event => setValues({ ...values, format_key: event.target.value.toUpperCase() })} invalid={Boolean(errors.format_key)} disabled={disabled} placeholder="Ex. CDF" />{errors.format_key ? <FormFeedback>{errors.format_key}</FormFeedback> : null}</FormGroup>
    <FormGroup><Label for={`${prefix}-symbol`}>Symbole <span className="text-danger">*</span></Label><Input id={`${prefix}-symbol`} value={values.symbol} onChange={update("symbol")} invalid={Boolean(errors.symbol)} disabled={disabled} placeholder="Ex. FC" />{errors.symbol ? <FormFeedback>{errors.symbol}</FormFeedback> : null}</FormGroup>
    <FormGroup><Label for={`${prefix}-rate`}>Taux de change <span className="text-danger">*</span></Label><Input id={`${prefix}-rate`} type="number" min="0" step="any" value={values.taux_change} onChange={update("taux_change")} invalid={Boolean(errors.taux_change)} disabled={disabled} />{errors.taux_change ? <FormFeedback>{errors.taux_change}</FormFeedback> : null}</FormGroup>
    <FormGroup><Label for={`${prefix}-unit`}>Unité monétaire minimale <span className="text-danger">*</span></Label><Input id={`${prefix}-unit`} type="number" min="0" step="any" value={values.min_monentary_unit} onChange={update("min_monentary_unit")} invalid={Boolean(errors.min_monentary_unit)} disabled={disabled} />{errors.min_monentary_unit ? <FormFeedback>{errors.min_monentary_unit}</FormFeedback> : null}</FormGroup>
    <FormGroup><Label for={`${prefix}-iso`}>Format ISO <span className="text-danger">*</span></Label><Input id={`${prefix}-iso`} value={values.iso_format} onChange={event => setValues({ ...values, iso_format: event.target.value.toUpperCase() })} invalid={Boolean(errors.iso_format)} disabled={disabled} placeholder="Ex. CDF" />{errors.iso_format ? <FormFeedback>{errors.iso_format}</FormFeedback> : null}</FormGroup>
  </>
}

const CurrencyTable = () => {
  const { currencies, loading, error, fetchCurrencies, createCurrency, creating, createError, clearCreateError, updateCurrency, updating, updateError, clearUpdateError, deleteCurrency, deleting, deleteError, clearDeleteError } = useCurrencies()
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
  const validate = values => {
    const errors = {}
    ;["name", "format_key", "symbol", "iso_format"].forEach(key => { if (!values[key].trim()) errors[key] = "Ce champ est obligatoire." })
    if (values.taux_change === "" || Number(values.taux_change) < 0) errors.taux_change = "Le taux doit être positif ou nul."
    if (values.min_monentary_unit === "" || Number(values.min_monentary_unit) < 0) errors.min_monentary_unit = "L'unité doit être positive ou nulle."
    if (!Number(getUserId())) errors.user = "Identifiant de l'utilisateur introuvable. Veuillez vous reconnecter."
    return errors
  }
  const payload = values => ({ ...values, name: values.name.trim(), format_key: values.format_key.trim(), symbol: values.symbol.trim(), iso_format: values.iso_format.trim(), taux_change: Number(values.taux_change), min_monentary_unit: Number(values.min_monentary_unit), Id_user_created_at: Number(getUserId()) })
  const closeCreate = () => { setCreateOpen(false); setForm(initialForm); setFormErrors({}); clearCreateError() }
  const closeEdit = () => { setEditOpen(false); setSelected(null); setEditForm(initialForm); setEditErrors({}); clearUpdateError() }
  const closeDelete = () => { setDeleteOpen(false); setSelected(null); clearDeleteError() }
  const onCreate = async event => { event.preventDefault(); const errors = validate(form); setFormErrors(errors); if (Object.keys(errors).length) return; try { await createCurrency(payload(form)); closeCreate(); setSuccessMessage("Devise créée avec succès.") } catch (requestError) {} }
  const onEdit = item => { setSelected(item); setEditForm({ ...initialForm, name: item.name || "" }); setEditErrors({}); clearUpdateError(); setEditOpen(true) }
  const onUpdate = async event => { event.preventDefault(); const errors = validate(editForm); setEditErrors(errors); if (Object.keys(errors).length || !selected) return; try { await updateCurrency(selected.id, payload(editForm)); closeEdit(); setSuccessMessage("Devise modifiée avec succès.") } catch (requestError) {} }
  const onDelete = async () => { if (!selected) return; try { await deleteCurrency(selected.id); closeDelete(); setSuccessMessage("Devise supprimée avec succès.") } catch (requestError) {} }
  const columns = useMemo(() => [
    { name: "ID", selector: "id", sortable: true, width: "100px" },
    { name: "Devise", selector: "name", sortable: true, cell: row => <span className="d-flex align-items-center"><DollarSign size={16} className="text-primary mr-50" />{row.name || "-"}</span> },
    { name: "Actions", ignoreRowClick: true, allowOverflow: true, button: true, width: "120px", cell: row => <div className="actions d-flex align-items-center"><Button.Ripple color="flat-primary" className="btn-icon p-0 mr-50" onClick={() => onEdit(row)} aria-label="Modifier" title="Modifier" ><Edit2 size={17} /></Button.Ripple><Button.Ripple color="flat-danger" className="btn-icon p-0" onClick={() => { setSelected(row); clearDeleteError(); setDeleteOpen(true) }} aria-label="Supprimer" title="Supprimer" ><Trash2 size={17} /></Button.Ripple></div> }
  ], [])
  const filtered = currencies.filter(item => [item.id, item.name].some(value => String(value || "").toLowerCase().includes(search.toLowerCase())))

  return <Card><CardHeader className="d-flex flex-wrap justify-content-between align-items-center"><CardTitle tag="h4">Liste des devises</CardTitle><div className="d-flex align-items-center mt-1 mt-sm-0"><Button.Ripple color="primary" size="sm" className="mr-50" onClick={() => setCreateOpen(true)}><Plus size={15} className="mr-50" />Ajouter</Button.Ripple><Button.Ripple color="primary" outline size="sm" onClick={fetchCurrencies} disabled={loading}><RefreshCw size={15} className="mr-50" />Actualiser</Button.Ripple></div></CardHeader><CardBody>{successMessage ? <Alert color="success" toggle={() => setSuccessMessage("")}>{successMessage}</Alert> : null}{error ? <Alert color="danger">{error}</Alert> : null}<div className="d-flex justify-content-end mb-1"><div className="position-relative has-icon-left col-12 col-md-4 px-0"><SearchInput value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher une devise"  aria-label="Rechercher une devise" /><div className="form-control-position"><Search size={15} /></div></div></div><DataTable data={filtered} columns={columns} noHeader pagination progressPending={loading} progressComponent={<Spinner color="primary" className="my-2" />} noDataComponent="Aucune devise trouvée." /></CardBody>
    <Modal isOpen={createOpen} toggle={closeCreate} centered className="urbain-dialog" ><Form onSubmit={onCreate}><ModalHeader toggle={closeCreate}>Ajouter une devise</ModalHeader><ModalBody>{formErrors.user || createError ? <Alert color="danger">{formErrors.user || createError}</Alert> : null}<CurrencyFields values={form} setValues={setForm} errors={formErrors} disabled={creating} prefix="create-currency" /></ModalBody><ModalFooter><Button color="secondary" outline type="button" onClick={closeCreate} disabled={creating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={creating}>{creating ? <Spinner size="sm" /> : "Enregistrer"}</Button.Ripple></ModalFooter></Form></Modal>
    <Modal isOpen={editOpen} toggle={closeEdit} centered className="urbain-dialog" ><Form onSubmit={onUpdate}><ModalHeader toggle={closeEdit}>Modifier une devise</ModalHeader><ModalBody>{editErrors.user || updateError ? <Alert color="danger">{editErrors.user || updateError}</Alert> : null}<CurrencyFields values={editForm} setValues={setEditForm} errors={editErrors} disabled={updating} prefix="edit-currency" /></ModalBody><ModalFooter><Button color="secondary" outline type="button" onClick={closeEdit} disabled={updating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={updating}>{updating ? <Spinner size="sm" /> : "Modifier"}</Button.Ripple></ModalFooter></Form></Modal>
    <Modal isOpen={deleteOpen} toggle={closeDelete} centered className="urbain-dialog" ><ModalHeader toggle={closeDelete}>Supprimer une devise</ModalHeader><ModalBody>{deleteError ? <Alert color="danger">{deleteError}</Alert> : null}Voulez-vous vraiment supprimer la devise {selected && selected.name} ?</ModalBody><ModalFooter><Button color="secondary" outline onClick={closeDelete} disabled={deleting}>Annuler</Button><Button.Ripple color="danger" onClick={onDelete} disabled={deleting}>{deleting ? <Spinner size="sm" /> : "Supprimer"}</Button.Ripple></ModalFooter></Modal>
  </Card>
}

const Currency = () => <CurrencyProvider><CurrencyTable /></CurrencyProvider>
const CurrencyWorkspace = () => <WorkspacePage title="Devises" description="Gérez les devises disponibles pour les opérations de votre réseau." category="Référentiels" links={[{"label":"Tarifs","to":"/prixlignes"}]}><Currency /></WorkspacePage>
export default CurrencyWorkspace
