import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, User, Bookmark, ClipboardList, Loader2, ExternalLink, FileText, Bell
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getDashboardStats } from '../lib/tracker'
import { STATUS_LABELS, STATUS_COLOURS } from '../types/tracker'
import type { ApplicationStatus } from '../types/tracker'

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const name = profile?.full_name || user?.email?.split('@')[0] || 'there'
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e) => setError(e.message || 'Could not load stats'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        Welcome, {name}
      </h1>
      <p className="mt-1.5 text-slate-600">
        Your private overview. Numbers come from your real saved jobs and applications.
      </p>

      {!profile?.full_name && (
        <div className="mt-6 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          Complete your{' '}
          <Link to="/profile" className="font-semibold underline">profile</Link>{' '}
          for better recommendations later.
        </div>
      )}

      {loading && (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {stats && !loading && (
        <>
          {/* Live counts */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card">
              <p className="text-sm text-slate-500">Saved jobs</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{stats.savedCount}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">Applications</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{stats.applicationCount}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">In interview</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{stats.byStatus.interview}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">Offers</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{stats.byStatus.offer}</p>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="card mt-6">
            <h2 className="font-semibold text-slate-900">Application progress</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => (
                <span
                  key={s}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLOURS[s]}`}
                >
                  {STATUS_LABELS[s]}: {stats.byStatus[s]}
                </span>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/jobs" className="card transition hover:border-brand-200 hover:shadow-md">
              <Search className="mb-2 h-5 w-5 text-brand-700" />
              <h3 className="font-semibold">Find jobs</h3>
              <p className="mt-1 text-sm text-slate-600">Search remote openings</p>
            </Link>
            <Link to="/saved" className="card transition hover:border-brand-200 hover:shadow-md">
              <Bookmark className="mb-2 h-5 w-5 text-brand-700" />
              <h3 className="font-semibold">Saved jobs</h3>
              <p className="mt-1 text-sm text-slate-600">{stats.savedCount} saved</p>
            </Link>
            <Link to="/tracker" className="card transition hover:border-brand-200 hover:shadow-md">
              <ClipboardList className="mb-2 h-5 w-5 text-brand-700" />
              <h3 className="font-semibold">Tracker</h3>
              <p className="mt-1 text-sm text-slate-600">{stats.applicationCount} applications</p>
            </Link>
            <Link to="/cvs" className="card transition hover:border-brand-200 hover:shadow-md">
              <FileText className="mb-2 h-5 w-5 text-brand-700" />
              <h3 className="font-semibold">CVs</h3>
              <p className="mt-1 text-sm text-slate-600">Build & edit CVs</p>
            </Link>
            <Link to="/cover-letters" className="card transition hover:border-brand-200 hover:shadow-md">
              <FileText className="mb-2 h-5 w-5 text-brand-700" />
              <h3 className="font-semibold">Cover letters</h3>
              <p className="mt-1 text-sm text-slate-600">Draft from your CV</p>
            </Link>
            <Link to="/alerts" className="card transition hover:border-brand-200 hover:shadow-md">
              <Bell className="mb-2 h-5 w-5 text-brand-700" />
              <h3 className="font-semibold">Alerts</h3>
              <p className="mt-1 text-sm text-slate-600">Saved searches</p>
            </Link>
            <Link to="/profile" className="card transition hover:border-brand-200 hover:shadow-md">
              <User className="mb-2 h-5 w-5 text-brand-700" />
              <h3 className="font-semibold">Profile</h3>
              <p className="mt-1 text-sm text-slate-600">Edit your details</p>
            </Link>
          </div>

          {/* Recent activity */}
          {(stats.recentApplications.length > 0 || stats.recentSaved.length > 0) && (
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {stats.recentApplications.length > 0 && (
                <div>
                  <h2 className="font-semibold text-slate-900">Recent applications</h2>
                  <ul className="mt-3 space-y-2">
                    {stats.recentApplications.map((a) => (
                      <li key={a.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{a.title}</p>
                          <p className="text-slate-500">{a.company}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOURS[a.status]}`}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/tracker" className="mt-2 inline-block text-sm text-brand-700 hover:underline">
                    View all →
                  </Link>
                </div>
              )}
              {stats.recentSaved.length > 0 && (
                <div>
                  <h2 className="font-semibold text-slate-900">Recently saved</h2>
                  <ul className="mt-3 space-y-2">
                    {stats.recentSaved.map((j) => (
                      <li key={j.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{j.title}</p>
                          <p className="text-slate-500">{j.company}</p>
                        </div>
                        <a href={j.url} target="_blank" rel="noopener noreferrer" className="text-brand-700">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </li>
                    ))}
                  </ul>
                  <Link to="/saved" className="mt-2 inline-block text-sm text-brand-700 hover:underline">
                    View all →
                  </Link>
                </div>
              )}
            </div>
          )}

          {stats.savedCount === 0 && stats.applicationCount === 0 && (
            <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <p className="text-slate-600">
                You have no saved jobs or applications yet. Start by browsing jobs and saving ones you like.
              </p>
              <Link to="/jobs" className="btn-primary mt-6 inline-flex">Browse jobs</Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
