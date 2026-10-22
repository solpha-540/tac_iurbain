import React, { useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap"
import { Box, Edit2, Plus, RefreshCw, Search, Trash2 } from "react-feather"
import DataTable from "react-data-table-component"
import { TypeColisProvider, useTypesColis } from "../../../../contexts/TypeColisContext"
import { getUserId } from "../../../../utility/utlitaire"

const initialForm = { categorie: "", nature: "", articles: "", quantite: "", prix_article: "" }
const amount = value => value === null || value === undefined || value === "" ? "-" : `${Number(value).toLocaleString("fr-FR")} FC`

const TypeColisFields = ({ values, setValues, errors, disabled, prefix }) => {
  const update = key => event => setValues({ ...values, [key]: event.target.value })

  return <>
    <FormGroup><Label for={`${prefix}-categorie`}>Catégorie <span className="text-danger">*</span></Label><Input id={`${prefix}-categorie`} type="select" value={values.categorie} onChange={update("categorie")} invalid={Boolean(errors.categorie)} disabled={disabled} autoFocus><option value="">Sélectionner une catégorie</option><option value="Personnaliser">Personnaliser</option><option value="Fragile">Fragile</option><option value="Normal">Normal</option></Input>{errors.categorie && <FormFeedback>{errors.categorie}</FormFeedback>}</FormGroup>
    <FormGroup><Label for={`${prefix}-nature`}>Nature <span className="text-danger">*</span></Label><Input id={`${prefix}-nature`} value={values.nature} onChange={update("nature")} invalid={Boolean(errors.nature)} disabled={disabled} />{errors.nature && <FormFeedback>{errors.nature}</FormFeedback>}</FormGroup>
    <FormGroup><Label for={`${prefix}-articles`}>Article <span className="text-danger">*</span></Label><Input id={`${prefix}-articles`} value={values.articles} onChange={update("articles")} invalid={Boolean(errors.articles)} disabled={disabled} />{errors.articles && <FormFeedback>{errors.articles}</FormFeedback>}</FormGroup>
    <FormGroup><Label for={`${prefix}-quantite`}>Quantité <span className="text-danger">*</span></Label><Input id={`${prefix}-quantite`} value={values.quantite} onChange={update("quantite")} invalid={Boolean(errors.quantite)} disabled={disabled} placeholder="Ex. 1 à 5" />{errors.quantite && <FormFeedback>{errors.quantite}</FormFeedback>}</FormGroup>
    <FormGroup><Label for={`${prefix}-prix`}>Prix de l'article <span className="text-danger">*</span></Label><Input id={`${prefix}-prix`} type="number" min="0" step="any" value={values.prix_article} onChange={update("prix_article")} invalid={Boolean(errors.prix_article)} disabled={disabled} />{errors.prix_article && <FormFeedback>{errors.prix_article}</FormFeedback>}</FormGroup>
  </>
}

const TypeColisTable = () => {
  const { typesColis, loading, error, fetchTypesColis, createTypeColis, creating, createError, clearCreateError, updateTypeColis, updating, updateError, clearUpdateError, deleteTypeColis, deleting, deleteError, clearDeleteError } = useTypesColis()
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
    if (!values.categorie.trim()) errors.categorie = "La catégorie est obligatoire."
    if (!values.nature.trim()) errors.nature = "La nature est obligatoire."
    if (!values.articles.trim()) errors.articles = "L'article est obligatoire."
    if (!values.quantite.trim()) errors.quantite = "La quantité est obligatoire."
    if (values.prix_article === "" || !Number.isFinite(Number(values.prix_article)) || Number(values.prix_article) < 0) errors.prix_article = "Le prix doit être un nombre positif ou nul."
    if (!userId()) errors.user = "Identifiant de l'utilisateur introuvable. Veuillez vous reconnecter."
    return errors
  }
  const payload = values => ({ categorie: values.categorie.trim(), nature: values.nature.trim(), articles: values.articles.trim(), quantite: values.quantite.trim(), prix_article: Number(values.prix_article), id_user_created_at: userId() })
  const closeCreate = () => { setCreateOpen(false); setForm(initialForm); setFormErrors({}); clearCreateError() }
  const closeEdit = () => { setEditOpen(false); setSelected(null); setEditForm(initialForm); setEditErrors({}); clearUpdateError() }
  const closeDelete = () => { setDeleteOpen(false); setSelected(null); clearDeleteError() }
  const onCreate = async event => { event.preventDefault(); const errors = validate(form); setFormErrors(errors); if (Object.keys(errors).length) return; try { await createTypeColis(payload(form)); closeCreate(); setSuccessMessage("Type de colis créé avec succès.") } catch (_) {} }
  const onEdit = typeColis => { setSelected(typeColis); setEditForm({ categorie: typeColis.categorie || "", nature: typeColis.nature || "", articles: typeColis.articles || "", quantite: typeColis.quantite || "", prix_article: typeColis.prix_article ?? "" }); setEditErrors({}); clearUpdateError(); setEditOpen(true) }
  const onUpdate = async event => { event.preventDefault(); const errors = validate(editForm); setEditErrors(errors); if (Object.keys(errors).length || !selected) return; try { await updateTypeColis(selected.id, payload(editForm)); closeEdit(); setSuccessMessage("Type de colis modifié avec succès.") } catch (_) {} }
  const onDelete = async () => { if (!selected) return; try { await deleteTypeColis(selected.id); closeDelete(); setSuccessMessage("Type de colis supprimé avec succès.") } catch (_) {} }

  const columns = useMemo(() => [
    { name: "Catégorie", selector: "categorie", sortable: true, minWidth: "140px", cell: row => <span className="d-flex align-items-center"><Box size={16} className="text-primary mr-50" />{row.categorie || "-"}</span> },
    { name: "Nature", selector: "nature", sortable: true },
    { name: "Article", selector: "articles", sortable: true, minWidth: "200px" },
    { name: "Quantité", selector: "quantite", sortable: true },
    { name: "Prix article", selector: "prix_article", sortable: true, cell: row => amount(row.prix_article) },
    { name: "Actions", ignoreRowClick: true, allowOverflow: true, button: true, width: "120px", cell: row => <div className="actions d-flex align-items-center"><Button.Ripple color="flat-primary" className="btn-icon p-0 mr-50" onClick={() => onEdit(row)} title="Modifier"><Edit2 size={17} /></Button.Ripple><Button.Ripple color="flat-danger" className="btn-icon p-0" onClick={() => { setSelected(row); clearDeleteError(); setDeleteOpen(true) }} title="Supprimer"><Trash2 size={17} /></Button.Ripple></div> },
  ], [])
  const filtered = typesColis.filter(typeColis => [typeColis.id, typeColis.categorie, typeColis.nature, typeColis.articles, typeColis.quantite, typeColis.prix_article].some(value => String(value || "").toLowerCase().includes(search.toLowerCase())))

  return <Card>
    <CardHeader className="d-flex flex-wrap justify-content-between align-items-center"><CardTitle tag="h4">Types de colis</CardTitle><div className="d-flex align-items-center mt-1 mt-sm-0"><Button.Ripple color="primary" size="sm" className="mr-50" onClick={() => setCreateOpen(true)}><Plus size={15} className="mr-50" />Ajouter</Button.Ripple><Button.Ripple color="primary" outline size="sm" onClick={fetchTypesColis} disabled={loading}><RefreshCw size={15} className="mr-50" />Actualiser</Button.Ripple></div></CardHeader>
    <CardBody>
      {successMessage && <Alert color="success" toggle={() => setSuccessMessage("")}>{successMessage}</Alert>}
      {error && <Alert color="danger">{error}</Alert>}
      <div className="d-flex justify-content-end mb-1"><div className="position-relative has-icon-left col-12 col-md-4 px-0"><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un type de colis" /><div className="form-control-position"><Search size={15} /></div></div></div>
      <DataTable data={filtered} columns={columns} noHeader pagination progressPending={loading} progressComponent={<Spinner color="primary" className="my-2" />} noDataComponent="Aucun type de colis trouvé." />
    </CardBody>
    <Modal isOpen={createOpen} toggle={closeCreate} centered><Form onSubmit={onCreate}><ModalHeader toggle={closeCreate}>Ajouter un type de colis</ModalHeader><ModalBody>{(formErrors.user || createError) && <Alert color="danger">{formErrors.user || createError}</Alert>}<TypeColisFields values={form} setValues={setForm} errors={formErrors} disabled={creating} prefix="create-type-colis" /></ModalBody><ModalFooter><Button color="secondary" outline type="button" onClick={closeCreate} disabled={creating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={creating}>{creating ? <Spinner size="sm" /> : "Enregistrer"}</Button.Ripple></ModalFooter></Form></Modal>
    <Modal isOpen={editOpen} toggle={closeEdit} centered><Form onSubmit={onUpdate}><ModalHeader toggle={closeEdit}>Modifier un type de colis</ModalHeader><ModalBody>{(editErrors.user || updateError) && <Alert color="danger">{editErrors.user || updateError}</Alert>}<TypeColisFields values={editForm} setValues={setEditForm} errors={editErrors} disabled={updating} prefix="edit-type-colis" /></ModalBody><ModalFooter><Button color="secondary" outline type="button" onClick={closeEdit} disabled={updating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={updating}>{updating ? <Spinner size="sm" /> : "Modifier"}</Button.Ripple></ModalFooter></Form></Modal>
    <Modal isOpen={deleteOpen} toggle={closeDelete} centered><ModalHeader toggle={closeDelete}>Supprimer un type de colis</ModalHeader><ModalBody>{deleteError && <Alert color="danger">{deleteError}</Alert>}Voulez-vous vraiment supprimer le type de colis {selected && selected.categorie} ?</ModalBody><ModalFooter><Button color="secondary" outline onClick={closeDelete} disabled={deleting}>Annuler</Button><Button.Ripple color="danger" onClick={onDelete} disabled={deleting}>{deleting ? <Spinner size="sm" /> : "Supprimer"}</Button.Ripple></ModalFooter></Modal>
  </Card>
}

const TypeColis = () => <TypeColisProvider><TypeColisTable /></TypeColisProvider>
export default TypeColis
