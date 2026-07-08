import { Routes, Route, Navigate } from 'react-router-dom'

// ── Auth pages ────────────────────────────────────────────────────────────
import LoginPage        from './pages/LoginPage'
import SignupPage       from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

// ── Shared dashboard (one component, four roles) ─────────────────────────
import DashboardPage from './pages/DashboardPage'

// ── Admin pages ───────────────────────────────────────────────────────────
import UsersPage           from './pages/admin/UsersPage'
import SettingsPage        from './pages/admin/SettingsPage'
import AdminVendorsPage    from './pages/admin/VendorsPage'
import AdminRfqsPage       from './pages/admin/RfqsPage'
import AdminQuotationsPage from './pages/admin/QuotationsPage'
import AdminApprovalsPage  from './pages/admin/ApprovalsPage'
import AdminPOsPage        from './pages/admin/PurchaseOrdersPage'
import AdminInvoicesPage   from './pages/admin/InvoicesPage'
import AdminReportsPage    from './pages/admin/ReportsPage'
import ActivityLogsPage    from './pages/admin/ActivityLogsPage'

// ── Procurement Officer pages ─────────────────────────────────────────────
import RfqsPage           from './pages/procurement/RfqsPage'
import OrdersPage         from './pages/procurement/OrdersPage'
import ProcVendorsPage    from './pages/procurement/VendorsPage'
import ProcQuotationsPage from './pages/procurement/QuotationsPage'
import ProcPOsPage        from './pages/procurement/PurchaseOrdersPage'
import ProcInvoicesPage   from './pages/procurement/InvoicesPage'
import ProcActivityPage   from './pages/procurement/ActivityPage'

// ── Manager pages ─────────────────────────────────────────────────────────
import ApprovalsPage  from './pages/manager/ApprovalsPage'
import ReportsPage    from './pages/manager/ReportsPage'
import MgrActivityPage from './pages/manager/ActivityPage'

// ── Vendor pages ──────────────────────────────────────────────────────────
import CatalogPage          from './pages/vendor/CatalogPage'
import VendorOrdersPage     from './pages/vendor/OrdersPage'
import VendorRfqsPage       from './pages/vendor/RfqsPage'
import VendorQuotationsPage from './pages/vendor/QuotationsPage'
import VendorPOsPage        from './pages/vendor/PurchaseOrdersPage'
import VendorInvoicesPage   from './pages/vendor/InvoicesPage'
import VendorProfilePage    from './pages/vendor/ProfilePage'

// ── Route guard (auth + role) — single component for both concerns ────────
import ProtectedRoute from './routes/ProtectedRoute'

// ── Layout ────────────────────────────────────────────────────────────────
import DashboardLayout from './layouts/DashboardLayout'

function App() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────────── */}
      <Route path="/"                element={<Navigate to="/login" replace />} />
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/signup"          element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* ── Protected routes — require valid JWT ─────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* ── Admin ─────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard"       element={<DashboardPage />} />
            <Route path="/admin/users"           element={<UsersPage />} />
            <Route path="/admin/vendors"         element={<AdminVendorsPage />} />
            <Route path="/admin/rfqs"            element={<AdminRfqsPage />} />
            <Route path="/admin/quotations"      element={<AdminQuotationsPage />} />
            <Route path="/admin/approvals"       element={<AdminApprovalsPage />} />
            <Route path="/admin/purchase-orders" element={<AdminPOsPage />} />
            <Route path="/admin/invoices"        element={<AdminInvoicesPage />} />
            <Route path="/admin/reports"         element={<AdminReportsPage />} />
            <Route path="/admin/activity-logs"   element={<ActivityLogsPage />} />
            <Route path="/admin/settings"        element={<SettingsPage />} />
          </Route>

          {/* ── Procurement Officer ──────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['procurement_officer']} />}>
            <Route path="/procurement/dashboard"       element={<DashboardPage />} />
            <Route path="/procurement/vendors"         element={<ProcVendorsPage />} />
            <Route path="/procurement/rfqs"            element={<RfqsPage />} />
            <Route path="/procurement/quotations"      element={<ProcQuotationsPage />} />
            <Route path="/procurement/purchase-orders" element={<ProcPOsPage />} />
            <Route path="/procurement/invoices"        element={<ProcInvoicesPage />} />
            <Route path="/procurement/orders"          element={<OrdersPage />} />
            <Route path="/procurement/reports"         element={<AdminReportsPage />} />
            <Route path="/procurement/activity"        element={<ProcActivityPage />} />
          </Route>

          {/* ── Manager ─────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
            <Route path="/manager/dashboard" element={<DashboardPage />} />
            <Route path="/manager/approvals" element={<ApprovalsPage />} />
            <Route path="/manager/reports"   element={<ReportsPage />} />
            <Route path="/manager/activity"  element={<MgrActivityPage />} />
          </Route>

          {/* ── Vendor ──────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
            <Route path="/vendor/dashboard"       element={<DashboardPage />} />
            <Route path="/vendor/rfqs"            element={<VendorRfqsPage />} />
            <Route path="/vendor/quotations"      element={<VendorQuotationsPage />} />
            <Route path="/vendor/purchase-orders" element={<VendorPOsPage />} />
            <Route path="/vendor/invoices"        element={<VendorInvoicesPage />} />
            <Route path="/vendor/profile"         element={<VendorProfilePage />} />
            <Route path="/vendor/catalog"         element={<CatalogPage />} />
            <Route path="/vendor/orders"          element={<VendorOrdersPage />} />
          </Route>

        </Route>
      </Route>
    </Routes>
  )
}

export default App
