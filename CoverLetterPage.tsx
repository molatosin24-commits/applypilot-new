import { useEffect, useState } from 'react'
import { Loader2, Save, Trash2, Plus, Download } from 'lucide-react'
import {
  listCoverLetters, saveCoverLetter, deleteCoverLetter,
  generateCoverLetterTemplate, listCvs
} from '../lib/cv'
import type { CoverLetterRecord, CvRecord } from '../types/cv'

export default function CoverLetterPage() {
  const [letters, setLetters] = useState<CoverLetterRecord[]>([])
  const [cvs, setCvs] = useState<CvRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCvId, setSelectedCvId] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [tone, setTone] = useState<'professional' | 'friendly' | 'concise'>('professional')
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('Cover letter')
  const [editingId, setEditingId] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [ls, cs] = await Promise.all([listCoverLetters(), listCvs()])
      setLetters(ls)
      setCvs(cs)
      if (cs[0]) setSelectedCvId(cs[0].id)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const generate = () => {
    const cv = cvs.find((c) => c.id === selectedCvId)
    if (!cv) {
      alert('Create a CV first, or select one.')
      return
    }
    if (!jobTitle.trim() || !company.trim()) {
      alert('Enter job title and company.')
      return
    }
    const d = cv.data
    const letter = generateCoverLetterTemplate({
      fullName: d.personal.fullName || 'Your Name',
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      summary: d.summary,
      topSkills: d.skills,
      experienceHighlights: d.experience
        .slice(0, 2)
        .flatMap((e) => e.bullets.filter(Boolean).slice(0, 1)),
      tone
    })
    setContent(letter)
    setTitle(`Cover letter – ${jobTitle} at ${company}`)
    setEditingId(undefined)
    setMessage('Draft generated from your CV data only. Review and edit before using.')
  }

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      await saveCoverLetter({
        id: editingId,
        title,
        job_title: jobTitle,
        company,
        content,
        tone
      })
      setMessage('Saved privately to your account.')
      await load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cover letter?')) return
    await deleteCoverLetter(id)
    await load()
  }

  const loadLetter = (l: CoverLetterRecord) => {
    setEditingId(l.id)
    setTitle(l.title)
    setJobTitle(l.job_title || '')
    setCompany(l.company || '')
    setContent(l.content)
    setTone((l.tone as any) || 'professional')
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
      <h1 className="text-2xl font-bold text-slate-900">Cover letters</h1>
      <p className="mt-1.5 text-slate-600">
        Generate drafts from your CV and the job details you enter. Nothing is invented. Always review before sending.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="card space-y-4">
            <h2 className="font-semibold">Create draft</h2>
            <div>
              <label className="label">Base CV</label>
              <select className="input-field" value={selectedCvId} onChange={(e) => setSelectedCvId(e.target.value)}>
                {cvs.length === 0 && <option value="">No CVs – create one first</option>}
                {cvs.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Job title</label>
              <input className="input-field" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Virtual Assistant" />
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input-field" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
            </div>
            <div>
              <label className="label">Tone</label>
              <select className="input-field" value={tone} onChange={(e) => setTone(e.target.value as any)}>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="concise">Concise</option>
              </select>
            </div>
            <button type="button" onClick={generate} className="btn-primary w-full">
              <Plus className="h-4 w-4" /> Generate draft
            </button>
            <p className="text-xs text-slate-500">
              Uses only the summary, skills and experience you entered in your CV.
            </p>
          </div>

          {letters.length > 0 && (
            <div className="card">
              <h2 className="font-semibold">Saved letters</h2>
              <ul className="mt-3 space-y-2">
                {letters.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-2 text-sm">
                    <button type="button" className="text-left text-brand-700 hover:underline" onClick={() => loadLetter(l)}>
                      {l.title}
                    </button>
                    <button type="button" className="text-red-600" onClick={() => handleDelete(l.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="card space-y-4">
            <div>
              <label className="label">Letter title</label>
              <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">Content (edit freely)</label>
              <textarea
                className="input-field min-h-[320px] font-serif text-[15px] leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Generate a draft or write your own letter here."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleSave} disabled={saving || !content.trim()} className="btn-primary">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save letter
              </button>
              <button type="button" onClick={() => window.print()} className="btn-secondary" disabled={!content}>
                <Download className="h-4 w-4" /> Print / PDF
              </button>
            </div>
            {message && <p className="text-sm text-emerald-800">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
