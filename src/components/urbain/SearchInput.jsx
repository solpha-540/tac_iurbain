import React from "react"
import { Input } from "reactstrap"
import { X } from "react-feather"

const SearchInput = ({ value = "", onChange, ...props }) => (
  <span className="workspace-search-control">
    <Input type="search" {...props} value={value} onChange={onChange} />
    {value && <button
      type="button"
      className="workspace-search-clear"
      aria-label="Effacer la recherche"
      disabled={props.disabled}
      onClick={() => onChange?.({ target: { value: "" } })}
    ><X size={16} aria-hidden="true" /></button>}
  </span>
)
export default SearchInput
