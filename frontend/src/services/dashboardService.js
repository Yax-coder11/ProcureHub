/**
 * dashboardService.js
 *
 * Uses the centralized apiClient. Never calls axios directly.
 * Authorization headers are attached automatically by the request interceptor.
 */
import apiClient from '../api/apiClient'

/**
 * Fetch the complete role-specific dashboard payload in a single request.
 *
 * Returns:
 *   {
 *     role:          string,
 *     sidebar:       Array<{ label, icon, path }>,
 *     quick_actions: Array<{ label, path, tone }>,
 *     stats:         Array<{ key, title, value, detail, icon, tone }>,
 *     activities:    Array<{ section, columns, rows }>,
 *   }
 */
export async function getDashboard() {
  const response = await apiClient.get('/dashboard/')
  return response.data
}

// ── Legacy helpers — kept for backward compatibility ──────────────────────

export async function getDashboardStats() {
  const response = await apiClient.get('/dashboard/stats/')
  return response.data
}

export async function getDashboardActivity() {
  const response = await apiClient.get('/dashboard/activity/')
  return response.data
}
