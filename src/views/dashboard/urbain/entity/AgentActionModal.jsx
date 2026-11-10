import { getRoles } from "../../../../components/Api/RoleService"
import { formatApiError } from "../../../../utility/apiError"
import React, { useEffect, useRef, useState } from "react"
import { Alert, Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap"
import { getAgences } from "../../../../components/Api/AgenceService"


const AgentActionModal = ({ agent, action, submitAction, close, onSuccess }) => {
  const assignment = action === "assign"
  const maxAssignmentDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19)
  const [form, setForm] = useState({ id_agence: "", DateAffectation: "", login: String(agent.Telephone || ""), pwd: "", pwd_confirmation: "", status: "AG", role_id: "" })
  const [agencies, setAgencies] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [attempt, setAttempt] = useState(0)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  useEffect(() => {

    let active = true
    setLoading(true)
    setLoadError("")
    const request = assignment ? getAgences() : getRoles()
    request.then(data => { if (active) { if (assignment) setAgencies(data); else setRoles(data) } })
      .catch(e => { if (active) setLoadError(formatApiError(e)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [assignment, attempt])
  const update = name => event => {
    const value = event.target.value
    setForm(previous => ({ ...previous, [name]: value }))
  }
  const toggle = () => { if (!pending.current) close() }
  const submit = async event => {
    event.preventDefault()
    if (pending.current || loading || loadError) return
    if (!assignment && !roles.some(role => String(role.id) === String(form.role_id))) { setError("Sélectionnez un rôle disponible."); return }
    if (!assignment && form.pwd !== form.pwd_confirmation) { setError("Les mots de passe ne correspondent pas."); return }
    pending.current = true
    setSaving(true)
    setError("")
    let done = false
    try {
      await submitAction(agent.id, form)
      done = true
    } catch (e) {
      setError(formatApiError(e))
    } finally {
      pending.current = false
      setSaving(false)
    }
    if (done) onSuccess()
  }
  return <Modal className="urbain-dialog" isOpen centered toggle={toggle} backdrop={saving ? "static" : true} keyboard={!saving}>
    <Form onSubmit={submit}>
      <ModalHeader toggle={saving ? undefined : toggle}>{assignment ? "Affecter un agent" : "Créer un compte"}</ModalHeader>
      <ModalBody>
        <p><strong>{[agent.nom, agent.postnom, agent.prenom].filter(Boolean).join(" ")}</strong></p>
        {error && <Alert color="danger" style={{ whiteSpace: "pre-line" }}>{error}</Alert>}
        {!assignment && loading && <div role="status"><Spinner size="sm" /> Chargement des rôles...</div>}
        {!assignment && loadError && <Alert color="danger" style={{ whiteSpace: "pre-line" }}>{loadError} <Button type="button" size="sm" onClick={() => setAttempt(v => v + 1)}>Réessayer</Button></Alert>}
        {!assignment && !loading && !loadError && roles.length === 0 && <Alert color="info">Aucun rôle disponible. Ajoutez un rôle depuis Administration → Rôles, puis rouvrez ce formulaire.</Alert>}
        {assignment ? <>
          {loading && <div role="status"><Spinner size="sm" /> Chargement des agences...</div>}
          {loadError && <Alert color="danger">{loadError} <Button type="button" size="sm" onClick={() => setAttempt(v => v + 1)}>Réessayer</Button></Alert>}
          <FormGroup><Label for="assign-agency">Agence *</Label>
            <Input id="assign-agency" type="select" required value={form.id_agence} onChange={update("id_agence")} disabled={loading || saving || Boolean(loadError)}>
              <option value="">Sélectionner une agence</option>
              {agencies.map(agency => <option key={agency.id} value={agency.id}>{agency.nom}</option>)}
            </Input>
          </FormGroup>
          <FormGroup><Label for="assign-date">Date et heure d'affectation *</Label><Input id="assign-date" type="datetime-local" step="1" max={maxAssignmentDate} required value={form.DateAffectation} onChange={update("DateAffectation")} disabled={saving} /></FormGroup>
        </> : <>
          <FormGroup><Label for="account-login">Login *</Label><Input id="account-login" type="text" required autoComplete="off" value={form.login} onChange={update("login")} disabled={saving} /></FormGroup>
          <FormGroup><Label for="account-password">Mot de passe *</Label><Input id="account-password" type="password" required autoComplete="new-password" value={form.pwd} onChange={update("pwd")} disabled={saving} /></FormGroup>
          <FormGroup><Label for="account-confirm">Confirmer le mot de passe *</Label><Input id="account-confirm" type="password" required autoComplete="new-password" value={form.pwd_confirmation} onChange={update("pwd_confirmation")} disabled={saving} /></FormGroup>
          <FormGroup><Label for="account-role">Rôle *</Label><Input id="account-role" type="select" required value={form.role_id} onChange={update("role_id")} disabled={saving || loading || Boolean(loadError) || roles.length === 0}><option value="">Sélectionner un rôle</option>{roles.map(role => <option key={role.id} value={role.id}>{role.label}</option>)}</Input></FormGroup>
          <FormGroup><Label for="account-status">Statut *</Label><Input id="account-status" required value={form.status} onChange={update("status")} disabled={saving} /></FormGroup>
        </>}
      </ModalBody>
      <ModalFooter>
        <Button type="button" outline color="secondary" onClick={toggle} disabled={saving}>Annuler</Button>
        <Button type="submit" color="primary" disabled={saving || loading || Boolean(loadError) || (!assignment && roles.length === 0)}>{saving ? "Enregistrement..." : assignment ? "Affecter" : "Créer le compte"}</Button>
      </ModalFooter>
    </Form>
  </Modal>
}
export default AgentActionModal
