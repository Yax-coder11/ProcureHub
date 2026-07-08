/**
 * StatusBadge
 *
 * Renders a Bootstrap badge for any ERP status string.
 * Covers every status used across Vendor, RFQ, Quotation, PurchaseOrder, and Invoice models.
 * Unknown statuses fall back to a neutral "secondary" badge so nothing ever crashes.
 */

const STATUS_PALETTE = {
  // Generic
  active:           'success',
  inactive:         'secondary',
  pending:          'warning',
  approved:         'success',
  rejected:         'danger',
  cancelled:        'danger',
  draft:            'secondary',

  // Vendor
  'pending approval': 'warning',

  // RFQ
  open:               'primary',
  assigned:           'info',
  quoted:             'info',
  comparison_pending: 'warning',
  closed:             'secondary',

  // Quotation
  submitted:          'primary',
  under_review:       'info',
  accepted:           'success',

  // Purchase Order
  pending_approval:   'warning',
  fulfilled:          'success',

  // Invoice
  pending_payment:    'warning',
  paid:               'success',
  overdue:            'danger',
}

function StatusBadge({ status }) {
  if (!status) return null

  // Normalise: replace underscores with spaces, lower-case
  const normalised = status.toLowerCase().replace(/_/g, '_')
  const color = STATUS_PALETTE[normalised] ?? 'secondary'

  // Display text: replace underscores with spaces, title-case each word
  const display = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return <span className={`badge bg-${color}`}>{display}</span>
}

export default StatusBadge
