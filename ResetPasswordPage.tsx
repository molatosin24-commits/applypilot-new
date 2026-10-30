import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase puts the recovery session in the URL hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
      else setReady(true) // still show form; update will fail cleanly if no session
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    }
  }

  if (success) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">Password updated</h1>
        <p className="mt-3 text-slate-600">You can now log in with your new password.</p>
        <Link to="/login" className="btn-primary mt-8 inline-flex justify-center">
          Go to log in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Choose a new password</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Enter and confirm your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card mt-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="label">New password</label>
            <input
              id="password"
              type="password"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="label">Confirm new password</label>
            <input
              id="confirm"
              type="password"
              required
              className="input-field"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary mt-6 w-full" disabled={loading || !ready}>
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
          ) : (
            <><KeyRound className="h-4 w-4" /> Update password</>
          )}
        </button>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        )}
      </form>
    </div>
  )
}
