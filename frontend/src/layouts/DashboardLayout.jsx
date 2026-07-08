import { Outlet } from 'react-router-dom'
import Sidebar from '../components/ui/Sidebar'
import Navbar from '../components/ui/Navbar'
import Footer from '../components/ui/Footer'
import { useAuth } from '../context/AuthContext'
import useDashboard from '../hooks/useDashboard'

/**
 * DashboardLayout — one shared layout for all four roles.
 *
 * Layout structure is identical for every role.
 * Only the sidebar menu items change, driven by the /api/dashboard/ response.
 *
 * Both user and auth state come from AuthContext — no prop drilling,
 * no direct localStorage reads.
 */
function DashboardLayout() {
  const { user }    = useAuth()
  const { sidebar } = useDashboard()

  if (!user) return null

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar user={user} menuItems={sidebar} />
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <Navbar />
        <main className="flex-grow-1 p-4 p-lg-5">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default DashboardLayout
