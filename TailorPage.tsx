import { useEffect, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { listCvs, analyseCvAgainstJob } from '../lib/cv'
import type { CvRecord } from '../types/cv'

export default function TailorPage() {
  const [cvs, setCvs] = useState<CvRecord[]>([])
  const [cvId, setCvId] = useState('')
  const [jobText, setJobText] = useState('')
  const [result, setResult] = useState<ReturnType<typeof analyseCvAgainstJob> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listCvs()
      .then((cs) => {
        setCvs(cs)
        if (cs[0]) setCvId(cs[0].id)
      })
      .finally(() => setLoading(false))
  }, [])

  const analyse = () => {
    const cv = cvs.find((c) => c.id === cvId)
    if (!cv || !jobText.trim()) {
      alert('Select a CV and paste a job description.')
      return
    }
    setResult(analyseCvAgainstJob(cv.data, jobText))
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Tailor CV to a job</h1>
      <p className="mt-1.5 text-slate-600">
        Compare your CV with a job description. Suggestions are based only on keywords already in your CV — nothing is invented.
      </p>

      <div className="card mt-8 space-y-4">
        <div>
          <label className="label">Your CV</label>
          <select className="input-field" value={cvId} onChange={(e) => setCvId(e.target.value)}>
            {cvs.length === 0 && <option value="">Create a CV first</option>}
            {cvs.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Paste job description</label>
          <textarea
            className="input-field min-h-[160px]"
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the full job description here…"
          />
        </div>
        <button type="button" onClick={analyse} className="btn-primary w-full sm:w-auto">
          <Search className="h-4 w-4" /> Analyse
        </button>
      </div>

      {result && (
        <div className="mt-8 space-y-4">
          <div className="card">
            <p className="text-sm text-slate-500">Keyword match score (approximate)</p>
            <p className="text-3xl font-bold text-slate-900">{result.matchScore}%</p>
          </div>
          <div className="card">
            <h2 className="font-semibold text-emerald-800">Keywords already in your CV</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.matched.length === 0 && <p className="text-sm text-slate-500">None detected</p>}
              {result.matched.map((k) => (
                <span key={k} className="rounded-full bg-emerald-50 px-2.5 py-1 text-sm text-emerald-900">{k}</span>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="font-semibold text-amber-900">Keywords in the job that are missing from your CV</h2>
            <p className="mt-1 text-xs text-slate-500">
              Only add these if they are truly true for you. Do not invent experience.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.missing.length === 0 && <p className="text-sm text-slate-500">None detected</p>}
              {result.missing.map((k) => (
                <span key={k} className="rounded-full bg-amber-50 px-2.5 py-1 text-sm text-amber-900">{k}</span>
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Go to your CV editor and, if appropriate, strengthen bullets or skills that match the role — using only real experience.
          </p>
        </div>
      )}
    </div>
  )
}
