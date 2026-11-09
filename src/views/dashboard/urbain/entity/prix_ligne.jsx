import SearchInput from "../../../../components/urbain/SearchInput"
import WorkspacePage from "../../../../components/urbain/WorkspacePage"
import React, { useMemo, useState } from "react"
import {
  Alert, Badge, Button, Card, CardBody, CardHeader, CardTitle, Form,
  FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter,
  ModalHeader, Spinner,
} from "reactstrap"
import DataTable from "../../../../components/urbain/BusinessTable"
import { Edit2, Plus, RefreshCw, Search, Trash2 } from "react-feather"
import { PrixLigneProvider, usePrixLignes } from "../../../../contexts/Prix_ligneContext"
import { getUserId } from "../../../../utility/utlitaire"

const emptyForm = {
  id_ligne_principal: "", id_ligne_secondaire: "", id_agence: "",
  prix_commission: "", prix_voyage: "", prix_fret: "", prix_courrier: "", fret_offert: "",
}
const moneyFields = ["prix_commission", "prix_voyage", "prix_fret", "prix_courrier", "fret_offert"]
const fieldLabels = { prix_commission: "Prix commission", prix_voyage: "Prix voyage", prix_fret: "Prix fret", prix_courrier: "Prix courrier", fret_offert: "Fret offert" }

const first = (object, keys) => keys.map(key => object && object[key]).find(value => value !== undefined && value !== null && value !== "")
const lineId = (row, type) => first(row, type === "principale" ? ["id_ligne_principal", "id_ligne_principale", "ligne_principal_id"] : ["id_ligne_secondaire", "id_ligne_secondaires", "ligne_secondaire_id"])
const priceId = row => first(row, ["id_rf_prix_ligne", "id_prix_ligne", "id"])
const lineLabel = row => first(row, ["libele_ligne", "libelle_ligne", "Parcours", "Parcour_ligne", "parcours_ligne", "ligne"]) || "-"
const agencyLabel = (row, agencies) => row.nom_agence || row.agence_nom || (agencies.find(agency => String(agency.id) === String(first(row, ["id_agence", "agence_id"]))) || {}).nom || "-"
const currency = value => value === null || value === undefined || value === "" ? "-" : `${Number(value).toLocaleString("fr-FR")} FC`

const flattenPrices = data => data.reduce((rows, item) => {
  const main = item.Destination_principale || item.destination_principale
  if (!main) return rows.concat(item)

  const children = main.Destinations_secondaires || main.destinations_secondaires || []
  if (priceId(main) !== null && priceId(main) !== undefined) {
    rows.push({ ...main, _type: "principale", _line: lineLabel(main) })
  }
  children.forEach(child => rows.push({ ...main, ...child, _type: "secondaire", _line: lineLabel(child) || lineLabel(main) }))
  return rows
}, [])

const TarifFields = ({ form, setForm, errors, ctx }) => {
  const chooseMain = value => setForm({ ...form, id_ligne_principal: value, id_ligne_secondaire: "" })
  const chooseSecondary = value => setForm({ ...form, id_ligne_principal: "", id_ligne_secondaire: value })

  return (
    <>
      <Alert color="light-primary" className="py-75">Choisissez une ligne principale <strong>ou</strong> une ligne secondaire.</Alert>
      <FormGroup>
        <Label>Ligne principale <span className="text-danger">*</span></Label>
        <Input type="select" value={form.id_ligne_principal} onChange={event => chooseMain(event.target.value)} disabled={ctx.saving || Boolean(form.id_ligne_secondaire)} invalid={Boolean(errors.line)}>
          <option value="">Sélectionner une ligne principale</option>
          {ctx.lignesPrincipales.map(line => <option key={line.id} value={line.id}>{line.libele_ligne || line.libelle_ligne || line.parcours_ligne}</option>)}
        </Input>
      </FormGroup>
      <FormGroup>
        <Label>Ligne secondaire <span className="text-danger">*</span></Label>
        <Input type="select" value={form.id_ligne_secondaire} onChange={event => chooseSecondary(event.target.value)} disabled={ctx.saving || Boolean(form.id_ligne_principal)} invalid={Boolean(errors.line)}>
          <option value="">Sélectionner une ligne secondaire</option>
          {ctx.lignesSecondaires.map(line => <option key={line.id} value={line.id}>{line.libele_ligne || line.libelle_ligne || line.parcours_ligne}</option>)}
        </Input>
        {errors.line && <FormFeedback className="d-block">{errors.line}</FormFeedback>}
      </FormGroup>
      <FormGroup>
        <Label>Agence <span className="text-danger">*</span></Label>
        <Input type="select" value={form.id_agence} onChange={event => setForm({ ...form, id_agence: event.target.value })} disabled={ctx.saving} invalid={Boolean(errors.id_agence)}>
          <option value="">Sélectionner une agence</option>
          {ctx.agences.map(agency => <option key={agency.id} value={agency.id}>{agency.nom || agency.libelle || agency.name}</option>)}
        </Input>
        {errors.id_agence && <FormFeedback>{errors.id_agence}</FormFeedback>}
      </FormGroup>
      {moneyFields.map(field => (
        <FormGroup key={field}>
          <Label>{fieldLabels[field]} <span className="text-danger">*</span></Label>
          <Input type="number" min="0" step="any" value={form[field]} onChange={event => setForm({ ...form, [field]: event.target.value })} disabled={ctx.saving} invalid={Boolean(errors[field])} />
          {errors[field] && <FormFeedback>{errors[field]}</FormFeedback>}
        </FormGroup>
      ))}
    </>
  )
}

