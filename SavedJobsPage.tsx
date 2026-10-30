import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, ExternalLink, Loader2, Trash2, Plus } from 'lucide-react'
import { getSavedJobs, unsaveJob, createApplication } from '../lib/tracker'
import type { SavedJob } from '../types/tracker'

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSavedJobs()
      setJobs(data)
    } catch (e: any) {
      setError(e.message || 'Could not load saved jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRemove = async (jobId: string) => {
    setBusyId(jobId)
    try {
      await unsaveJob(jobId)
      setJobs((prev) => prev.filter((j) => j.job_id !== jobId))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleTrack = async (job: SavedJob) => {
    setBusyId(job.job_id)
    try {
      await createApplication({
        title: job.title,
        company: job.company,
        url: job.url,
        job_id: job.job_id,
        status: 'interested'
      })
      alert('Added to Application Tracker as “Interested”.')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setBusyId(null)
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
      <h1 className="text-2xl font-bold text-slate-900">Saved jobs</h1>
      <p className="mt-1.5 text-slate-600">Jobs you bookmarked. Only you can see these.</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {!error && jobs.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-slate-600">No saved jobs yet.</p>
          <Link to="/jobs" className="btn-primary mt-6 inline-flex">Browse jobs</Link>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {jobs.map((job) => (
          <li key={job.id} className="card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">{job.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{job.company}</p>
                {job.location_raw && (
                  <p className="mt-1 text-xs text-slate-500">{job.location_raw}</p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  Saved {new Date(job.saved_at).toLocaleDateString()}
                  {job.source ? ` · ${job.source}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                  View <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleTrack(job)}
                  disabled={busyId === job.job_id}
                  className="btn-secondary text-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Track
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(job.job_id)}
                  disabled={busyId === job.job_id}
                  className="btn-ghost text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
