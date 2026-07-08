/**
 * useAuth.js — Re-export of the AuthContext consumer hook.
 *
 * This file exists so any component can import from either:
 *   import { useAuth } from '../context/AuthContext'
 *   import useAuth from '../hooks/useAuth'
 *
 * Both are identical. The hooks/ path is the conventional location
 * for custom hooks, while context/ is where the Provider lives.
 */
export { useAuth as default } from '../context/AuthContext'
