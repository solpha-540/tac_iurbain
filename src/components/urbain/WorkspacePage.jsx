import React from "react"
import { NavLink } from "react-router-dom"
import { ArrowUpRight } from "react-feather"

const WorkspacePage = ({ title, description, category = "Gestion", links = [], children }) => (
  <section className="workspace-page" aria-label={title}>
    <header className="workspace-page-heading">
      <div>
        <span className="workspace-eyebrow">Inter-urbain / {category}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {links.length > 0 && <nav className="workspace-shortcuts" aria-label={"Pages liées à " + title}>
        {links.map(link => <NavLink key={link.to} to={link.to}>{link.label}<ArrowUpRight size={14} aria-hidden="true" /></NavLink>)}
      </nav>}
    </header>
    {children}
  </section>
)
export default WorkspacePage
