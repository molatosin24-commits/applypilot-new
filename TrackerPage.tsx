import { useEffect, useState } from 'react'
import {
  Loader2, Plus, Search, ExternalLink, Pencil, Trash2, X
} from 'lucide-react'
import {
  getApplications, createApplication, updateApplication, deleteApplication
} from '../lib/tracker'
import type { Application, ApplicationStatus } from '../types/tracker'
import { STATUS_LABELS, STATUS_COLOURS } from '../types/tracker'

const ALL_STATUSES: ApplicationStatus[] = [
  'interested', 'preparing', 'applied', 'interview', 'rejected', 'offer'
]

const emptyForm = {
  title: '',
  company: '',
  url: '',
  status: 'interested' as ApplicationStatus,
  applied_at: '',
  follow_up_at: '',
  interview_at: '',
  notes: ''
}

export default function TrackerPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Application | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setApps(await getApplications())
    } catch (e: any) {
      setError(e.message || 'Could not load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (app: Application) => {
    setEditing(app)
    setForm({
      title: app.title,
      company: app.company,
      url: app.url || '',
      status: app.status,
      applied_at: app.applied_at || '',
      follow_up_at: app.follow_up_at || '',
      interview_at: app.interview_at || '',
      notes: app.notes || ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.company.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await updateApplication(editing.id, {
          title: form.title.trim(),
          company: form.company.trim(),
          url: form.url.trim() || undefined,
          status: form.status,
          applied_at: form.applied_at || null,
          follow_up_at: form.follow_up_at || null,
          interview_at: form.interview_at || null,
          notes: form.notes.trim() || null
        })
      } else {
        await createApplication({
          title: form.title.trim(),
          company: form.company.trim(),
          url: form.url.trim() || undefined,
          status: form.status,
          applied_at: form.applied_at || undefined,
          follow_up_at: form.follow_up_at || undefined,
          interview_at: form.interview_at || undefined,
          notes: form.notes.trim() || undefined
        })
      }
      setShowForm(false)
      await load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    try {
      await updateApplication(id, { status })
      setApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      )
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application record?')) return
    try {
      await deleteApplication(id)
      setApps((prev) => prev.filter((a) => a.id !== id))
    } catch (e: any) {
      alert(e.message)
    }
  }

  const filtered = apps.filter((a) => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        a.title.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q) ||
        (a.notes || '').toLowerCase().includes(q)
      )
    }
    return true
  })

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
          <h1 className="text-2xl font-bold text-slate-900">Application tracker</h1>
          <p className="mt-1 text-slate-600">Track every application. Only you can see this data.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary shrink-0">
          <Plus className="h-4 w-4" /> Add application
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Search title, company or notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field sm:w-48"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {!error && filtered.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-slate-600">
            {apps.length === 0
              ? 'No applications yet. Add one or track a saved job.'
              : 'No applications match your filters.'}
          </p>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {filtered.map((app) => (
          <li key={app.id} className="card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-900">{app.title}</h2>
                <p className="mt-0.5 text-sm text-slate-600">{app.company}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select
                    className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${STATUS_COLOURS[app.status]}`}
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  {app.applied_at && (
                    <span className="text-xs text-slate-500">Applied {app.applied_at}</span>
                  )}
                  {app.interview_at && (
                    <span className="text-xs text-slate-500">Interview {app.interview_at}</span>
                  )}
                  {app.follow_up_at && (
                    <span className="text-xs text-slate-500">Follow-up {app.follow_up_at}</span>
                  )}
                </div>
                {app.notes && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{app.notes}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {app.url && (
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                    Link <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button type="button" onClick={() => openEdit(app)} className="btn-ghost text-sm">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(app.id)}
                  className="btn-ghost text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editing ? 'Edit application' : 'Add application'}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Job title *</label>
                <input className="input-field" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Company *</label>
                <input className="input-field" required value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <label className="label">Employer / application link</label>
                <input className="input-field" type="url" value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..." />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input-field" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}>
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Applied date</label>
                  <input type="date" className="input-field" value={form.applied_at}
                    onChange={(e) => setForm({ ...form, applied_at: e.target.value })} />
                </div>
                <div>
                  <label className="label">Interview date</label>
                  <input type="date" className="input-field" value={form.interview_at}
                    onChange={(e) => setForm({ ...form, interview_at: e.target.value })} />
                </div>
                <div>
                  <label className="label">Follow-up date</label>
                  <input type="date" className="input-field" value={form.follow_up_at}
                    onChange={(e) => setForm({ ...form, follow_up_at: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input-field min-h-[80px]" value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Interview notes, contacts, next steps…" />
              </div>
              {/* Primary button below fields */}
              <button type="submit" className="btn-primary w-full" disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : editing ? 'Save changes' : 'Add application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
