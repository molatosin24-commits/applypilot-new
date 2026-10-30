import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Plus, Loader2, Trash2, Pencil } from 'lucide-react'
import { listCvs, createCv, deleteCv } from '../lib/cv'
import type { CvRecord } from '../types/cv'

export default function CvsPage() {
  const [cvs, setCvs] = useState<CvRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setCvs(await listCvs())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const cv = await createCv('My CV')
      window.location.href = `/cv/${cv.id}`
    } catch (e: any) {
      alert(e.message)
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this CV permanently?')) return
    try {
      await deleteCv(id)
      setCvs((prev) => prev.filter((c) => c.id !== id))
    } catch (e: any) {
      alert(e.message)
    }
  }

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
          <h1 className="text-2xl font-bold text-slate-900">My CVs</h1>
          <p className="mt-1 text-slate-600">
            Create and manage professional CVs. Only you can see them. Nothing is invented.
          </p>
        </div>
        <button type="button" onClick={handleCreate} disabled={creating} className="btn-primary shrink-0">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          New CV
        </button>
      </div>

      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      {cvs.length === 0 && !error && (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-slate-600">No CVs yet. Create your first one.</p>
          <button type="button" onClick={handleCreate} className="btn-primary mt-6 inline-flex">
            <Plus className="h-4 w-4" /> Create CV
          </button>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {cvs.map((cv) => (
          <li key={cv.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">{cv.title}</h2>
              <p className="text-sm text-slate-500">
                Template: {cv.template} · Updated {new Date(cv.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={`/cv/${cv.id}`} className="btn-primary text-sm">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
              <button type="button" onClick={() => handleDelete(cv.id)} className="btn-ghost text-sm text-red-600 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
