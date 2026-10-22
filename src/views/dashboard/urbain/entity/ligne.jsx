import React, { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Spinner,
  TabContent,
  TabPane,
} from "reactstrap";
import {
  Edit2,
  Eye,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "react-feather";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import { LigneProvider, useLignes } from "../../../../contexts/LigneContext";
import { getUserId } from "../../../../utility/utlitaire";

const initialForm = {
  libele_ligne: "",
  PointDepart: "",
  PointArriver: "",
  parcours_ligne: "",
  status_lancement: "N",
  id_ligne_principal: "",
};
const LigneFields = ({
  values,
  setValues,
  errors,
  villes,
  principales,
  secondary,
  disabled,
}) => (
  <>
    {secondary && (
      <FormGroup>
        <Label>
          Ligne principale <span className="text-danger">*</span>
        </Label>
        <Input
          type="select"
          value={values.id_ligne_principal}
          onChange={(e) =>
            setValues({ ...values, id_ligne_principal: e.target.value })
          }
          invalid={Boolean(errors.id_ligne_principal)}
          disabled={disabled}
        >
          <option value="">Sélectionner une ligne principale</option>
          {principales.map((item) => (
            <option key={item.id} value={item.id}>
              {item.libele_ligne}
            </option>
          ))}
        </Input>
        {errors.id_ligne_principal && (
          <FormFeedback>{errors.id_ligne_principal}</FormFeedback>
        )}
      </FormGroup>
    )}
    <FormGroup>
      <Label>
        Libellé <span className="text-danger">*</span>
      </Label>
      <Input
        value={values.libele_ligne}
        onChange={(e) => setValues({ ...values, libele_ligne: e.target.value })}
        invalid={Boolean(errors.libele_ligne)}
        disabled={disabled}
      />
      {errors.libele_ligne && (
        <FormFeedback>{errors.libele_ligne}</FormFeedback>
      )}
    </FormGroup>
    <FormGroup>
      <Label>
        Ville de départ <span className="text-danger">*</span>
      </Label>
      <Input
        type="select"
        value={values.PointDepart}
        onChange={(e) => setValues({ ...values, PointDepart: e.target.value })}
        invalid={Boolean(errors.PointDepart)}
        disabled={disabled}
      >
        <option value="">Sélectionner une ville</option>
        {villes.map((v) => (
          <option key={v.id} value={v.id}>
            {v.labele}
          </option>
        ))}
      </Input>
      {errors.PointDepart && <FormFeedback>{errors.PointDepart}</FormFeedback>}
    </FormGroup>
    <FormGroup>
      <Label>
        Ville d’arrivée <span className="text-danger">*</span>
      </Label>
      <Input
        type="select"
        value={values.PointArriver}
        onChange={(e) => setValues({ ...values, PointArriver: e.target.value })}
        invalid={Boolean(errors.PointArriver)}
        disabled={disabled}
      >
        <option value="">Sélectionner une ville</option>
        {villes.map((v) => (
          <option key={v.id} value={v.id}>
            {v.labele}
          </option>
        ))}
      </Input>
      {errors.PointArriver && (
        <FormFeedback>{errors.PointArriver}</FormFeedback>
      )}
    </FormGroup>
    <FormGroup>
      <Label>Parcours</Label>
      <Input
        value={values.parcours_ligne}
        onChange={(e) =>
          setValues({ ...values, parcours_ligne: e.target.value })
        }
        disabled={disabled}
      />
    </FormGroup>
    <FormGroup>
      <Label>Statut</Label>
      <Input
        type="select"
        value={values.status_lancement}
        onChange={(e) =>
          setValues({ ...values, status_lancement: e.target.value })
        }
        disabled={disabled}
      >
        <option value="N">Non lancé</option>
        <option value="Y">Lancé</option>
      </Input>
    </FormGroup>
  </>
);

const LigneTable = () => {
  const ctx = useLignes();
  const [tab, setTab] = useState("principales"),
    [filterId, setFilterId] = useState(""),
    [search, setSearch] = useState("");
  const [modal, setModal] = useState(null),
    [selected, setSelected] = useState(null),
    [form, setForm] = useState(initialForm),
    [errors, setErrors] = useState({}),
    [success, setSuccess] = useState("");
  const isSecondary = tab === "secondaires";
  const rows = (
    isSecondary ? ctx.lignesSecondaires : ctx.lignesPrincipales
  ).filter(
    (item) =>
      (!filterId || String(item.id_ligne_principal) === filterId) &&
      [
        item.libele_ligne,
        item.nom_ville_depart,
        item.nom_ville_arrivee,
        item.parcours_ligne,
      ].some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
  );
  const city = (row, key, label) =>
    row[`nom_ville_${label}`] ||
    (ctx.villes.find((v) => String(v.id) === String(row[key])) || {}).labele ||
    "-";
  const validate = () => {
    const e = {};
    if (!form.libele_ligne.trim())
      e.libele_ligne = "Le libellé est obligatoire.";
    if (!form.PointDepart)
      e.PointDepart = "La ville de départ est obligatoire.";
    if (!form.PointArriver)
      e.PointArriver = "La ville d’arrivée est obligatoire.";
    if (isSecondary && !form.id_ligne_principal)
      e.id_ligne_principal = "La ligne principale est obligatoire.";
    if (!Number(getUserId())) e.user = "Identifiant utilisateur introuvable.";
    setErrors(e);
    return !Object.keys(e).length;
  };
  const payload = () => ({
    ...form,
    libele_ligne: form.libele_ligne.trim(),
    PointDepart: Number(form.PointDepart),
    PointArriver: Number(form.PointArriver),
    ...(isSecondary
      ? { id_ligne_principal: Number(form.id_ligne_principal) }
      : {}),
    Id_user_created_at: Number(getUserId()),
  });
  const openCreate = () => {
    setSelected(null);
    setForm({ ...initialForm, id_ligne_principal: filterId });
    setErrors({});
    ctx.clearActionError();
    setModal("form");
  };
  const openEdit = (row) => {
    setSelected(row);
    setForm({
      libele_ligne: row.libele_ligne || "",
      PointDepart: String(row.PointDepart || ""),
      PointArriver: String(row.PointArriver || ""),
      parcours_ligne: row.parcours_ligne || "",
      status_lancement: row.status_lancement || "N",
      id_ligne_principal: String(row.id_ligne_principal || ""),
    });
    setErrors({});
    ctx.clearActionError();
    setModal("form");
  };
  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (selected)
        await (isSecondary
          ? ctx.updateLigneSecondaire(selected.id, payload())
          : ctx.updateLignePrincipale(selected.id, payload()));
      else
        await (isSecondary
          ? ctx.createLigneSecondaire(payload())
          : ctx.createLignePrincipale(payload()));
      setSuccess(
        selected ? "Ligne modifiée avec succès." : "Ligne créée avec succès.",
      );
      setModal(null);
    } catch (_) {}
  };
  const remove = async () => {
    try {
      await (isSecondary
        ? ctx.deleteLigneSecondaire(selected.id)
        : ctx.deleteLignePrincipale(selected.id));
      setSuccess("Ligne supprimée avec succès.");
      setModal(null);
    } catch (_) {}
  };
  const columns = useMemo(
    () => [
      {
        name: "Libellé de la ligne",
        selector: "libele_ligne",
        sortable: true,
        minWidth: "250px",
        cell: (r) => (
          <span className="d-flex align-items-center font-weight-bold text-primary font-medium-2">
            <MapPin size={18} className="mr-50" />
            {r.libele_ligne || "-"}
          </span>
        ),
      },
      ...(isSecondary
        ? [
            {
              name: "Ligne principale",
              selector: "libele_ligne_principale",
              sortable: true,
              minWidth: "220px",
              cell: (r) => (
                <span className="font-weight-bold">
                  {r.libele_ligne_principale ||
                    (
                      ctx.lignesPrincipales.find(
                        (p) => String(p.id) === String(r.id_ligne_principal),
                      ) || {}
                    ).libele_ligne ||
                    "-"}
                </span>
              ),
            },
          ]
        : []),
      { name: "Départ", cell: (r) => city(r, "PointDepart", "depart") },
      { name: "Arrivée", cell: (r) => city(r, "PointArriver", "arrivee") },
      {
        name: "Parcours",
        selector: "parcours_ligne",
        cell: (r) => r.parcours_ligne || "-",
      },
      {
        name: "Statut",
        cell: (r) => (
          <Badge color={r.status_lancement === "Y" ? "success" : "secondary"}>
            {r.status_lancement === "Y" ? "Lancé" : "Non lancé"}
          </Badge>
        ),
      },
      {
        name: "Créée le",
        selector: "created_at",
        cell: (r) => r.created_at || "-",
      },
      {
        name: "Actions",
        button: true,
        width: isSecondary ? "110px" : "150px",
        cell: (r) => (
          <div>
            <Button.Ripple
              color="flat-primary"
              className="btn-icon p-0 mr-50"
              onClick={() => openEdit(r)}
            >
              <Edit2 size={17} />
            </Button.Ripple>
            {!isSecondary && (
              <Button.Ripple
                color="flat-info"
                className="btn-icon p-0 mr-50"
                onClick={() => {
                  setFilterId(String(r.id));
                  setTab("secondaires");
                }}
                title="Voir les secondaires"
              >
                <Eye size={17} />
              </Button.Ripple>
            )}
            <Button.Ripple
              color="flat-danger"
              className="btn-icon p-0"
              onClick={() => {
                setSelected(r);
                ctx.clearActionError();
                setModal("delete");
              }}
            >
              <Trash2 size={17} />
            </Button.Ripple>
          </div>
        ),
      },
    ],
    [isSecondary, ctx.lignesPrincipales, ctx.villes],
  );
  return (
    <Card>
      <CardHeader className="d-flex flex-wrap justify-content-between">
        <CardTitle tag="h4">Gestion des lignes</CardTitle>
        <div>
          <Button.Ripple
            color="primary"
            size="sm"
            className="mr-50"
            onClick={openCreate}
          >
            <Plus size={15} className="mr-50" />
            Ajouter
          </Button.Ripple>
          <Button.Ripple
            color="primary"
            outline
            size="sm"
            className="mr-50"
            tag={Link}
            to="/prixlignes"
          >
            Tarification
          </Button.Ripple>
          <Button.Ripple
            color="primary"
            outline
            size="sm"
            onClick={ctx.fetchData}
            disabled={ctx.loading}
          >
            <RefreshCw size={15} className="mr-50" />
            Actualiser
          </Button.Ripple>
        </div>
      </CardHeader>
      <CardBody>
        {success && (
          <Alert color="success" toggle={() => setSuccess("")}>
            {success}
          </Alert>
        )}
        {ctx.error && <Alert color="danger">{ctx.error}</Alert>}
        <Nav tabs>
          <NavItem>
            <NavLink
              className={tab === "principales" ? "active" : ""}
              onClick={() => {
                setTab("principales");
                setFilterId("");
              }}
            >
              Lignes principales
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={tab === "secondaires" ? "active" : ""}
              onClick={() => setTab("secondaires")}
            >
              Lignes secondaires
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={tab} className="pt-2">
          <TabPane tabId={tab}>
            {isSecondary && (
              <FormGroup className="col-md-5 px-0">
                <Label>Filtrer par ligne principale</Label>
                <Input
                  type="select"
                  value={filterId}
                  onChange={(e) => setFilterId(e.target.value)}
                >
                  <option value="">Toutes les lignes principales</option>
                  {ctx.lignesPrincipales.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.libele_ligne}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            )}
            <div className="position-relative has-icon-left col-12 col-md-4 px-0 ml-auto mb-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une ligne"
              />
              <div className="form-control-position">
                <Search size={15} />
              </div>
            </div>
            <DataTable
              data={rows}
              columns={columns}
              noHeader
              pagination
              progressPending={ctx.loading}
              progressComponent={<Spinner color="primary" className="my-2" />}
              noDataComponent="Aucune ligne trouvée."
            />
          </TabPane>
        </TabContent>
      </CardBody>
      <Modal isOpen={modal === "form"} toggle={() => setModal(null)} centered>
        <Form onSubmit={save}>
          <ModalHeader toggle={() => setModal(null)}>
            {selected ? "Modifier" : "Ajouter"} une ligne{" "}
            {isSecondary ? "secondaire" : "principale"}
          </ModalHeader>
          <ModalBody>
            {(errors.user || ctx.actionError) && (
              <Alert color="danger">{errors.user || ctx.actionError}</Alert>
            )}
            <LigneFields
              values={form}
              setValues={setForm}
              errors={errors}
              villes={ctx.villes}
              principales={ctx.lignesPrincipales}
              secondary={isSecondary}
              disabled={ctx.saving}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" outline onClick={() => setModal(null)}>
              Annuler
            </Button>
            <Button color="primary" type="submit" disabled={ctx.saving}>
              {ctx.saving ? <Spinner size="sm" /> : "Enregistrer"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
      <Modal isOpen={modal === "delete"} toggle={() => setModal(null)} centered>
        <ModalHeader toggle={() => setModal(null)}>
          Supprimer une ligne
        </ModalHeader>
        <ModalBody>
          {ctx.actionError && <Alert color="danger">{ctx.actionError}</Alert>}
          Voulez-vous vraiment supprimer la ligne{" "}
          {selected && selected.libele_ligne} ?
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            outline
            onClick={() => setModal(null)}
            disabled={ctx.saving}
          >
            Annuler
          </Button>
          <Button color="danger" onClick={remove} disabled={ctx.saving}>
            {ctx.saving ? <Spinner size="sm" /> : "Supprimer"}
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};
export default () => (
  <LigneProvider>
    <LigneTable />
  </LigneProvider>
);
