import { useEffect, useState } from 'react'
import {
  Bell, Loader2, Plus, Trash2, Pause, Play, ExternalLink, RefreshCw, Check
} from 'lucide-react'
import {
  listSavedSearches, createSavedSearch, updateSavedSearch, deleteSavedSearch,
  listAlerts, markAlertRead, markAllAlertsRead, checkSearchesNow,
  type SavedSearch, type JobAlert
} from '../lib/alerts'
import { CATEGORIES, JOB_TYPES, ELIGIBILITY_OPTIONS } from '../lib/jobs'

export default function AlertsPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: 'My search',
    keywords: '',
    category: '',
    job_type: '',
    eligibility: ''
  })

  const load = async () => {
    setLoading(true)
    try {
      const [s, a] = await Promise.all([listSavedSearches(), listAlerts()])
      setSearches(s)
      setAlerts(a)
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSavedSearch(form)
      setShowForm(false)
      setForm({ name: 'My search', keywords: '', category: '', job_type: '', eligibility: '' })
      await load()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const toggleActive = async (s: SavedSearch) => {
    await updateSavedSearch(s.id, { active: !s.active })
    await load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this saved search?')) return
    await deleteSavedSearch(id)
    await load()
  }

  const handleCheck = async () => {
    setChecking(true)
    setMessage(null)
    try {
      const { newAlerts, errors } = await checkSearchesNow()
      await load()
      setMessage(
        `Check complete. ${newAlerts} new matching job(s) recorded.` +
        (errors.length ? ` Some sources had issues: ${errors.slice(0, 2).join('; ')}` : '')
      )
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setChecking(false)
    }
  }

  const unread = alerts.filter((a) => !a.read).length

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job alerts</h1>
          <p className="mt-1 text-slate-600">
            Save search preferences and check for matching jobs when you open this page.
            Alerts are in-app only — no email or push is sent in this free version.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleCheck} disabled={checking || searches.length === 0} className="btn-secondary text-sm">
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Check now
          </button>
          <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> New search
          </button>
        </div>
      </div>

      {message && (
        <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-800">{message}</p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card mt-6 space-y-4">
          <h2 className="font-semibold">New saved search</h2>
          <div>
            <label className="label">Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Keywords</label>
            <input className="input-field" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="e.g. virtual assistant, react" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Any</option>
                {CATEGORIES.filter((c) => c !== 'Any').map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Job type</label>
              <select className="input-field" value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })}>
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value === 'any' ? '' : t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Eligibility</label>
              <select className="input-field" value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })}>
                {ELIGIBILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value === 'any' ? '' : o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Save search</button>
        </form>
      )}

      {/* Saved searches */}
      <section className="mt-8">
        <h2 className="font-semibold text-slate-900">Saved searches</h2>
        {searches.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No saved searches yet. Create one to get matching jobs when you check.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {searches.map((s) => (
              <li key={s.id} className="card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {s.name}
                    {!s.active && <span className="ml-2 text-xs text-slate-400">(paused)</span>}
                  </p>
                  <p className="text-sm text-slate-500">
                    {[s.keywords, s.category, s.job_type, s.eligibility].filter(Boolean).join(' · ') || 'Any jobs'}
                  </p>
                  {s.last_checked_at && (
                    <p className="text-xs text-slate-400">
                      Last checked {new Date(s.last_checked_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => toggleActive(s)} className="btn-ghost text-sm">
                    {s.active ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Resume</>}
                  </button>
                  <button type="button" onClick={() => handleDelete(s.id)} className="btn-ghost text-sm text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Alerts list */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Matching jobs {unread > 0 && <span className="text-brand-700">({unread} unread)</span>}
          </h2>
          {unread > 0 && (
            <button type="button" onClick={async () => { await markAllAlertsRead(); await load() }} className="btn-ghost text-sm">
              <Check className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
            <Bell className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2">No alerts yet. Save a search and press “Check now”.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {alerts.map((a) => (
              <li
                key={a.id}
                className={`card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${
                  !a.read ? 'border-brand-200 bg-brand-50/30' : ''
                }`}
              >
                <div>
                  <p className="font-medium text-slate-900">{a.title}</p>
                  <p className="text-sm text-slate-600">{a.company}{a.source ? ` · ${a.source}` : ''}</p>
                  <p className="text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm"
                    onClick={() => markAlertRead(a.id)}>
                    View <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  {!a.read && (
                    <button type="button" onClick={async () => { await markAlertRead(a.id); await load() }} className="btn-ghost text-sm">
                      Mark read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-xs text-slate-500">
        How alerts work: when you click “Check now” (or open this page and check), ApplyPilot queries the free job APIs with your saved preferences and stores new matches. There is no background email or push notification in this free version.
      </p>
    </div>
  )
}
