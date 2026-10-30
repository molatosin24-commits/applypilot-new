import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, MapPin, Building2, ExternalLink, Loader2, Filter,
  AlertCircle, Globe, Calendar, Bookmark, BookmarkCheck
} from 'lucide-react'
import { searchJobs, CATEGORIES, JOB_TYPES, ELIGIBILITY_OPTIONS } from '../lib/jobs'
import { saveJob, unsaveJob, isJobSaved } from '../lib/tracker'
import { useAuth } from '../lib/auth'
import type { Job } from '../types/job'

function EligibilityBadge({ job }: { job: Job }) {
  const colours: Record<string, string> = {
    worldwide: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'country-restricted': 'bg-amber-50 text-amber-900 border-amber-200',
    'region-restricted': 'bg-sky-50 text-sky-900 border-sky-200',
    unclear: 'bg-slate-100 text-slate-700 border-slate-200'
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colours[job.eligibility]}`}>
      <Globe className="h-3 w-3" />
      {job.eligibilityLabel}
    </span>
  )
}

function formatDate(iso?: string) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return null }
}

export default function JobsPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Any')
  const [jobType, setJobType] = useState('any')
  const [eligibility, setEligibility] = useState('any')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [searched, setSearched] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [sourcesTried, setSourcesTried] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setErrors([])
    setSearched(true)
    try {
      const result = await searchJobs({
        query: query.trim() || undefined,
        category: category === 'Any' ? undefined : category,
        jobType: jobType === 'any' ? undefined : jobType,
        eligibility: eligibility === 'any' ? undefined : eligibility
      })
      setJobs(result.jobs)
      setErrors(result.errors)
      setSourcesTried(result.sourcesTried)

      // Check which results are already saved (only if logged in)
      if (user && result.jobs.length > 0) {
        const checks = await Promise.all(
          result.jobs.slice(0, 30).map(async (j) => ({ id: j.id, saved: await isJobSaved(j.id) }))
        )
        const set = new Set<string>()
        checks.forEach((c) => { if (c.saved) set.add(c.id) })
        setSavedIds(set)
      }
    } catch {
      setJobs([])
      setErrors(['Search failed. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  const toggleSave = async (job: Job) => {
    if (!user) return
    setSavingId(job.id)
    try {
      if (savedIds.has(job.id)) {
        await unsaveJob(job.id)
        setSavedIds((prev) => {
          const n = new Set(prev)
          n.delete(job.id)
          return n
        })
      } else {
        await saveJob(job)
        setSavedIds((prev) => new Set(prev).add(job.id))
      }
    } catch (err: any) {
      alert(err.message || 'Could not update saved jobs')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Find remote jobs</h1>
        <p className="mt-1.5 text-slate-600">
          Real listings from free public sources. Browse without an account.
        </p>
      </div>

      <form onSubmit={handleSearch} className="card mb-6">
        <label htmlFor="job-query" className="label">Job title or keyword</label>
        <input
          id="job-query"
          type="text"
          className="input-field"
          placeholder="e.g. virtual assistant, software engineer, copywriter"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn-ghost mt-3 text-sm">
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide filters' : 'Show filters'}
        </button>
        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <div>
              <label htmlFor="category" className="label">Category</label>
              <select id="category" className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="jobType" className="label">Job type</label>
              <select id="jobType" className="input-field" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="eligibility" className="label">Location eligibility</label>
              <select id="eligibility" className="input-field" value={eligibility} onChange={(e) => setEligibility(e.target.value)}>
                {ELIGIBILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        )}
        <button type="submit" className="btn-primary mt-5 w-full sm:w-auto" disabled={loading}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Searching…</> : <><Search className="h-4 w-4" /> Search jobs</>}
        </button>
      </form>

      {errors.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Some sources were unavailable</p>
              <p className="mt-0.5">{errors.join(' · ')}</p>
              {sourcesTried.length > 0 && <p className="mt-1 text-xs opacity-80">Tried: {sourcesTried.join(', ')}</p>}
            </div>
          </div>
        </div>
      )}

      {!searched && !loading && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Search className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-slate-600">Enter a keyword or leave blank and press Search.</p>
          <p className="mt-1 text-sm text-slate-500">Sources: Jobicy, Remotive, RemoteOK.</p>
        </div>
      )}

      {searched && !loading && jobs.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-600">
          No jobs found. Try broader keywords or clear filters.
        </div>
      )}

      {jobs.length > 0 && (
        <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
          <span>{jobs.length} job{jobs.length === 1 ? '' : 's'} found</span>
          <span className="text-xs">Real listings · Original apply links</span>
        </div>
      )}

      <ul className="space-y-4">
        {jobs.map((job) => (
          <li key={job.id} className="card transition hover:border-brand-200 hover:shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-slate-900">{job.title}</h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{job.company}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.locationRaw || 'Remote'}</span>
                  {formatDate(job.publishedAt) && (
                    <span className="inline-flex items-center gap-1.5 text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />{formatDate(job.publishedAt)}
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <EligibilityBadge job={job} />
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{job.jobType}</span>
                  {job.category && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{job.category}</span>}
                  {job.salary && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800">{job.salary}</span>}
                </div>
                {job.excerpt && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.excerpt}</p>}
                <p className="mt-2 text-xs text-slate-400">Source: {job.source}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                  View & apply <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {user ? (
                  <button
                    type="button"
                    onClick={() => toggleSave(job)}
                    disabled={savingId === job.id}
                    className="btn-secondary text-sm"
                  >
                    {savingId === job.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : savedIds.has(job.id) ? (
                      <><BookmarkCheck className="h-3.5 w-3.5" /> Saved</>
                    ) : (
                      <><Bookmark className="h-3.5 w-3.5" /> Save</>
                    )}
                  </button>
                ) : (
                  <Link to="/login" className="text-xs text-brand-700 hover:underline">
                    Log in to save
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {jobs.length > 0 && (
        <p className="mt-8 text-center text-xs text-slate-400">
          Always apply on the employer’s official page. ApplyPilot does not submit applications for you.
        </p>
      )}
    </div>
  )
}
