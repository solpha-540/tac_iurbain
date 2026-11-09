import React from "react"
import DataTable from "react-data-table-component"
import { Search } from "react-feather"
import { Spinner } from "reactstrap"

const BusinessTable = props => {
  const count = Array.isArray(props.data) ? props.data.length : 0
  const empty = props.noDataComponent
  return <div className="business-table">
    <div className="business-table-summary" role="status" aria-live="polite">
      {props.progressPending ? "Chargement de la liste..." : count + " résultat(s)"}
    </div>
    <DataTable
      keyField="id"
      highlightOnHover
      responsive
      {...props}
      paginationComponentOptions={{
        rowsPerPageText: "Lignes par page",
        rangeSeparatorText: "sur",
        ...props.paginationComponentOptions
      }}
      progressComponent={<div className="business-table-loading" role="status"><Spinner size="sm" color="primary" /><span>Chargement des données...</span></div>}
      noDataComponent={typeof empty === "string" || empty == null
        ? <div className="business-table-empty"><Search size={28} aria-hidden="true" /><h3>{empty || "Aucun résultat."}</h3><p>Si un filtre est actif, modifiez ou effacez votre recherche.</p></div>
        : empty}
    />
  </div>
}
export default BusinessTable
