import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    const { error } = await resetPassword(email.trim())
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      setMessage(
        'If an account exists for that email, a password reset link has been sent. Check your inbox (and spam folder).'
      )
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Enter your email and we will send a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card mt-8">
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input
            id="email"
            type="email"
            required
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
          ) : (
            <><Mail className="h-4 w-4" /> Send reset link</>
          )}
        </button>

        {message && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{message}</p>
        )}
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">
          ← Back to log in
        </Link>
      </p>
    </div>
  )
}
