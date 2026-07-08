function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb mb-0">
        {items.map((item, index) => (
          <li key={item.label} className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}>
            {index === items.length - 1 ? item.label : <a href={item.href || '#'}>{item.label}</a>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb
