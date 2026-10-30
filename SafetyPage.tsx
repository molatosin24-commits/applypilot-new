import { useState } from 'react'
import { ShieldAlert, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { analyseJobSafety, APPLICATION_SAFETY_CHECKLIST, type SafetyResult } from '../lib/safety'

export default function SafetyPage() {
  const [jobText, setJobText] = useState('')
  const [company, setCompany] = useState('')
  const [applyUrl, setApplyUrl] = useState('')
  const [recruiterEmail, setRecruiterEmail] = useState('')
  const [result, setResult] = useState<SafetyResult | null>(null)

  const runCheck = (e: React.FormEvent) => {
    e.preventDefault()
    setResult(
      analyseJobSafety({ jobText, company, applyUrl, recruiterEmail })
    )
  }

  const levelStyles = {
    low: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    caution: 'border-amber-200 bg-amber-50 text-amber-900',
    high: 'border-red-200 bg-red-50 text-red-900'
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Job safety check</h1>
      <p className="mt-1.5 text-slate-600">
        Paste a job description, link or recruiter message. This tool looks for common scam patterns.
        It is guidance only — not a guarantee that a job is safe or unsafe.
      </p>

      <form onSubmit={runCheck} className="card mt-8 space-y-4">
        <div>
          <label className="label">Job description or message text</label>
          <textarea
            className="input-field min-h-[140px]"
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the job ad, email, or chat message here…"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Company name (optional)</label>
            <input className="input-field" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <label className="label">Application URL (optional)</label>
            <input className="input-field" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <div>
          <label className="label">Recruiter email (optional)</label>
          <input className="input-field" type="email" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary w-full sm:w-auto">
          <ShieldAlert className="h-4 w-4" /> Check for warning signs
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-4">
          <div className={`rounded-xl border px-4 py-4 ${levelStyles[result.level]}`}>
            <div className="flex items-start gap-3">
              {result.level === 'high' && <AlertTriangle className="h-6 w-6 shrink-0" />}
              {result.level === 'caution' && <Info className="h-6 w-6 shrink-0" />}
              {result.level === 'low' && <CheckCircle2 className="h-6 w-6 shrink-0" />}
              <div>
                <p className="font-semibold capitalize">
                  {result.level === 'low' ? 'Low concern' : result.level === 'caution' ? 'Caution' : 'High concern'}
                </p>
                <p className="mt-1 text-sm">{result.summary}</p>
              </div>
            </div>
          </div>

          {result.flags.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-slate-900">Warning signs found</h2>
              {result.flags.map((f) => (
                <div key={f.id} className="card">
                  <p className={`text-sm font-semibold ${f.severity === 'high' ? 'text-red-800' : 'text-amber-900'}`}>
                    {f.severity === 'high' ? 'High' : 'Caution'}: {f.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{f.explanation}</p>
                  {f.matched && (
                    <p className="mt-2 text-xs text-slate-400">Matched text: “{f.matched}”</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.flags.length === 0 && (
            <p className="text-sm text-slate-600">
              No automated patterns matched. Still verify the employer independently before applying or sharing documents.
            </p>
          )}
        </div>
      )}

      {/* Application checklist */}
      <div className="card mt-10">
        <h2 className="font-semibold text-slate-900">Before you apply — checklist</h2>
        <p className="mt-1 text-sm text-slate-500">Tick these yourself. This list stays on your device only.</p>
        <ul className="mt-4 space-y-2">
          {APPLICATION_SAFETY_CHECKLIST.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <input type="checkbox" className="mt-1" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <strong>Disclaimer:</strong> This tool uses simple pattern matching on the text you provide.
        It cannot verify a company’s legitimacy, guarantee safety, or replace your own research.
        Never send money or sensitive documents based solely on a job ad or message.
      </div>
    </div>
  )
}
