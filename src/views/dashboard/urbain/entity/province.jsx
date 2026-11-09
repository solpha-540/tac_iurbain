import SearchInput from "../../../../components/urbain/SearchInput"
import WorkspacePage from "../../../../components/urbain/WorkspacePage"
import React, { useMemo, useState } from "react"
import {
  Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, FormFeedback,
  FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner
} from "reactstrap"
import { Edit2, MapPin, Plus, RefreshCw, Search, Trash2 } from "react-feather"
import DataTable from "../../../../components/urbain/BusinessTable"
import { ProvinceProvider, useProvinces } from "../../../../contexts/ProvinceContext"
import { getUserId } from "../../../../utility/utlitaire"

const ProvinceTable = () => {
  const {
    provinces, loading, error, fetchProvinces,
    createProvince, creating, createError, clearCreateError,
    updateProvince, updating, updateError, clearUpdateError,
    deleteProvince, deleting, deleteError, clearDeleteError
  } = useProvinces()
  const [search, setSearch] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState(null)
  const [labele, setLabele] = useState("")
  const [editLabele, setEditLabele] = useState("")
  const [formError, setFormError] = useState("")
  const [editFormError, setEditFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const toggleCreateModal = () => {
    setIsCreateModalOpen(isOpen => !isOpen)
    setLabele("")
    setFormError("")
    clearCreateError()
  }

  const toggleEditModal = () => {
    setIsEditModalOpen(isOpen => !isOpen)
    setSelectedProvince(null)
    setEditLabele("")
    setEditFormError("")
    clearUpdateError()
  }

  const toggleDeleteModal = () => {
    setIsDeleteModalOpen(isOpen => !isOpen)
    setSelectedProvince(null)
    clearDeleteError()
  }

  const getCurrentUserId = () => Number(getUserId())

  const handleCreateProvince = async event => {
    event.preventDefault()
    const userId = getCurrentUserId()
    if (!labele.trim()) {
      setFormError("Le libellé de la province est obligatoire.")
      return
    }
    if (!userId) {
      setFormError("Identifiant de l'utilisateur introuvable. Veuillez vous reconnecter.")
      return
    }
    setFormError("")
    try {
      await createProvince({ labele: labele.trim(), Id_user_created_at: userId })
      toggleCreateModal()
      setSuccessMessage("Province créée avec succès.")
    } catch (requestError) {
      // L'erreur de l'API est affichée dans le modal.
    }
  }

  const handleEditClick = province => {
    setSelectedProvince(province)
    setEditLabele(province.labele || "")
    setEditFormError("")
    clearUpdateError()
    setIsEditModalOpen(true)
  }

  const handleUpdateProvince = async event => {
    event.preventDefault()
    const userId = getCurrentUserId()
    if (!editLabele.trim()) {
      setEditFormError("Le libellé de la province est obligatoire.")
      return
    }
    if (!userId || !selectedProvince) {
      setEditFormError("Identifiant de l'utilisateur ou de la province introuvable.")
      return
    }
    setEditFormError("")
    try {
      await updateProvince(selectedProvince.id, {
        labele: editLabele.trim(),
        Id_user_created_at: userId
      })
      toggleEditModal()
      setSuccessMessage("Province modifiée avec succès.")
    } catch (requestError) {
      // L'erreur de l'API est affichée dans le modal.
    }
  }

  const handleDeleteClick = province => {
    setSelectedProvince(province)
    clearDeleteError()
    setIsDeleteModalOpen(true)
  }

  const handleDeleteProvince = async () => {
    if (!selectedProvince) return
    try {
      await deleteProvince(selectedProvince.id)
      toggleDeleteModal()
      setSuccessMessage("Province supprimée avec succès.")
    } catch (requestError) {
      // L'erreur de l'API est affichée dans le modal.
    }
  }

  const columns = useMemo(
    () => [
      { name: "ID", selector: "id", sortable: true, width: "110px" },
      {
        name: "Province",
        selector: "labele",
        sortable: true,
        cell: row => <span className="d-flex align-items-center"><MapPin size={16} className="text-primary mr-50" />{row.labele}</span>
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
    ],
    [clearDeleteError, clearUpdateError]
  )

  const filteredProvinces = provinces.filter(province => {
    const searchValue = search.toLowerCase()
    return String(province.id).includes(searchValue) || (province.labele || "").toLowerCase().includes(searchValue)
  })

  return (
    <Card>
      <CardHeader className="d-flex flex-wrap justify-content-between align-items-center">
        <CardTitle tag="h4">Liste des provinces</CardTitle>
        <div className="d-flex align-items-center mt-1 mt-sm-0">
          <Button.Ripple color="primary" size="sm" className="mr-50" onClick={toggleCreateModal}><Plus size={15} className="mr-50" />Ajouter</Button.Ripple>
          <Button.Ripple color="primary" outline size="sm" onClick={fetchProvinces} disabled={loading}><RefreshCw size={15} className="mr-50" />Actualiser</Button.Ripple>
        </div>
      </CardHeader>
      <CardBody>
        {successMessage ? <Alert color="success" toggle={() => setSuccessMessage("")}>{successMessage}</Alert> : null}
        {error ? <Alert color="danger">{error}</Alert> : null}
        <div className="d-flex justify-content-end mb-1">
          <div className="position-relative has-icon-left col-12 col-md-4 px-0">
            <SearchInput value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher une province"  aria-label="Rechercher une province" />
            <div className="form-control-position"><Search size={15} /></div>
          </div>
        </div>
        <DataTable data={filteredProvinces} columns={columns} noHeader pagination progressPending={loading} progressComponent={<Spinner color="primary" className="my-2" />} noDataComponent="Aucune province trouvée." />
      </CardBody>

      <Modal isOpen={isCreateModalOpen} toggle={toggleCreateModal} centered className="urbain-dialog" >
        <Form onSubmit={handleCreateProvince}>
          <ModalHeader toggle={toggleCreateModal}>Ajouter une province</ModalHeader>
          <ModalBody>
            {formError || createError ? <Alert color="danger">{formError || createError}</Alert> : null}
            <FormGroup>
              <Label for="province-labele">Libellé <span className="text-danger">*</span></Label>
              <Input id="province-labele" value={labele} onChange={event => { setLabele(event.target.value); setFormError("") }} placeholder="Ex. Kasaï-Oriental" invalid={Boolean(formError)} autoFocus />
              {formError ? <FormFeedback>{formError}</FormFeedback> : null}
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" outline type="button" onClick={toggleCreateModal} disabled={creating}>Annuler</Button>
            <Button.Ripple color="primary" type="submit" disabled={creating}>{creating ? <Spinner size="sm" className="mr-50" /> : <Plus size={15} className="mr-50" />}Enregistrer</Button.Ripple>
          </ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={isEditModalOpen} toggle={toggleEditModal} centered className="urbain-dialog" >
        <Form onSubmit={handleUpdateProvince}>
          <ModalHeader toggle={toggleEditModal}>Modifier une province</ModalHeader>
          <ModalBody>
            {editFormError || updateError ? <Alert color="danger">{editFormError || updateError}</Alert> : null}
            <FormGroup>
              <Label for="province-edit-labele">Libellé <span className="text-danger">*</span></Label>
              <Input id="province-edit-labele" value={editLabele} onChange={event => { setEditLabele(event.target.value); setEditFormError("") }} invalid={Boolean(editFormError)} autoFocus />
              {editFormError ? <FormFeedback>{editFormError}</FormFeedback> : null}
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" outline type="button" onClick={toggleEditModal} disabled={updating}>Annuler</Button>
            <Button.Ripple color="primary" type="submit" disabled={updating}>{updating ? <Spinner size="sm" className="mr-50" /> : <Edit2 size={15} className="mr-50" />}Modifier</Button.Ripple>
          </ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} toggle={toggleDeleteModal} centered className="urbain-dialog" >
        <ModalHeader toggle={toggleDeleteModal}>Supprimer une province</ModalHeader>
        <ModalBody>
          {deleteError ? <Alert color="danger">{deleteError}</Alert> : null}
          Voulez-vous vraiment supprimer cette province ?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={toggleDeleteModal} disabled={deleting}>Annuler</Button>
          <Button.Ripple color="danger" onClick={handleDeleteProvince} disabled={deleting}>{deleting ? <Spinner size="sm" className="mr-50" /> : <Trash2 size={15} className="mr-50" />}Supprimer</Button.Ripple>
        </ModalFooter>
      </Modal>
    </Card>
  )
}

const Province = () => (
  <ProvinceProvider>
    <ProvinceTable />
  </ProvinceProvider>
)

const ProvinceWorkspace = () => <WorkspacePage title="Provinces" description="Organisez les provinces utilisées dans les adresses de votre réseau." category="Territoires" links={[{"label":"Villes","to":"/villes"},{"label":"Communes","to":"/communes"}]}><Province /></WorkspacePage>
export default ProvinceWorkspace
