import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { CATEGORIES } from '../lib/jobs'

export default function ProfilePage() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [profession, setProfession] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setCountry(profile.country || '')
      setProfession(profile.profession || '')
      setCategories(profile.preferred_categories || [])
    }
  }, [profile])

  const toggleCategory = (cat: string) => {
    if (cat === 'Any') return
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setSaving(true)
    const { error } = await updateProfile({
      full_name: fullName.trim() || null,
      country: country.trim() || null,
      profession: profession.trim() || null,
      preferred_categories: categories
    })
    setSaving(false)
    if (error) setError(error)
    else setMessage('Profile saved.')
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Your profile</h1>
      <p className="mt-1.5 text-slate-600">
        This information helps personalise recommendations later. It is never shared publicly.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8">
        <div className="space-y-5">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field bg-slate-50"
              value={user?.email || ''}
              disabled
            />
            <p className="mt-1 text-xs text-slate-500">Email cannot be changed here.</p>
          </div>

          <div>
            <label htmlFor="fullName" className="label">Full name</label>
            <input
              id="fullName"
              type="text"
              className="input-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="country" className="label">Country</label>
            <input
              id="country"
              type="text"
              className="input-field"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Nigeria, Canada, India"
            />
          </div>

          <div>
            <label htmlFor="profession" className="label">Profession / role</label>
            <input
              id="profession"
              type="text"
              className="input-field"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="e.g. Virtual Assistant, Frontend Developer"
            />
          </div>

          <div>
            <label className="label">Preferred job categories</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c !== 'Any').map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    categories.includes(cat)
                      ? 'bg-brand-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Primary button below fields */}
        <button type="submit" className="btn-primary mt-8 w-full sm:w-auto" disabled={saving}>
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          ) : (
            <><Save className="h-4 w-4" /> Save profile</>
          )}
        </button>

        {message && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{message}</p>
        )}
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        )}
      </form>
    </div>
  )
}
