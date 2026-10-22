import React, { useMemo, useState } from "react"
import {
  Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, FormFeedback,
  FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner
} from "reactstrap"
import { Edit2, MapPin, Plus, RefreshCw, Search, Trash2 } from "react-feather"
import DataTable from "react-data-table-component"
import { VilleProvider, useVilles } from "../../../../contexts/VilleContext"
import { CommuneProvider, useCommunes } from "../../../../contexts/CommuneContext"
import { getUserId } from "../../../../utility/utlitaire"

const getVilleId = Commune => Commune.Id_Ville || Commune.id_Ville || Commune.Ville_id

const CommuneTable = () => {
  const {
    Communes, loading, error, fetchCommunes,
    createCommune, creating, createError, clearCreateError,
    updateCommune, updating, updateError, clearUpdateError,
    deleteCommune, deleting, deleteError, clearDeleteError
  } = useCommunes()
  const { villes: Villes, loading: VillesLoading } = useVilles()
  const [search, setSearch] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCommune, setSelectedCommune] = useState(null)
  const [labele, setLabele] = useState("")
  const [VilleId, setVilleId] = useState("")
  const [editLabele, setEditLabele] = useState("")
  const [editVilleId, setEditVilleId] = useState("")
  const [formError, setFormError] = useState("")
  const [editFormError, setEditFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const getCurrentUserId = () => Number(getUserId())

  const toggleCreateModal = () => {
    setIsCreateModalOpen(isOpen => !isOpen)
    setLabele("")
    setVilleId("")
    setFormError("")
    clearCreateError()
  }

  const toggleEditModal = () => {
    setIsEditModalOpen(isOpen => !isOpen)
    setSelectedCommune(null)
    setEditLabele("")
    setEditVilleId("")
    setEditFormError("")
    clearUpdateError()
  }

  const toggleDeleteModal = () => {
    setIsDeleteModalOpen(isOpen => !isOpen)
    setSelectedCommune(null)
    clearDeleteError()
  }

  const validateCommune = (value, selectedVilleId, setError) => {
    if (!value.trim()) {
      setError("Le libellé de la Commune est obligatoire.")
      return false
    }
    if (!selectedVilleId) {
      setError("Veuillez sélectionner une Ville.")
      return false
    }
    if (!getCurrentUserId()) {
      setError("Identifiant de l'utilisateur introuvable. Veuillez vous reconnecter.")
      return false
    }
    return true
  }

  const handleCreateCommune = async event => {
    event.preventDefault()
    if (!validateCommune(labele, VilleId, setFormError)) return
    setFormError("")
    try {
      await createCommune({
        labele: labele.trim(),
        Id_ville: Number(VilleId),
        Id_user_created_at: getCurrentUserId()
      })
      toggleCreateModal()
      setSuccessMessage("Commune créée avec succès.")
    } catch (requestError) {
      // L'erreur API est affichée dans le modal.
    }
  }

  const handleEditClick = Commune => {
    setSelectedCommune(Commune)
    setEditLabele(Commune.labele || "")
    setEditVilleId(String(getVilleId(Commune) || ""))
    setEditFormError("")
    clearUpdateError()
    setIsEditModalOpen(true)
  }

  const handleUpdateCommune = async event => {
    event.preventDefault()
    if (!selectedCommune || !validateCommune(editLabele, editVilleId, setEditFormError)) return
    setEditFormError("")
    try {
      await updateCommune(selectedCommune.id, {
        labele: editLabele.trim(),
        Id_ville: Number(editVilleId),
        Id_user_created_at: getCurrentUserId()
      })
      toggleEditModal()
      setSuccessMessage("Commune modifiée avec succès.")
    } catch (requestError) {
      // L'erreur API est affichée dans le modal.
    }
  }

  const handleDeleteClick = Commune => {
    setSelectedCommune(Commune)
    clearDeleteError()
    setIsDeleteModalOpen(true)
  }

  const handleDeleteCommune = async () => {
    if (!selectedCommune) return
    try {
      await deleteCommune(selectedCommune.id)
      toggleDeleteModal()
      setSuccessMessage("Commune supprimée avec succès.")
    } catch (requestError) {
      // L'erreur API est affichée dans le modal.
    }
  }

  const getVilleLabel = Commune => {
    const Ville = Villes.find(item => String(item.id) === String(getVilleId(Commune)))
    return Ville ? Ville.labele : "-"
  }

  const columns = useMemo(() => [
    { name: "ID", selector: "id", sortable: true, width: "110px" },
    {
      name: "Commune",
      selector: "labele",
      sortable: true,
      cell: row => <span className="d-flex align-items-center"><MapPin size={16} className="text-primary mr-50" />{row.labele}</span>
    },
    {
      name: "Ville",
      selector: row => getVilleLabel(row),
      sortable: true,
      cell: row => getVilleLabel(row)
    },
    {
      name: "Actions",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "120px",
      cell: row => (
        <div className="actions d-flex align-items-center">
          <Button.Ripple color="flat-primary" className="btn-icon p-0 mr-50" title={`Modifier ${row.labele}`} aria-label={`Modifier ${row.labele}`} onClick={() => handleEditClick(row)}>
            <Edit2 size={17} />
          </Button.Ripple>
          <Button.Ripple color="flat-danger" className="btn-icon p-0" title={`Supprimer ${row.labele}`} aria-label={`Supprimer ${row.labele}`} onClick={() => handleDeleteClick(row)}>
            <Trash2 size={17} />
          </Button.Ripple>
        </div>
      )
    }
  ], [Villes])

  const filteredCommunes = Communes.filter(Commune => {
    const searchValue = search.toLowerCase()
    return String(Commune.id).includes(searchValue) || (Commune.labele || "").toLowerCase().includes(searchValue) || getVilleLabel(Commune).toLowerCase().includes(searchValue)
  })

  const VilleOptions = (value, setValue, disabled) => (
    <Input type="select" value={value} onChange={event => setValue(event.target.value)} disabled={disabled}>
      <option value="">{VillesLoading ? "Chargement des Villes..." : "Sélectionner une Ville"}</option>
      {Villes.map(Ville => <option key={Ville.id} value={Ville.id}>{Ville.labele}</option>)}
    </Input>
  )

  return (
    <Card>
      <CardHeader className="d-flex flex-wrap justify-content-between align-items-center">
        <CardTitle tag="h4">Liste des Communes</CardTitle>
        <div className="d-flex align-items-center mt-1 mt-sm-0">
          <Button.Ripple color="primary" size="sm" className="mr-50" onClick={toggleCreateModal}><Plus size={15} className="mr-50" />Ajouter</Button.Ripple>
          <Button.Ripple color="primary" outline size="sm" onClick={fetchCommunes} disabled={loading}><RefreshCw size={15} className="mr-50" />Actualiser</Button.Ripple>
        </div>
      </CardHeader>
      <CardBody>
        {successMessage ? <Alert color="success" toggle={() => setSuccessMessage("")}>{successMessage}</Alert> : null}
        {error ? <Alert color="danger">{error}</Alert> : null}
        <div className="d-flex justify-content-end mb-1"><div className="position-relative has-icon-left col-12 col-md-4 px-0">
          <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher une Commune" />
          <div className="form-control-position"><Search size={15} /></div>
        </div></div>
        <DataTable data={filteredCommunes} columns={columns} noHeader pagination progressPending={loading} progressComponent={<Spinner color="primary" className="my-2" />} noDataComponent="Aucune Commune trouvée." />
      </CardBody>

      <Modal isOpen={isCreateModalOpen} toggle={toggleCreateModal} centered>
        <Form onSubmit={handleCreateCommune}>
          <ModalHeader toggle={toggleCreateModal}>Ajouter une Commune</ModalHeader>
          <ModalBody>
            {formError || createError ? <Alert color="danger">{formError || createError}</Alert> : null}
            <FormGroup><Label for="Commune-labele">Libellé <span className="text-danger">*</span></Label><Input id="Commune-labele" value={labele} onChange={event => { setLabele(event.target.value); setFormError("") }} placeholder="Ex. Kinshasa" invalid={Boolean(formError)} autoFocus /></FormGroup>
            <FormGroup><Label for="Commune-Ville">Ville <span className="text-danger">*</span></Label>{VilleOptions(VilleId, value => { setVilleId(value); setFormError("") }, VillesLoading)}{formError ? <FormFeedback className="d-block">{formError}</FormFeedback> : null}</FormGroup>
          </ModalBody>
          <ModalFooter><Button color="secondary" outline type="button" onClick={toggleCreateModal} disabled={creating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={creating || VillesLoading}>{creating ? <Spinner size="sm" className="mr-50" /> : <Plus size={15} className="mr-50" />}Enregistrer</Button.Ripple></ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={isEditModalOpen} toggle={toggleEditModal} centered>
        <Form onSubmit={handleUpdateCommune}>
          <ModalHeader toggle={toggleEditModal}>Modifier une Commune</ModalHeader>
          <ModalBody>
            {editFormError || updateError ? <Alert color="danger">{editFormError || updateError}</Alert> : null}
            <FormGroup><Label for="Commune-edit-labele">Libellé <span className="text-danger">*</span></Label><Input id="Commune-edit-labele" value={editLabele} onChange={event => { setEditLabele(event.target.value); setEditFormError("") }} invalid={Boolean(editFormError)} autoFocus /></FormGroup>
            <FormGroup><Label for="Commune-edit-Ville">Ville <span className="text-danger">*</span></Label>{VilleOptions(editVilleId, value => { setEditVilleId(value); setEditFormError("") }, VillesLoading)}{editFormError ? <FormFeedback className="d-block">{editFormError}</FormFeedback> : null}</FormGroup>
          </ModalBody>
          <ModalFooter><Button color="secondary" outline type="button" onClick={toggleEditModal} disabled={updating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={updating || VillesLoading}>{updating ? <Spinner size="sm" className="mr-50" /> : <Edit2 size={15} className="mr-50" />}Modifier</Button.Ripple></ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} toggle={toggleDeleteModal} centered>
        <ModalHeader toggle={toggleDeleteModal}>Supprimer une Commune</ModalHeader>
        <ModalBody>{deleteError ? <Alert color="danger">{deleteError}</Alert> : null}Voulez-vous vraiment supprimer cette Commune ?</ModalBody>
        <ModalFooter><Button color="secondary" outline onClick={toggleDeleteModal} disabled={deleting}>Annuler</Button><Button.Ripple color="danger" onClick={handleDeleteCommune} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-50" /> : <Trash2 size={15} className="mr-50" />}Supprimer</Button.Ripple></ModalFooter>
      </Modal>
    </Card>
  )
}

const Commune = () => <VilleProvider><CommuneProvider><CommuneTable /></CommuneProvider></VilleProvider>

export default Commune
