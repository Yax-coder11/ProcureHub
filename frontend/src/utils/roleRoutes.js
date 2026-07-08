export function getDashboardPath(role) {
  const roleMap = {
    admin: '/admin/dashboard',
    procurement_officer: '/procurement/dashboard',
    manager: '/manager/dashboard',
    vendor: '/vendor/dashboard',
  }

  return roleMap[role] || '/login'
}
