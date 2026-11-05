import assert from "node:assert/strict"
import { createServer as createHttpServer } from "node:http"
import { createServer } from "vite"
import viteConfig from "../vite.config.mjs"

const requests = []
const upstream = createHttpServer((req, res) => {
  let body = ""
  req.on("data", chunk => { body += chunk })
  req.on("end", () => {
    requests.push({ url: req.url, method: req.method, auth: req.headers.authorizations, body })
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ code: 200, data: [] }))
  })
})
await new Promise(resolve => upstream.listen(0, "127.0.0.1", resolve))
const target = "http://127.0.0.1:" + upstream.address().port
process.env.VITE_URBAIN_BASE_URL = target + "/urbain/api/v1/"
process.env.VITE_KISALU_BASE_URL = target + "/kisalu/api/v1/"
let server
try {
  const config = viteConfig({ mode: "test", command: "serve" })
  server = await createServer({
    ...config,
    configFile: false,
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { ...config.server, port: 0, host: "127.0.0.1", strictPort: false }
  })
  await server.listen()
  const origin = "http://127.0.0.1:" + server.httpServer.address().port
  const login = await fetch(origin + "/api-urbain/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: "test-only", pwd: "test-only" })
  })
  assert.equal(login.status, 200)
  assert.deepEqual(requests[0], {
    url: "/urbain/api/v1/auth/login", method: "POST", auth: undefined,
    body: JSON.stringify({ login: "test-only", pwd: "test-only" })
  })
  const agents = await fetch(origin + "/api-kisalu/agent/ListeAgent?page=1", {
    headers: { Authorizations: "tac kisalu-test" }
  })
  assert.equal(agents.status, 200)
  assert.equal(requests[1].url, "/kisalu/api/v1/agent/ListeAgent?page=1")
  assert.equal(requests[1].auth, "tac kisalu-test")
  await fetch(origin + "/api-urbain/resource/agencies", {
    headers: { Authorizations: "tac urbain-test" }
  })
  assert.equal(requests[2].url, "/urbain/api/v1/resource/agencies")
  assert.equal(requests[2].auth, "tac urbain-test")
  console.log("PASS: proxy Vite, POST JSON, chemins des deux API et headers séparés.")
} finally {
  if (server) await server.close()
  await new Promise(resolve => upstream.close(resolve))
}