const PrixLigneTable = () => {
  const ctx = usePrixLignes()
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState("")
  const rows = useMemo(() => flattenPrices(ctx.prixLignes), [ctx.prixLignes])
  const filteredRows = rows.filter(row => [row._line, row._type, agencyLabel(row, ctx.agences), ...moneyFields.map(field => row[field])].some(value => String(value || "").toLowerCase().includes(search.toLowerCase())))

  const matchingLineId = (row, type) => {
    const explicit = lineId(row, type)
    if (explicit !== undefined) return explicit
    const list = type === "principale" ? ctx.lignesPrincipales : ctx.lignesSecondaires
    const label = String(row._line || lineLabel(row)).toLowerCase()
    const match = list.find(line => [line.libele_ligne, line.libelle_ligne, line.parcours_ligne].some(value => String(value || "").toLowerCase() === label))
    return match && match.id
  }

  const validate = () => {
    const next = {}
    const hasMain = Boolean(form.id_ligne_principal)
    const hasSecondary = Boolean(form.id_ligne_secondaire)
    if (!hasMain && !hasSecondary) next.line = "Veuillez sélectionner une ligne principale ou une ligne secondaire."
    if (hasMain && hasSecondary) next.line = "Une tarification ne peut être associée qu'à une seule ligne."
    if (!form.id_agence) next.id_agence = "L'agence est obligatoire."
    moneyFields.forEach(field => {
      if (form[field] === "" || !Number.isFinite(Number(form[field])) || Number(form[field]) < 0) next[field] = "Saisissez un montant numérique positif ou nul."
    })
    if (!Number(getUserId())) next.user = "Identifiant utilisateur introuvable."
    setErrors(next)
    return !Object.keys(next).length
  }

  const payload = () => ({
    id_ligne_principal: form.id_ligne_principal ? Number(form.id_ligne_principal) : null,
    id_ligne_secondaire: form.id_ligne_secondaire ? Number(form.id_ligne_secondaire) : null,
    id_agence: Number(form.id_agence),
    ...moneyFields.reduce((values, field) => ({ ...values, [field]: Number(form[field]) }), {}),
    Id_user_created_at: Number(getUserId()),
  })

  const close = () => { setModal(null); setErrors({}); ctx.clearError() }
  const openCreate = () => { setSelected(null); setForm(emptyForm); setErrors({}); ctx.clearError(); setModal("form") }
  const openEdit = row => {
    const type = row._type || (lineId(row, "secondaire") ? "secondaire" : "principale")
    const selectedLine = matchingLineId(row, type)
    setSelected(row)
    setForm({
      id_ligne_principal: type === "principale" && selectedLine ? String(selectedLine) : "",
      id_ligne_secondaire: type === "secondaire" && selectedLine ? String(selectedLine) : "",
      id_agence: String(first(row, ["id_agence", "agence_id"]) || ""),
      ...moneyFields.reduce((values, field) => ({ ...values, [field]: row[field] ?? "" }), {}),
    })
    setErrors({})
    ctx.clearError()
    setModal("form")
  }
  const save = async event => {
    event.preventDefault()
    if (!validate()) return
    try {
      if (selected) await ctx.updatePrixLigne(priceId(selected), payload())
      else await ctx.createPrixLigne(payload())
      setSuccess(selected ? "Tarif modifié avec succès." : "Tarif créé avec succès.")
      close()
    } catch (_) {}
  }
  const remove = async () => {
    try {
      await ctx.deletePrixLigne(priceId(selected))
      setSuccess("Tarif supprimé avec succès.")
      close()
    } catch (_) {}
  }

  const columns = useMemo(() => [
    { name: "Ligne", selector: "_line", sortable: true, minWidth: "210px", cell: row => <span className="font-weight-bold text-primary">{row._line}</span> },
    { name: "Type", selector: "_type", sortable: true, cell: row => <Badge color={row._type === "principale" ? "primary" : "info"}>{row._type === "principale" ? "Principale" : "Secondaire"}</Badge> },
    { name: "Agence", cell: row => agencyLabel(row, ctx.agences) },
    { name: "Prix voyage", selector: "prix_voyage", cell: row => currency(first(row, ["prix_voyage", "Prix"])) },
    { name: "Commission", selector: "prix_commission", cell: row => currency(row.prix_commission) },
    { name: "Prix fret", selector: "prix_fret", cell: row => currency(row.prix_fret) },
    { name: "Prix courrier", selector: "prix_courrier", cell: row => currency(row.prix_courrier) },
    { name: "Fret offert", selector: "fret_offert", cell: row => currency(row.fret_offert) },
    { name: "Actions", button: true, width: "100px", cell: row => <div><Button.Ripple color="flat-primary" className="btn-icon p-0 mr-50" onClick={() => openEdit(row)} title="Modifier" aria-label="Modifier"  ><Edit2 size={17} /></Button.Ripple><Button.Ripple color="flat-danger" className="btn-icon p-0" onClick={() => { setSelected(row); ctx.clearError(); setModal("delete") }} title="Supprimer" aria-label="Supprimer"  ><Trash2 size={17} /></Button.Ripple></div> },
  ], [ctx.agences])

  return (
    <Card>
      <CardHeader className="d-flex flex-wrap justify-content-between align-items-center">
        <CardTitle tag="h4">Tarification des lignes</CardTitle>
        <div className="mt-1 mt-sm-0">
          <Button.Ripple color="primary" size="sm" className="mr-50" onClick={openCreate}><Plus size={15} className="mr-50" />Ajouter</Button.Ripple>
          <Button.Ripple color="primary" outline size="sm" onClick={ctx.refreshPrixLignes} disabled={ctx.loading}><RefreshCw size={15} className="mr-50" />Actualiser</Button.Ripple>
        </div>
      </CardHeader>
      <CardBody>
        {success && <Alert color="success" toggle={() => setSuccess("")}>{success}</Alert>}
        {ctx.error && <Alert color="danger">{ctx.error}</Alert>}
        <div className="position-relative has-icon-left col-12 col-md-4 px-0 ml-auto mb-1"><SearchInput value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un tarif"  aria-label="Rechercher un tarif" /><div className="form-control-position"><Search size={15} /></div></div>
        <DataTable data={filteredRows} columns={columns} noHeader pagination progressPending={ctx.loading} progressComponent={<Spinner color="primary" className="my-2" />} noDataComponent="Aucun tarif trouvé." />
      </CardBody>
      <Modal isOpen={modal === "form"} toggle={close} centered className="urbain-dialog" ><Form onSubmit={save}><ModalHeader toggle={close}>{selected ? "Modifier" : "Ajouter"} un tarif</ModalHeader><ModalBody>{(errors.user || ctx.error) && <Alert color="danger">{errors.user || ctx.error}</Alert>}<TarifFields form={form} setForm={setForm} errors={errors} ctx={ctx} /></ModalBody><ModalFooter><Button color="secondary" outline type="button" onClick={close} disabled={ctx.saving}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={ctx.saving}>{ctx.saving ? <Spinner size="sm" /> : "Enregistrer"}</Button.Ripple></ModalFooter></Form></Modal>
      <Modal isOpen={modal === "delete"} toggle={close} centered className="urbain-dialog" ><ModalHeader toggle={close}>Supprimer un tarif</ModalHeader><ModalBody>{ctx.error && <Alert color="danger">{ctx.error}</Alert>}Voulez-vous vraiment supprimer le tarif de la ligne <strong>{selected && selected._line}</strong> ?</ModalBody><ModalFooter><Button color="secondary" outline onClick={close} disabled={ctx.saving}>Annuler</Button><Button.Ripple color="danger" onClick={remove} disabled={ctx.saving}>{ctx.saving ? <Spinner size="sm" /> : "Supprimer"}</Button.Ripple></ModalFooter></Modal>
    </Card>
  )
}

const WorkspaceContent = () => (
  <PrixLigneProvider>
    <PrixLigneTable />
  </PrixLigneProvider>
)

const WorkspaceContentWorkspace = () => <WorkspacePage title="Tarifs de transport" description="Consultez et ajustez les tarifs associés à vos lignes et à vos colis." category="Transport" links={[{"label":"Lignes","to":"/lignes"},{"label":"Types de colis","to":"/colis"}]}><WorkspaceContent /></WorkspacePage>
export default WorkspaceContentWorkspace
