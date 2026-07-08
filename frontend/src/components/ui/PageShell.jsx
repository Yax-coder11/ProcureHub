import Breadcrumb from './Breadcrumb'
import PageHeader from './PageHeader'

function PageShell({ breadcrumbItems = [], title, subtitle, actions, children }) {
  return (
    <div>
      {breadcrumbItems.length ? <Breadcrumb items={breadcrumbItems} /> : null}
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {children}
    </div>
  )
}

export default PageShell
