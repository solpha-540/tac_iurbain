 
import React, { useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap"
import { Plus, RefreshCw, Search } from "react-feather"
import DataTable from "../../../../components/urbain/BusinessTable"
import SearchInput from "../../../../components/urbain/SearchInput"
import WorkspacePage from "../../../../components/urbain/WorkspacePage"
import { PrixCargoProvider, usePrixCargos } from "../../../../contexts/Prix_cargoContext"

const emptyForm = { id_ligne_principal: "", id_ligne_secondaire: "", prix_location: "" }

const valueFor = (row, keys) => keys.map(key => row && row[key]).find(value => value !== undefined && value !== null && value !== "")
const agencyName = (row, agency) => row.agence?.nom || row.nom_agence || row.agence_nom || agency?.nom || "-"
const lineName = (row, keys, lines) => {
  const direct = valueFor(row, keys)
  if (direct && typeof direct === "object") {
    return direct.libele_ligne || direct.libelle_ligne || direct.parcours_ligne || direct.nom || "-"
  }
  const line = lines.find(item => String(item.id) === String(direct))
  return line
    ? line.libele_ligne || line.libelle_ligne || line.parcours_ligne || line.nom || "-"
    : "-"
}
const formatPrice = value =>
  value === null || value === undefined || value === "" ? "-" : `${Number(value).toLocaleString("fr-FR")} FC`

const PrixCargoTable = () => {
  const ctx = usePrixCargos()
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState("")

  const rows = useMemo(() => ctx.prixCargos.map(row => ({
    ...row,
    _agency: agencyName(row, ctx.agency),
    _mainLine: lineName(row, ["ligne_principale", "id_ligne_principal", "Destination_principale"], ctx.lignesPrincipales),
    _secondaryLine: lineName(row, ["ligne_secondaire", "id_ligne_secondaire", "Destination_secondaire"], ctx.lignesSecondaires),
    _price: valueFor(row, ["prix_location", "Prix_location"]),
  })), [ctx.prixCargos, ctx.agency, ctx.lignesPrincipales, ctx.lignesSecondaires])

  const filteredRows = rows.filter(row =>
    [row._agency, row._mainLine, row._secondaryLine, row._price]
      .some(value => String(value || "").toLowerCase().includes(search.toLowerCase())),
  )

  const secondaryLines = ctx.lignesSecondaires.filter(line =>
    String(line.id_ligne_principal) === form.id_ligne_principal
  )

  const closeModal = () => {
    if (ctx.saving) return
    resetModal()
  }

  const resetModal = () => {
    setModalOpen(false)
    setForm(emptyForm)
    setErrors({})
    ctx.clearError()
  }

  const save = async event => {
    event.preventDefault()
    const nextErrors = {}
    if (ctx.saving || ctx.loading) return
    if (form.id_ligne_secondaire && !secondaryLines.some(line => String(line.id) === form.id_ligne_secondaire)) {
      nextErrors.id_ligne_secondaire = "Sélectionnez une ligne secondaire rattachée à la ligne principale."
    }
    if (!form.id_ligne_principal) nextErrors.id_ligne_principal = "La ligne principale est obligatoire."
    if (form.prix_location === "" || !Number.isFinite(Number(form.prix_location)) || Number(form.prix_location) < 0) {
      nextErrors.prix_location = "Saisissez un montant numérique positif ou nul."
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      await ctx.addPrixCargo({
        id_ligne_principal: Number(form.id_ligne_principal),
        ...(form.id_ligne_secondaire ? { id_ligne_secondaire: Number(form.id_ligne_secondaire) } : {}),
        prix_location: Number(form.prix_location).toFixed(2),
      })
      setSuccess("Prix cargo créé avec succès.")
      resetModal()
    } catch (_) {}
  }

  const columns = useMemo(() => [
    { name: "Agence", selector: "_agency", sortable: true, minWidth: "160px" },
    { name: "Ligne principale", selector: "_mainLine", sortable: true, minWidth: "180px" },
    { name: "Ligne secondaire", selector: "_secondaryLine", sortable: true, minWidth: "180px" },
    { name: "Prix de location", selector: "_price", sortable: true, cell: row => formatPrice(row._price) },
  ], [])

  return (
    <Card>
      <CardHeader className="d-flex flex-wrap justify-content-between align-items-center">
        <CardTitle tag="h4">Prix cargo</CardTitle>
        <div className="mt-1 mt-sm-0">
          <Button.Ripple color="primary" size="sm" className="mr-50" disabled={ctx.loading || !ctx.agency?.id} onClick={() => { ctx.clearError(); setModalOpen(true) }}>
            <Plus size={15} className="mr-50" />Ajouter
          </Button.Ripple>
          <Button.Ripple color="primary" outline size="sm" onClick={ctx.fetchData} disabled={ctx.loading}>
            <RefreshCw size={15} className="mr-50" />Actualiser
          </Button.Ripple>
        </div>
      </CardHeader>
      <CardBody>
        {success && <Alert color="success" toggle={() => setSuccess("")}>{success}</Alert>}
        {ctx.error && <Alert color="danger">{ctx.error}</Alert>}
        <div className="position-relative has-icon-left col-12 col-md-4 px-0 ml-auto mb-1">
          <SearchInput value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un prix cargo" aria-label="Rechercher un prix cargo" />
          <div className="form-control-position"><Search size={15} /></div>
        </div>
        <DataTable data={filteredRows} columns={columns} noHeader pagination progressPending={ctx.loading} progressComponent={<Spinner color="primary" className="my-2" />} noDataComponent="Aucun prix cargo trouvé." />
      </CardBody>
      <Modal isOpen={modalOpen} toggle={closeModal} centered className="urbain-dialog">
        <Form onSubmit={save}>
          <ModalHeader toggle={closeModal}>Ajouter un prix cargo</ModalHeader>
          <ModalBody>
            {ctx.error && <Alert color="danger">{ctx.error}</Alert>}
            <FormGroup>
              <Label for="cargo-agency">Agence</Label>
              <Input id="cargo-agency" value={ctx.agency?.nom || ""} readOnly />
            </FormGroup>
            <FormGroup>
              <Label for="cargo-main-line">Ligne principale <span className="text-danger">*</span></Label>
              <Input id="cargo-main-line" type="select" value={form.id_ligne_principal} onChange={event => setForm({ ...form, id_ligne_principal: event.target.value, id_ligne_secondaire: "" })} invalid={Boolean(errors.id_ligne_principal)} disabled={ctx.saving || ctx.loading}>
                <option value="">Sélectionner une ligne principale</option>
                {ctx.lignesPrincipales.map(line => <option key={line.id} value={line.id}>{line.libele_ligne || line.libelle_ligne || line.parcours_ligne || line.nom}</option>)}
              </Input>
              {errors.id_ligne_principal && <FormFeedback>{errors.id_ligne_principal}</FormFeedback>}
            </FormGroup>
            <FormGroup>
              <Label for="cargo-secondary-line">Ligne secondaire</Label>
              <Input id="cargo-secondary-line" type="select" value={form.id_ligne_secondaire} onChange={event => setForm({ ...form, id_ligne_secondaire: event.target.value })} invalid={Boolean(errors.id_ligne_secondaire)} disabled={ctx.saving || ctx.loading || !form.id_ligne_principal}>
                <option value="">Sélectionner une ligne secondaire</option>
                {secondaryLines.map(line => <option key={line.id} value={line.id}>{line.libele_ligne || line.libelle_ligne || line.parcours_ligne || line.nom}</option>)}
              </Input>
              {errors.id_ligne_secondaire && <FormFeedback>{errors.id_ligne_secondaire}</FormFeedback>}
            </FormGroup>
            <FormGroup>
              <Label for="cargo-price">Prix de location <span className="text-danger">*</span></Label>
              <Input id="cargo-price" type="number" min="0" step="0.01" value={form.prix_location} onChange={event => setForm({ ...form, prix_location: event.target.value })} invalid={Boolean(errors.prix_location)} disabled={ctx.saving} />
              {errors.prix_location && <FormFeedback>{errors.prix_location}</FormFeedback>}
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" outline type="button" onClick={closeModal} disabled={ctx.saving}>Annuler</Button>
            <Button.Ripple color="primary" type="submit" disabled={ctx.saving || ctx.loading}>
              {ctx.saving ? <Spinner size="sm" /> : "Enregistrer"}
            </Button.Ripple>
          </ModalFooter>
        </Form>
      </Modal>
    </Card>
  )
}

const PrixCargo = () => <PrixCargoProvider><PrixCargoTable /></PrixCargoProvider>

const PrixCargoWorkspace = () => (
  <WorkspacePage title="Prix cargo" description="Consultez et gérez les prix de location cargo de votre agence." category="Transport" links={[{ label: "Accueil", to: "/accueil-agence" }]}>
    <PrixCargo />
  </WorkspacePage>
)

export default PrixCargoWorkspace