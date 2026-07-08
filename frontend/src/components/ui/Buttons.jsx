export function PrimaryButton({ children, ...props }) {
  return (
    <button className="btn btn-primary" {...props}>
      {children}
    </button>
  )
}

export function SecondaryButton({ children, ...props }) {
  return (
    <button className="btn btn-outline-secondary" {...props}>
      {children}
    </button>
  )
}

export function DangerButton({ children, ...props }) {
  return (
    <button className="btn btn-danger" {...props}>
      {children}
    </button>
  )
}
