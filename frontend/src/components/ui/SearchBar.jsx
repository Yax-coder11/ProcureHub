function SearchBar({ value, onChange, placeholder = 'Search' }) {
  return (
    <div className="input-group">
      <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
      <input className="form-control" value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}

export default SearchBar
