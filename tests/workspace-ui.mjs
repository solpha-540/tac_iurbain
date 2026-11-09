import assert from "node:assert/strict"
import React from "react"
import ReactDOMServer from "react-dom/server.js"
const { renderToStaticMarkup } = ReactDOMServer
import { MemoryRouter } from "react-router-dom"
import { createServer } from "vite"
import { build } from "esbuild"
import { compile } from "sass"

const server = await createServer({ configFile: false, logLevel: "silent", server: { middlewareMode: true } })
try {
  const { default: WorkspacePage } = await server.ssrLoadModule("/src/components/urbain/WorkspacePage.jsx")
  const { default: SearchInput } = await server.ssrLoadModule("/src/components/urbain/SearchInput.jsx")
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(WorkspacePage, {
    title: "Agences", description: "Gestion du reseau", category: "Reseau",
    links: [{ to: "/lignes", label: "Lignes" }]
  }, React.createElement("p", null, "Contenu metier"))))
  assert.ok(html.includes("<h1>Agences</h1>"))
  assert.ok(html.includes('href="/lignes"'))
  assert.ok(html.includes("Contenu metier"))
  let value = "test"
  const field = SearchInput({ value, onChange: event => { value = event.target.value } })
  const button = field.props.children[1]
  assert.equal(button.props.type, "button")
  assert.equal(button.props["aria-label"], "Effacer la recherche")
  button.props.onClick()
  assert.equal(value, "")
  const blank = renderToStaticMarkup(React.createElement(SearchInput, {value:"", onChange() {}, "aria-label":"Recherche"}))
  assert.ok(!blank.includes("<button"))
  assert.ok(blank.includes('aria-label="Recherche"'))
  const disabled = renderToStaticMarkup(React.createElement(SearchInput, {value:"test", onChange() {}, disabled:true}))
  assert.ok(disabled.includes('disabled=""'))
  console.log("PASS: page accessible, liens contextuels et recherche effacable sans soumission.")
} finally {
  await server.close()
}
const files = ["agence","ligne","prix_ligne","booking","province","ville","commune","currency","service","operateur","typeColis"]
await build({
  entryPoints: files.map(name => "src/views/dashboard/urbain/entity/" + name + ".jsx"),
  outdir: "unused-ui-output", bundle:true, write:false, packages:"external", format:"esm",
  loader:{".js":"jsx"}, external:["*.scss","*.css"], logLevel:"error"
})
const css = compile("src/assets/scss/pages/urbain-workspace.scss").css
assert.ok(css.includes(".dark-layout"))
assert.ok(css.includes("@media"))
console.log("PASS: compilation des 11 interfaces et des styles responsive/mode sombre.")
