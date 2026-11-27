import assert from "node:assert/strict"
import axios, { AxiosError } from "axios"
import { createServer } from "vite"

Object.assign(process.env, {
  VITE_URBAIN_BASE_URL: "https://urbain.test/api/v1",
  VITE_KISALU_BASE_URL: "https://kisalu.test/api/v1",
  VITE_KISALU_LOGIN: "technical-test-account",
  VITE_KISALU_PWD: "test-only-password",
  VITE_URBAIN_REFRESH_PATH: "/test-refresh",
  VITE_URBAIN_REFRESH_TOKEN_FIELD: "refresh_token"
})
const values = new Map()
globalThis.window = {
  localStorage: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  }
}
let handler
const originalAdapter = axios.defaults.adapter
axios.defaults.adapter = config => handler(config)
const redirects = []
globalThis.__authTestRedirects = redirects
const server = await createServer({
  configFile: false,
  logLevel: "silent",
  server: { middlewareMode: true },
  plugins: [{
    name: "test-history",
    enforce: "pre",
    resolveId(id) { if (id === "../../history") return "\0test-history" },
    load(id) {
      if (id === "\0test-history") return "export const history = { replace: path => globalThis.__authTestRedirects.push(path), push() {} }"
    }
  }]
})
const response = (config, data) => ({ config, data, status: 200, statusText: "OK", headers: {} })
const unauthorized = config => {
  throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, {
    config, data: {}, status: 401, statusText: "Unauthorized", headers: {}
  })
}
const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}
try {
  const tokens = await server.ssrLoadModule("/src/services/auth/tokenStorage.js")
  const { login } = await server.ssrLoadModule("/src/services/auth/urbainAuth.js")
  const { ensureKisaluToken } = await server.ssrLoadModule("/src/services/auth/kisaluAuth.js")
  const { default: urbain } = await server.ssrLoadModule("/src/services/api/urbainApi.js")
  const { getAgents } = await server.ssrLoadModule("/src/components/Api/AgentService.js")
  const { endSession } = await server.ssrLoadModule("/src/services/auth/session.js")
  const reset = () => { tokens.clearUrbainTokens(); tokens.clearKisaluTokens(); redirects.length = 0 }
  const seed = () => tokens.setUrbainTokens({ access_token: "urbain-old", refresh_token: "urbain-refresh" })

  reset()
  let logins = 0
  handler = async config => {
    if (config.url === "/auth/login") {
      assert.deepEqual(JSON.parse(config.data), { login: "123", pwd: "user-test-password" })
      assert.equal(config.headers.get("Authorizations"), undefined)
      return response(config, { data: { access_token: "urbain-old", refresh_token: "urbain-refresh", user: { id: 1 }, agent: {}, agency: {} } })
    }
    if (config.url === "/user/agent") {
      logins++
      assert.equal(config.baseURL, "https://kisalu.test/api/v1")
      assert.equal(typeof JSON.parse(config.data).login, "string")
      assert.equal(config.headers.get("Authorizations"), undefined)
      await new Promise(resolve => setTimeout(resolve, 10))
      return response(config, { token: { access: "kisalu-old", refresh: "kisalu-refresh" } })
    }
    if (config.url === "/agent/ListeAgent") {
      assert.equal(config.headers.get("Authorizations"), "tac kisalu-old")
      return response(config, { code: 200, data: [{ id: 2 }] })
    }
    assert.equal(config.baseURL, "https://urbain.test/api/v1")
    assert.equal(config.headers.get("Authorizations"), "tac urbain-old")
    return response(config, {})
  }
  await login(123, "user-test-password")
  assert.equal(logins, 0)
  assert.deepEqual(await Promise.all([getAgents(), getAgents(), getAgents()]), [[{ id: 2 }], [{ id: 2 }], [{ id: 2 }]])
  assert.equal(logins, 1)
  await urbain.get("/resource/agencies")
  assert.equal(tokens.getUrbainToken(), "urbain-old")
  console.log("PASS: connexion utilisateur, isolation des tokens et login Kisalu partagé")

  const { login: loginReducer } = await server.ssrLoadModule("/src/redux/reducers/auth/loginReducer.js")
  const { AGENCY_MANAGER } = await server.ssrLoadModule("/src/services/auth/roles.js")
  const { getPrixCargos, createPrixCargo } = await server.ssrLoadModule("/src/components/Api/Prix_cargoService.js")
  assert.equal(loginReducer(undefined, { type: "INIT" }).userRole, "admin")
  await assert.rejects(getPrixCargos, /chef d.agence/)
  await assert.rejects(() => createPrixCargo({}), /chef d.agence/)

  const tariff = { id: 8, id_agence: 1, id_ligne_principal: 11, id_ligne_secondaire: 15, prix_location: "600000.00" }
  handler = async config => {
    if (config.url === "/auth/login") {
      return response(config, { code: 200, data: {
        access_token: "agency-token",
        user: { id: 28, status: "AG", role: { id: 13, label: "CHEF D'AGENCE" } },
        agency: { id: 1, nom: "Agence test" }
      } })
    }
    assert.equal(config.url, "/resource/prix-locations")
    assert.equal(config.headers.get("Authorizations"), "tac agency-token")
    if (config.method === "get") {
      return response(config, { code: 200, data: { prix_locations: [tariff, { id: 9, agence: { id: 2 } }] } })
    }
    assert.equal(config.method, "post")
    const { id, ...expectedPayload } = tariff
    assert.deepEqual(JSON.parse(config.data), expectedPayload)
    return response(config, { code: 201, data: { prix_location: tariff } })
  }
  const agencySession = await login("agency-test", "test-only-password")
  const restored = loginReducer(undefined, { type: "INIT" })
  assert.equal(restored.userRole, AGENCY_MANAGER)
  assert.deepEqual(restored.values.agency, agencySession.agency)
  assert.deepEqual(await getPrixCargos(), [tariff])
  const { id, ...tariffPayload } = tariff
  assert.deepEqual(await createPrixCargo({ ...tariffPayload, id_agence: 2 }), tariff)
  console.log("PASS: restauration du rôle et tarifs limités à l’agence de la session")

  const { getBuses } = await server.ssrLoadModule("/src/components/Api/busService.js")
  const { getSoutes, createSoute } = await server.ssrLoadModule("/src/components/Api/soutesService.js")
  const { default: kisalu } = await server.ssrLoadModule("/src/services/api/kisaluApi.js")
  const bus = { id: 27, num_bus: "12BB11", marque: "NISSAN", service: { libelle: "SERVICE INTERURBAIN" } }
  const souteFields = { id_bus: 27, code: "ARR-D12", libelle: "Soute arrière droite" }
  const soute = { id: 3, status: "ACTIVE", ...souteFields }
  tokens.setKisaluTokens({ access: "kisalu-bus", expires_in: 3600 })
  handler = async config => {
    if (config.url === "/bus/get") {
      assert.equal(config.method, "get")
      assert.equal(config.headers.get("Authorizations"), "tac kisalu-bus")
      return response(config, { code: 200, data: [bus] })
    }
    assert.equal(config.url, "/resource/soutes")
    assert.equal(config.headers.get("Authorizations"), "tac agency-token")
    if (config.method === "get") {
      assert.deepEqual(config.params, { id_bus: bus.id })
      return response(config, { code: 200, data: [soute] })
    }
    assert.equal(config.method, "post")
    assert.deepEqual(JSON.parse(config.data), souteFields)
    return response(config, { code: 201, data: soute })
  }
  assert.deepEqual(await getBuses(), [bus])
  assert.deepEqual(await getSoutes(bus.id), [soute])
  assert.deepEqual(await createSoute(soute), soute)
  await assert.rejects(() => kisalu.post("/bus/get"), /réservé/)
  console.log("PASS: bus Kisalu et lecture et création des soutes Inter-urbain")

  reset(); seed()
  tokens.setKisaluTokens({ access: "kisalu-old" })
  logins = 0
  let agentCalls = 0
  handler = async config => {
    if (config.url === "/user/agent") {
      logins++
      await new Promise(resolve => setTimeout(resolve, 10))
      return response(config, { token: { access: "kisalu-new" } })
    }
    agentCalls++
    if (config.headers.get("Authorizations") === "tac kisalu-old") return unauthorized(config)
    assert.equal(config.headers.get("Authorizations"), "tac kisalu-new")
    return response(config, { code: 200, data: [] })
  }
  await Promise.all([getAgents(), getAgents(), getAgents()])
  assert.equal(logins, 1)
  assert.equal(agentCalls, 6)
  assert.equal(tokens.getUrbainToken(), "urbain-old")
  assert.equal(redirects.length, 0)
  console.log("PASS: 401 Kisalu concurrents, une reconnexion et session utilisateur conservée")

  reset(); seed()
  let refreshes = 0
  handler = async config => {
    if (config.url === "/test-refresh") {
      refreshes++
      assert.deepEqual(JSON.parse(config.data), { refresh_token: "urbain-refresh" })
      await new Promise(resolve => setTimeout(resolve, 10))
      return response(config, { data: { access_token: "urbain-new", refresh_token: "urbain-refresh-new" } })
    }
    if (config.headers.get("Authorizations") === "tac urbain-old") return unauthorized(config)
    assert.equal(config.headers.get("Authorizations"), "tac urbain-new")
    return response(config, {})
  }
  await Promise.all([urbain.get("/resource/a"), urbain.get("/resource/b"), urbain.get("/resource/c")])
  assert.equal(refreshes, 1)
  assert.equal(tokens.getUrbainRefreshToken(), "urbain-refresh-new")
  console.log("PASS: refresh Inter-urbain partagé et rotation des tokens")

  reset(); seed(); tokens.setKisaluTokens({ access: "kisalu-old" })
  logins = 0; agentCalls = 0
  handler = async config => {
    if (config.url === "/user/agent") { logins++; return response(config, { token: { access: "kisalu-new" } }) }
    agentCalls++
    return unauthorized(config)
  }
  await assert.rejects(getAgents())
  assert.equal(logins, 1)
  assert.equal(agentCalls, 2)
  assert.equal(tokens.getKisaluToken(), null)
  assert.equal(tokens.getUrbainToken(), "urbain-old")
  assert.equal(redirects.length, 0)
  console.log("PASS: refus Kisalu persistant sans boucle ni déconnexion utilisateur")

  reset(); seed()
  logins = 0
  handler = async config => { logins++; return unauthorized(config) }
  await assert.rejects(getAgents())
  assert.equal(logins, 1)
  assert.equal(tokens.getUrbainToken(), "urbain-old")
  console.log("PASS: identifiants Kisalu invalides, un seul essai")

  reset(); seed(); tokens.setKisaluTokens({ access: "kisalu-old" })
  refreshes = 0
  handler = async config => {
    if (config.url === "/test-refresh") refreshes++
    return unauthorized(config)
  }
  await assert.rejects(urbain.get("/resource/a"))
  assert.equal(refreshes, 1)
  assert.equal(tokens.getUrbainToken(), null)
  assert.equal(tokens.getKisaluToken(), null)
  assert.deepEqual(redirects, ["/pages/login"])
  console.log("PASS: échec du refresh, nettoyage des deux sessions et redirection")

  reset(); seed()
  const gate = deferred()
  const started = deferred()
  handler = async config => {
    started.resolve()
    await gate.promise
    return response(config, { token: { access: "too-late" } })
  }
  const pending = ensureKisaluToken()
  await started.promise
  endSession()
  gate.resolve()
  await assert.rejects(pending, /terminée/)
  assert.equal(tokens.getKisaluToken(), null)
  assert.equal(tokens.getUrbainToken(), null)
  console.log("PASS: logout pendant le login Kisalu, aucun token restauré")

  reset()
  tokens.setKisaluTokens({ access: "tac tac prefixed" })
  handler = async config => {
    assert.equal(config.headers.get("Authorizations"), "tac prefixed")
    return response(config, { code: 200, data: {} })
  }
  assert.deepEqual(await getAgents(), [])
  handler = async config => response(config, { code: 403, message: "Accès refusé" })
  await assert.rejects(getAgents(), /Accès refusé/)
  console.log("PASS: préfixe unique, tableau de repli et erreur métier")

  reset(); seed(); tokens.setKisaluTokens({ access: "kisalu-stable" })
  tokens.setKisaluTokens({ access: "kisalu-expired", expires_in: 0.001 })
  await new Promise(resolve => setTimeout(resolve, 5))
  logins = 0
  handler = async config => {
    if (config.url === "/user/agent") {
      logins++
      return response(config, { token: { access: "kisalu-valid", expires_in: 3600 } })
    }
    assert.equal(config.headers.get("Authorizations"), "tac kisalu-valid")
    return response(config, { data: [] })
  }
  await getAgents()
  assert.equal(logins, 1)
  assert.equal(tokens.getUrbainToken(), "urbain-old")
  console.log("PASS: expiration Kisalu détectée avant la requête")

  reset(); seed()
  refreshes = 0
  let resourceCalls = 0
  handler = async config => {
    if (config.url === "/test-refresh") {
      refreshes++
      return response(config, { data: { access_token: "also-rejected" } })
    }
    resourceCalls++
    return unauthorized(config)
  }
  await assert.rejects(urbain.get("/resource/a"))
  assert.equal(refreshes, 1)
  assert.equal(resourceCalls, 2)
  assert.deepEqual(redirects, ["/pages/login"])
  console.log("PASS: nouveau token Inter-urbain refusé, aucun refresh en boucle")

  reset(); seed()
  const refreshGate = deferred()
  const refreshStarted = deferred()
  handler = async config => {
    if (config.url === "/test-refresh") {
      refreshStarted.resolve()
      await refreshGate.promise
      return response(config, { data: { access_token: "late-urbain" } })
    }
    return unauthorized(config)
  }
  const pendingRefresh = urbain.get("/resource/a")
  await refreshStarted.promise
  endSession()
  refreshGate.resolve()
  await assert.rejects(pendingRefresh)
  assert.equal(tokens.getUrbainToken(), null)
  assert.equal(redirects.length, 1)
  console.log("PASS: logout pendant le refresh Inter-urbain, aucun token restauré")

  reset()
  handler = async config => response(config, { data: { user: {} } })
  await assert.rejects(login("test", "test-only"), /invalide/)
  assert.equal(tokens.getUrbainToken(), null)
  console.log("PASS: réponse de login sans token rejetée")


  reset(); seed()
  tokens.setKisaluTokens({ access: "kisalu-must-not-be-used" })
  const { getAllAgent } = await server.ssrLoadModule("/src/components/Api/Agent_urbainService.js")
  const agentFixture = { id: 1, nom: "Test", postnom: "Agent", Telephone: "000", service: null, role: null, account: null, agency: null, affectation: null }
  let urbainAgentCalls = 0
  handler = async config => {
    urbainAgentCalls++
    assert.equal(config.method, "get")
    assert.equal(config.url, "/resource/agents")
    assert.equal(config.baseURL, "https://urbain.test/api/v1")
    assert.equal(config.headers.get("Authorizations"), "tac urbain-old")
    return response(config, { code: 200, data: { agents: [agentFixture] } })
  }
  assert.deepEqual(await getAllAgent(), [agentFixture])
  assert.equal(urbainAgentCalls, 1)
  assert.equal(tokens.getKisaluToken(), "kisalu-must-not-be-used")
  for (const body of [{ code: 200, data: null }, { code: 200, data: { agents: {} } }, { code: 200 }]) {
    handler = async config => response(config, body)
    assert.deepEqual(await getAllAgent(), [])
  }
  handler = async config => response(config, { code: 403, message: "Liste interdite" })
  await assert.rejects(getAllAgent(), /Liste interdite/)
  handler = async () => { throw new Error("Erreur réseau simulée") }
  await assert.rejects(getAllAgent(), /Erreur réseau simulée/)
  console.log("PASS: agents Inter-urbain, data.agents, token isolé, valeurs nulles et erreurs")


  reset(); seed()
  tokens.setKisaluTokens({ access: "kisalu-source-only" })
  values.set("id_user_created", "9")
  const { createAgentUrbain } = await server.ssrLoadModule("/src/components/Api/Agent_urbainService.js")
  const { prefillKisaluAgent, matchesKisaluAgent, agentFormData } = await server.ssrLoadModule("/src/components/Api/agentUrbainForm.js")
  const kisaluFixture = {
    agentId: 88, nom: "Tést", postNom: "Exemple", prenom: "Agent",
    telephone_un: "+243 800 000 000", mail: "test@example.test", sexe: "M",
    dateNaissance: "1990-05-20T00:00:00.000Z", dateEmbauche: "01/02/2020",
    fonctionLibelle: "Agent", gradeLibelle: "Junior", serviceLibelle: "INTER-URBAIN",
    serviceRh_id: 900, serviceRh_id_direction: 999
  }
  assert.equal(matchesKisaluAgent(kisaluFixture, "test exemple"), true)
  assert.equal(matchesKisaluAgent(kisaluFixture, "agent"), true)
  assert.equal(matchesKisaluAgent(kisaluFixture, "243800000000"), true)
  assert.equal(matchesKisaluAgent(kisaluFixture, "absent"), false)
  const form = prefillKisaluAgent(kisaluFixture, [{ id: 2, libelle: "Inter-urbain" }])
  assert.equal(form.postnom, "Exemple")
  assert.equal(form.Telephone, "+243 800 000 000")
  assert.equal(form.DateNaissance, "1990-05-20")
  assert.equal(form.date_embauche, "2020-02-01")
  assert.equal(form.Id_service, "2")
  assert.equal(form.Id_direction, "")
  assert.equal(form.id_commune, "")
  assert.equal(prefillKisaluAgent(kisaluFixture).Id_service, "")
  assert.equal(prefillKisaluAgent(kisaluFixture, [{ id: 2, libelle: "Inter-urbain" }, { id: 3, libelle: "INTER-URBAIN" }]).Id_service, "")
  Object.assign(form, { lieuNaissance: "Ville test", id_commune: "3", Id_direction: "4" })
  const photo = new File(["test-image"], "test.png", { type: "image/png" })
  let creates = 0
  handler = async config => {
    creates++
    assert.equal(config.method, "post")
    assert.equal(config.url, "/resource/agents")
    assert.equal(config.headers.get("Authorizations"), "tac urbain-old")
    assert.ok(config.data instanceof FormData)
    assert.equal(config.data.get("Id_user_created_at"), "9")
    assert.equal(config.data.get("postnom"), "Exemple")
    assert.equal(config.data.get("Telephone"), "+243 800 000 000")
    assert.equal(config.data.get("Id_direction"), "4")
    assert.equal(config.data.get("Id_service"), "2")
    assert.equal(config.data.get("DateNaissance"), "1990-05-20 00:00:00")
    assert.equal(config.data.get("date_embauche"), "2020-02-01 00:00:00")
    assert.equal(config.data.get("photo").name, "test.png")
    assert.equal(config.data.has("agentId"), false)
    assert.equal(config.data.has("serviceRh_id"), false)
    return response(config, { code: 201, data: { agent: { id: 123 } } })
  }
  assert.equal((await createAgentUrbain(form, photo)).agent.id, 123)
  assert.equal(creates, 1)
  assert.equal(tokens.getKisaluToken(), "kisalu-source-only")
  assert.equal(agentFormData(form, "9").has("photo"), false)
  await assert.rejects(createAgentUrbain({ ...form, nom: "" }), /obligatoires/)
  values.delete("id_user_created")
  await assert.rejects(createAgentUrbain(form), /reconnecter/)
  assert.equal(creates, 1)
  values.set("id_user_created", "9")
  handler = async config => response(config, { code: 422, message: "Téléphone déjà utilisé", errors: { Telephone: ["Doublon"] } })
  await assert.rejects(createAgentUrbain(form), error => error.message.includes("déjà utilisé") && error.response.data.errors.Telephone[0] === "Doublon")
  console.log("PASS: recherche Kisalu, mapping des champs, références séparées et création multipart Inter-urbain")


  reset(); seed()
  tokens.setKisaluTokens({ access: "kisalu-not-for-actions" })
  const { assignAgentUrbain, createAgentAccount } = await server.ssrLoadModule("/src/components/Api/Agent_urbainService.js")
  let actionCalls = 0
  handler = async config => {
    actionCalls++
    assert.equal(config.method, "post")
    assert.equal(config.baseURL, "https://urbain.test/api/v1")
    assert.equal(config.headers.get("Authorizations"), "tac urbain-old")
    const payload = JSON.parse(config.data)
    if (config.url === "/resource/agent-affectations") {
      assert.deepEqual(payload, { Id_agent: 15, id_agence: 2, DateAffectation: "2026-10-29 08:00:00" })
      return response(config, { code: 201, data: { affectation: { id: 4 } } })
    }
    assert.equal(config.url, "/resource/agent-accounts")
    assert.deepEqual(payload, { agent_id: 15, login: "0812345605", pwd: "test-only-secret", pwd_confirmation: "test-only-secret", status: "AG", role_id: 6 })
    return response(config, { code: 201, data: { account: { id: 8 } } })
  }
  const assignment = { id_agence: "2", DateAffectation: "2026-10-29T08:00" }
  assert.equal((await assignAgentUrbain(15, assignment)).affectation.id, 4)
  assert.equal((await assignAgentUrbain(15, { ...assignment, DateAffectation: "2026-10-29T08:00:00" })).affectation.id, 4)
  const account = { login: "0812345605", pwd: "test-only-secret", pwd_confirmation: "test-only-secret", status: "AG", role_id: "6" }
  assert.equal((await createAgentAccount(15, account)).account.id, 8)
  assert.equal(actionCalls, 3)
  await assert.rejects(assignAgentUrbain(null, assignment))
  await assert.rejects(assignAgentUrbain(15, { ...assignment, id_agence: "" }))
  await assert.rejects(assignAgentUrbain(15, { ...assignment, DateAffectation: "" }))
  await assert.rejects(createAgentAccount(15, { ...account, pwd_confirmation: "different" }))
  await assert.rejects(createAgentAccount(15, { ...account, role_id: "" }))
  await assert.rejects(createAgentAccount(15, { ...account, login: "" }))
  assert.equal(actionCalls, 3)
  handler = async config => response(config, { code: 422, message: "Compte déjà existant", errors: { agent_id: ["Doublon"] } })
  await assert.rejects(createAgentAccount(15, account), e => e.message === "Compte déjà existant" && e.response.data.errors.agent_id[0] === "Doublon")
  handler = async config => response(config, { code: 403, message: "Affectation refusée" })
  await assert.rejects(assignAgentUrbain(15, assignment), /Affectation refusée/)
  assert.equal(tokens.getKisaluToken(), "kisalu-not-for-actions")
  assert.equal([...values.values()].some(value => value.includes("test-only-secret")), false)
  console.log("PASS: affectation et compte, payloads exacts, validation, erreurs et isolation Inter-urbain")


  const { formatApiError } = await server.ssrLoadModule("/src/utility/apiError.js")
  const validation = { response: { data: {
    code: 422, message: "Les donnees envoyees sont invalides.",
    error: { DateAffectation: ["Date future interdite."] }
  } } }
  assert.ok(formatApiError(validation).includes("Date d'affectation : Date future interdite."))
  await assert.rejects(assignAgentUrbain(15, { id_agence: "2", DateAffectation: "2999-01-01T12:00" }), /futur/)
  console.log("PASS: erreur API au singulier et blocage des affectations futures")


  reset(); seed()
  tokens.setKisaluTokens({ access: "kisalu-not-for-roles" })
  const { getRoles, createRole } = await server.ssrLoadModule("/src/components/Api/RoleService.js")
  const roleFixture = { id: 42, label: "CAISSIER" }
  for (const data of [[roleFixture], {roles:[roleFixture]}]) {
    handler = async config => {
      assert.equal(config.method, "get")
      assert.equal(config.url, "/resource/roles")
      assert.equal(config.baseURL, "https://urbain.test/api/v1")
      assert.equal(config.headers.get("Authorizations"), "tac urbain-old")
      return response(config, {code:200,data})
    }
    assert.deepEqual(await getRoles(), [roleFixture])
  }
  let rolePosts = 0
  handler = async config => {
    rolePosts++
    assert.equal(config.method, "post")
    assert.equal(config.url, "/resource/roles")
    assert.equal(config.headers.get("Authorizations"), "tac urbain-old")
    assert.deepEqual(JSON.parse(config.data), {label:"CAISSIER"})
    return response(config, {code:201,data:{role:roleFixture}})
  }
  assert.equal((await createRole(" CAISSIER ")).role.id, 42)
  await assert.rejects(createRole("  "), /obligatoire/)
  assert.equal(rolePosts, 1)
  handler = async config => response(config, {code:200,data:[]})
  assert.deepEqual(await getRoles(), [])
  handler = async config => response(config, {code:422,message:"Role deja existant",error:{label:["Doublon"]}})
  await assert.rejects(createRole("CAISSIER"), e => e.response.data.error.label[0] === "Doublon")
  await assert.rejects(getRoles(), /deja existant/)
  handler = async config => {
    assert.equal(config.url, "/resource/agent-accounts")
    assert.equal(JSON.parse(config.data).role_id, roleFixture.id)
    assert.equal(config.headers.get("Authorizations"), "tac urbain-old")
    return response(config, {code:201,data:{account:{id:100}}})
  }
  await createAgentAccount(15, {login:"test-role",pwd:"test-only",pwd_confirmation:"test-only",status:"AG",role_id:String(roleFixture.id)})
  assert.equal(tokens.getKisaluToken(), "kisalu-not-for-roles")
  console.log("PASS: GET/POST roles, erreurs, token Inter-urbain et role selectionne pour le compte")

} finally {
  axios.defaults.adapter = originalAdapter
  await server.close()
  delete globalThis.window
  delete globalThis.__authTestRedirects
}
