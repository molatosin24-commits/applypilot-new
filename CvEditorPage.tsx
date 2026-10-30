import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Save, Plus, Trash2, Download, ArrowLeft } from 'lucide-react'
import { getCv, updateCv } from '../lib/cv'
import type { CvData, CvExperience, CvEducation, CvProject } from '../types/cv'
import { emptyCvData, newId } from '../types/cv'

export default function CvEditorPage() {
  const { id } = useParams<{ id: string }>()
  const [title, setTitle] = useState('My CV')
  const [template, setTemplate] = useState<'classic' | 'modern' | 'compact'>('classic')
  const [data, setData] = useState<CvData>(emptyCvData())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [section, setSection] = useState('personal')

  useEffect(() => {
    if (!id) return
    getCv(id)
      .then((cv) => {
        if (!cv) {
          setError('CV not found')
          return
        }
        setTitle(cv.title)
        setTemplate(cv.template as any)
        setData({ ...emptyCvData(), ...cv.data })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const save = async () => {
    if (!id) return
    setSaving(true)
    setMessage(null)
    try {
      await updateCv(id, { title, template, data })
      setMessage('Saved.')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const printPdf = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (error && !data.personal) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-700">{error}</p>
        <Link to="/cvs" className="btn-primary mt-6 inline-flex">Back to CVs</Link>
      </div>
    )
  }

  const p = data.personal

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/cvs" className="btn-ghost text-sm"><ArrowLeft className="h-4 w-4" /> CVs</Link>
          <input
            className="input-field max-w-xs font-semibold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="input-field w-auto"
            value={template}
            onChange={(e) => setTemplate(e.target.value as any)}
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="compact">Compact</option>
          </select>
          <button type="button" onClick={save} disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
          <button type="button" onClick={printPdf} className="btn-secondary text-sm">
            <Download className="h-4 w-4" /> PDF / Print
          </button>
        </div>
      </div>

      {message && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 print:hidden">{message}</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 print:hidden">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Editor (hidden when printing) */}
        <div className="space-y-4 lg:col-span-2 print:hidden">
          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 text-sm">
            {['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'other'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                className={`rounded-md px-3 py-1.5 capitalize ${
                  section === s ? 'bg-white font-medium shadow-sm' : 'text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {section === 'personal' && (
            <div className="card space-y-3">
              <h3 className="font-semibold">Personal information</h3>
              {(['fullName', 'email', 'phone', 'location', 'linkedin', 'website'] as const).map((field) => (
                <div key={field}>
                  <label className="label capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    className="input-field"
                    value={(p as any)[field] || ''}
                    onChange={(e) =>
                      setData({ ...data, personal: { ...p, [field]: e.target.value } })
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {section === 'summary' && (
            <div className="card space-y-3">
              <h3 className="font-semibold">Professional summary</h3>
              <p className="text-xs text-slate-500">Write only what is true about you. Do not invent experience.</p>
              <textarea
                className="input-field min-h-[140px]"
                value={data.summary}
                onChange={(e) => setData({ ...data, summary: e.target.value })}
                placeholder="2–4 sentences about your background and strengths"
              />
            </div>
          )}

          {section === 'experience' && (
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={exp.id} className="card space-y-3">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">Role {idx + 1}</h3>
                    <button type="button" className="text-red-600" onClick={() =>
                      setData({ ...data, experience: data.experience.filter((x) => x.id !== exp.id) })
                    }><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <input className="input-field" placeholder="Job title" value={exp.title}
                    onChange={(e) => {
                      const experience = [...data.experience]
                      experience[idx] = { ...exp, title: e.target.value }
                      setData({ ...data, experience })
                    }} />
                  <input className="input-field" placeholder="Company" value={exp.company}
                    onChange={(e) => {
                      const experience = [...data.experience]
                      experience[idx] = { ...exp, company: e.target.value }
                      setData({ ...data, experience })
                    }} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input-field" placeholder="Start (e.g. 2021)" value={exp.startDate}
                      onChange={(e) => {
                        const experience = [...data.experience]
                        experience[idx] = { ...exp, startDate: e.target.value }
                        setData({ ...data, experience })
                      }} />
                    <input className="input-field" placeholder="End or Present" value={exp.endDate}
                      onChange={(e) => {
                        const experience = [...data.experience]
                        experience[idx] = { ...exp, endDate: e.target.value }
                        setData({ ...data, experience })
                      }} />
                  </div>
                  <textarea
                    className="input-field min-h-[80px]"
                    placeholder="One achievement or responsibility per line"
                    value={exp.bullets.join('\n')}
                    onChange={(e) => {
                      const experience = [...data.experience]
                      experience[idx] = { ...exp, bullets: e.target.value.split('\n') }
                      setData({ ...data, experience })
                    }}
                  />
                </div>
              ))}
              <button type="button" className="btn-secondary w-full"
                onClick={() => setData({
                  ...data,
                  experience: [...data.experience, {
                    id: newId(), company: '', title: '', startDate: '', endDate: '', current: false, bullets: ['']
                  } as CvExperience]
                })}>
                <Plus className="h-4 w-4" /> Add experience
              </button>
            </div>
          )}

          {section === 'education' && (
            <div className="space-y-4">
              {data.education.map((ed, idx) => (
                <div key={ed.id} className="card space-y-3">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">Education {idx + 1}</h3>
                    <button type="button" className="text-red-600" onClick={() =>
                      setData({ ...data, education: data.education.filter((x) => x.id !== ed.id) })
                    }><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <input className="input-field" placeholder="School / University" value={ed.school}
                    onChange={(e) => {
                      const education = [...data.education]
                      education[idx] = { ...ed, school: e.target.value }
                      setData({ ...data, education })
                    }} />
                  <input className="input-field" placeholder="Degree" value={ed.degree}
                    onChange={(e) => {
                      const education = [...data.education]
                      education[idx] = { ...ed, degree: e.target.value }
                      setData({ ...data, education })
                    }} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input-field" placeholder="Start" value={ed.startDate}
                      onChange={(e) => {
                        const education = [...data.education]
                        education[idx] = { ...ed, startDate: e.target.value }
                        setData({ ...data, education })
                      }} />
                    <input className="input-field" placeholder="End" value={ed.endDate}
                      onChange={(e) => {
                        const education = [...data.education]
                        education[idx] = { ...ed, endDate: e.target.value }
                        setData({ ...data, education })
                      }} />
                  </div>
                </div>
              ))}
              <button type="button" className="btn-secondary w-full"
                onClick={() => setData({
                  ...data,
                  education: [...data.education, {
                    id: newId(), school: '', degree: '', startDate: '', endDate: ''
                  } as CvEducation]
                })}>
                <Plus className="h-4 w-4" /> Add education
              </button>
            </div>
          )}

          {section === 'skills' && (
            <div className="card space-y-3">
              <h3 className="font-semibold">Skills</h3>
              <p className="text-xs text-slate-500">Comma-separated. Only list skills you actually have.</p>
              <textarea
                className="input-field min-h-[100px]"
                value={data.skills.join(', ')}
                onChange={(e) =>
                  setData({
                    ...data,
                    skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })
                }
                placeholder="Excel, Customer support, React, Project coordination…"
              />
            </div>
          )}

          {section === 'projects' && (
            <div className="space-y-4">
              {data.projects.map((pr, idx) => (
                <div key={pr.id} className="card space-y-3">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">Project {idx + 1}</h3>
                    <button type="button" className="text-red-600" onClick={() =>
                      setData({ ...data, projects: data.projects.filter((x) => x.id !== pr.id) })
                    }><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <input className="input-field" placeholder="Project name" value={pr.name}
                    onChange={(e) => {
                      const projects = [...data.projects]
                      projects[idx] = { ...pr, name: e.target.value }
                      setData({ ...data, projects })
                    }} />
                  <textarea className="input-field" placeholder="Description" value={pr.description}
                    onChange={(e) => {
                      const projects = [...data.projects]
                      projects[idx] = { ...pr, description: e.target.value }
                      setData({ ...data, projects })
                    }} />
                </div>
              ))}
              <button type="button" className="btn-secondary w-full"
                onClick={() => setData({
                  ...data,
                  projects: [...data.projects, { id: newId(), name: '', description: '' } as CvProject]
                })}>
                <Plus className="h-4 w-4" /> Add project
              </button>
            </div>
          )}

          {section === 'other' && (
            <div className="card space-y-4">
              <div>
                <label className="label">Certifications (one per line)</label>
                <textarea className="input-field min-h-[80px]"
                  value={data.certifications.join('\n')}
                  onChange={(e) => setData({ ...data, certifications: e.target.value.split('\n').filter(Boolean) })}
                />
              </div>
              <div>
                <label className="label">Languages (comma-separated)</label>
                <input className="input-field"
                  value={data.languages.join(', ')}
                  onChange={(e) => setData({
                    ...data,
                    languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })}
                />
              </div>
            </div>
          )}

          <button type="button" onClick={save} disabled={saving} className="btn-primary w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save CV
          </button>
        </div>

        {/* Live preview */}
        <div className={`lg:col-span-3 ${template === 'modern' ? 'bg-slate-50' : 'bg-white'} rounded-xl border border-slate-200 p-6 shadow-sm print:border-0 print:shadow-none`}>
          <div className={template === 'compact' ? 'text-sm' : ''}>
            <h1 className={`font-bold text-slate-900 ${template === 'modern' ? 'text-2xl text-brand-800' : 'text-xl'}`}>
              {p.fullName || 'Your Name'}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {[p.email, p.phone, p.location].filter(Boolean).join(' · ')}
            </p>
            {(p.linkedin || p.website) && (
              <p className="text-sm text-slate-500">{[p.linkedin, p.website].filter(Boolean).join(' · ')}</p>
            )}

            {data.summary && (
              <section className="mt-5">
                <h2 className="border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-wide text-slate-700">Summary</h2>
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{data.summary}</p>
              </section>
            )}

            {data.experience.length > 0 && (
              <section className="mt-5">
                <h2 className="border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-wide text-slate-700">Experience</h2>
                {data.experience.map((exp) => (
                  <div key={exp.id} className="mt-3">
                    <div className="flex flex-wrap justify-between gap-1">
                      <p className="font-medium text-slate-900">{exp.title}{exp.company ? ` · ${exp.company}` : ''}</p>
                      <p className="text-xs text-slate-500">{exp.startDate} – {exp.endDate || 'Present'}</p>
                    </div>
                    <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
                      {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {data.education.length > 0 && (
              <section className="mt-5">
                <h2 className="border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-wide text-slate-700">Education</h2>
                {data.education.map((ed) => (
                  <div key={ed.id} className="mt-2 text-sm">
                    <p className="font-medium text-slate-900">{ed.degree}{ed.school ? ` · ${ed.school}` : ''}</p>
                    <p className="text-xs text-slate-500">{ed.startDate} – {ed.endDate}</p>
                  </div>
                ))}
              </section>
            )}

            {data.skills.length > 0 && (
              <section className="mt-5">
                <h2 className="border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-wide text-slate-700">Skills</h2>
                <p className="mt-2 text-sm text-slate-700">{data.skills.join(' · ')}</p>
              </section>
            )}

            {data.projects.length > 0 && (
              <section className="mt-5">
                <h2 className="border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-wide text-slate-700">Projects</h2>
                {data.projects.map((pr) => (
                  <div key={pr.id} className="mt-2 text-sm">
                    <p className="font-medium text-slate-900">{pr.name}</p>
                    <p className="text-slate-700">{pr.description}</p>
                  </div>
                ))}
              </section>
            )}

            {(data.certifications.length > 0 || data.languages.length > 0) && (
              <section className="mt-5">
                {data.certifications.length > 0 && (
                  <>
                    <h2 className="border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-wide text-slate-700">Certifications</h2>
                    <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                      {data.certifications.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </>
                )}
                {data.languages.length > 0 && (
                  <p className="mt-3 text-sm text-slate-700">
                    <span className="font-medium">Languages:</span> {data.languages.join(', ')}
                  </p>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
