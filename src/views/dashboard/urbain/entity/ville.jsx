import React, { useMemo, useState } from "react"
import {
  Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, FormFeedback,
  FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner
} from "reactstrap"
import { Edit2, MapPin, Plus, RefreshCw, Search, Trash2 } from "react-feather"
import DataTable from "react-data-table-component"
import { ProvinceProvider, useProvinces } from "../../../../contexts/ProvinceContext"
import { VilleProvider, useVilles } from "../../../../contexts/VilleContext"
import { getUserId } from "../../../../utility/utlitaire"

const getProvinceId = ville => ville.Id_province ?? ville.id_province ?? ville.province_id

const VilleTable = () => {
  const {
    villes, loading, error, fetchVilles,
    createVille, creating, createError, clearCreateError,
    updateVille, updating, updateError, clearUpdateError,
    deleteVille, deleting, deleteError, clearDeleteError
  } = useVilles()
  const { provinces, loading: provincesLoading } = useProvinces()
  const [search, setSearch] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedVille, setSelectedVille] = useState(null)
  const [labele, setLabele] = useState("")
  const [provinceId, setProvinceId] = useState("")
  const [editLabele, setEditLabele] = useState("")
  const [editProvinceId, setEditProvinceId] = useState("")
  const [formError, setFormError] = useState("")
  const [editFormError, setEditFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const getCurrentUserId = () => Number(getUserId())

  const toggleCreateModal = () => {
    setIsCreateModalOpen(isOpen => !isOpen)
    setLabele("")
    setProvinceId("")
    setFormError("")
    clearCreateError()
  }

  const toggleEditModal = () => {
    setIsEditModalOpen(isOpen => !isOpen)
    setSelectedVille(null)
    setEditLabele("")
    setEditProvinceId("")
    setEditFormError("")
    clearUpdateError()
  }

  const toggleDeleteModal = () => {
    setIsDeleteModalOpen(isOpen => !isOpen)
    setSelectedVille(null)
    clearDeleteError()
  }

  const validateVille = (value, selectedProvinceId, setError) => {
    if (!value.trim()) {
      setError("Le libellé de la ville est obligatoire.")
      return false
    }
    if (!selectedProvinceId) {
      setError("Veuillez sélectionner une province.")
      return false
    }
    if (!getCurrentUserId()) {
      setError("Identifiant de l'utilisateur introuvable. Veuillez vous reconnecter.")
      return false
    }
    return true
  }

  const handleCreateVille = async event => {
    event.preventDefault()
    if (!validateVille(labele, provinceId, setFormError)) return
    setFormError("")
    try {
      await createVille({
        labele: labele.trim(),
        Id_province: Number(provinceId),
        Id_user_created_at: getCurrentUserId()
      })
      toggleCreateModal()
      setSuccessMessage("Ville créée avec succès.")
    } catch (requestError) {
      // L'erreur API est affichée dans le modal.
    }
  }

  const handleEditClick = ville => {
    setSelectedVille(ville)
    setEditLabele(ville.labele || "")
    setEditProvinceId(String(getProvinceId(ville) || ""))
    setEditFormError("")
    clearUpdateError()
    setIsEditModalOpen(true)
  }

  const handleUpdateVille = async event => {
    event.preventDefault()
    if (!selectedVille || !validateVille(editLabele, editProvinceId, setEditFormError)) return
    setEditFormError("")
    try {
      await updateVille(selectedVille.id, {
        labele: editLabele.trim(),
        Id_province: Number(editProvinceId),
        Id_user_created_at: getCurrentUserId()
      })
      toggleEditModal()
      setSuccessMessage("Ville modifiée avec succès.")
    } catch (requestError) {
      // L'erreur API est affichée dans le modal.
    }
  }

  const handleDeleteClick = ville => {
    setSelectedVille(ville)
    clearDeleteError()
    setIsDeleteModalOpen(true)
  }

  const handleDeleteVille = async () => {
    if (!selectedVille) return
    try {
      await deleteVille(selectedVille.id)
      toggleDeleteModal()
      setSuccessMessage("Ville supprimée avec succès.")
    } catch (requestError) {
      // L'erreur API est affichée dans le modal.
    }
  }

  const getProvinceLabel = ville => {
    const province = provinces.find(item => String(item.id) === String(getProvinceId(ville)))
    return province ? province.labele : "-"
  }

  const columns = useMemo(() => [
    { name: "ID", selector: "id", sortable: true, width: "110px" },
    {
      name: "Ville",
      selector: "labele",
      sortable: true,
      cell: row => <span className="d-flex align-items-center"><MapPin size={16} className="text-primary mr-50" />{row.labele}</span>
    },
    {
      name: "Province",
      selector: row => getProvinceLabel(row),
      sortable: true,
      cell: row => getProvinceLabel(row)
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
  ], [provinces])

  const filteredVilles = villes.filter(ville => {
    const searchValue = search.toLowerCase()
    return String(ville.id).includes(searchValue) || (ville.labele || "").toLowerCase().includes(searchValue) || getProvinceLabel(ville).toLowerCase().includes(searchValue)
  })

  const provinceOptions = (value, setValue, disabled) => (
    <Input type="select" value={value} onChange={event => setValue(event.target.value)} disabled={disabled}>
      <option value="">{provincesLoading ? "Chargement des provinces..." : "Sélectionner une province"}</option>
      {provinces.map(province => <option key={province.id} value={province.id}>{province.labele}</option>)}
    </Input>
  )

  return (
    <Card>
      <CardHeader className="d-flex flex-wrap justify-content-between align-items-center">
        <CardTitle tag="h4">Liste des villes</CardTitle>
        <div className="d-flex align-items-center mt-1 mt-sm-0">
          <Button.Ripple color="primary" size="sm" className="mr-50" onClick={toggleCreateModal}><Plus size={15} className="mr-50" />Ajouter</Button.Ripple>
          <Button.Ripple color="primary" outline size="sm" onClick={fetchVilles} disabled={loading}><RefreshCw size={15} className="mr-50" />Actualiser</Button.Ripple>
        </div>
      </CardHeader>
      <CardBody>
        {successMessage ? <Alert color="success" toggle={() => setSuccessMessage("")}>{successMessage}</Alert> : null}
        {error ? <Alert color="danger">{error}</Alert> : null}
        <div className="d-flex justify-content-end mb-1"><div className="position-relative has-icon-left col-12 col-md-4 px-0">
          <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher une ville" />
          <div className="form-control-position"><Search size={15} /></div>
        </div></div>
        <DataTable data={filteredVilles} columns={columns} noHeader pagination progressPending={loading} progressComponent={<Spinner color="primary" className="my-2" />} noDataComponent="Aucune ville trouvée." />
      </CardBody>

      <Modal isOpen={isCreateModalOpen} toggle={toggleCreateModal} centered>
        <Form onSubmit={handleCreateVille}>
          <ModalHeader toggle={toggleCreateModal}>Ajouter une ville</ModalHeader>
          <ModalBody>
            {formError || createError ? <Alert color="danger">{formError || createError}</Alert> : null}
            <FormGroup><Label for="ville-labele">Libellé <span className="text-danger">*</span></Label><Input id="ville-labele" value={labele} onChange={event => { setLabele(event.target.value); setFormError("") }} placeholder="Ex. Kinshasa" invalid={Boolean(formError)} autoFocus /></FormGroup>
            <FormGroup><Label for="ville-province">Province <span className="text-danger">*</span></Label>{provinceOptions(provinceId, value => { setProvinceId(value); setFormError("") }, provincesLoading)}{formError ? <FormFeedback className="d-block">{formError}</FormFeedback> : null}</FormGroup>
          </ModalBody>
          <ModalFooter><Button color="secondary" outline type="button" onClick={toggleCreateModal} disabled={creating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={creating || provincesLoading}>{creating ? <Spinner size="sm" className="mr-50" /> : <Plus size={15} className="mr-50" />}Enregistrer</Button.Ripple></ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={isEditModalOpen} toggle={toggleEditModal} centered>
        <Form onSubmit={handleUpdateVille}>
          <ModalHeader toggle={toggleEditModal}>Modifier une ville</ModalHeader>
          <ModalBody>
            {editFormError || updateError ? <Alert color="danger">{editFormError || updateError}</Alert> : null}
            <FormGroup><Label for="ville-edit-labele">Libellé <span className="text-danger">*</span></Label><Input id="ville-edit-labele" value={editLabele} onChange={event => { setEditLabele(event.target.value); setEditFormError("") }} invalid={Boolean(editFormError)} autoFocus /></FormGroup>
            <FormGroup><Label for="ville-edit-province">Province <span className="text-danger">*</span></Label>{provinceOptions(editProvinceId, value => { setEditProvinceId(value); setEditFormError("") }, provincesLoading)}{editFormError ? <FormFeedback className="d-block">{editFormError}</FormFeedback> : null}</FormGroup>
          </ModalBody>
          <ModalFooter><Button color="secondary" outline type="button" onClick={toggleEditModal} disabled={updating}>Annuler</Button><Button.Ripple color="primary" type="submit" disabled={updating || provincesLoading}>{updating ? <Spinner size="sm" className="mr-50" /> : <Edit2 size={15} className="mr-50" />}Modifier</Button.Ripple></ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} toggle={toggleDeleteModal} centered>
        <ModalHeader toggle={toggleDeleteModal}>Supprimer une ville</ModalHeader>
        <ModalBody>{deleteError ? <Alert color="danger">{deleteError}</Alert> : null}Voulez-vous vraiment supprimer cette ville ?</ModalBody>
        <ModalFooter><Button color="secondary" outline onClick={toggleDeleteModal} disabled={deleting}>Annuler</Button><Button.Ripple color="danger" onClick={handleDeleteVille} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-50" /> : <Trash2 size={15} className="mr-50" />}Supprimer</Button.Ripple></ModalFooter>
      </Modal>
    </Card>
  )
}

const Ville = () => <ProvinceProvider><VilleProvider><VilleTable /></VilleProvider></ProvinceProvider>

export default Ville
