import { useEffect, useState } from 'react'
import { Loader2, Save, CheckSquare } from 'lucide-react'
import {
  INTERVIEW_QUESTIONS,
  REMOTE_CHECKLIST,
  PREP_CHECKLIST,
  getInterviewNote,
  saveInterviewNote,
  type QuestionCategory,
  type InterviewQuestion
} from '../lib/interview'

const TABS: { id: QuestionCategory | 'checklists'; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'behavioural', label: 'Behavioural' },
  { id: 'situational', label: 'Situational' },
  { id: 'remote', label: 'Remote' },
  { id: 'role', label: 'Role' },
  { id: 'questions-to-ask', label: 'Ask them' },
  { id: 'checklists', label: 'Checklists' }
]

export default function InterviewPage() {
  const [tab, setTab] = useState<QuestionCategory | 'checklists'>('general')
  const [active, setActive] = useState<InterviewQuestion | null>(null)
  const [answer, setAnswer] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [loadingNote, setLoadingNote] = useState(false)

  const questions = INTERVIEW_QUESTIONS.filter((q) => q.category === tab)

  useEffect(() => {
    if (!active) return
    setLoadingNote(true)
    setMessage(null)
    getInterviewNote(active.id)
      .then((n) => {
        setAnswer(n?.answer || '')
        setNotes(n?.notes || '')
      })
      .catch(() => {
        setAnswer('')
        setNotes('')
      })
      .finally(() => setLoadingNote(false))
  }, [active?.id])

  const handleSave = async () => {
    if (!active) return
    setSaving(true)
    try {
      await saveInterviewNote(active.id, active.text, answer, notes)
      setMessage('Saved privately to your account.')
    } catch (e: any) {
      setMessage(e.message || 'Could not save (are you logged in?)')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Interview preparation</h1>
      <p className="mt-1.5 text-slate-600">
        Practice common questions, write your own answers, and use checklists. Tips use standard interview frameworks — not AI invention.
      </p>

      <div className="mt-6 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); setActive(null) }}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === t.id ? 'bg-white font-medium shadow-sm' : 'text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'checklists' ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="card">
            <h2 className="flex items-center gap-2 font-semibold">
              <CheckSquare className="h-5 w-5 text-brand-700" /> General prep checklist
            </h2>
            <ul className="mt-4 space-y-2">
              {PREP_CHECKLIST.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <input type="checkbox" className="mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2 className="flex items-center gap-2 font-semibold">
              <CheckSquare className="h-5 w-5 text-brand-700" /> Remote interview checklist
            </h2>
            <ul className="mt-4 space-y-2">
              {REMOTE_CHECKLIST.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <input type="checkbox" className="mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <ul className="space-y-2">
              {questions.map((q) => (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => setActive(q)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      active?.id === q.id
                        ? 'border-brand-300 bg-brand-50 text-brand-900'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {q.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            {!active && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
                Select a question to practice and save your answer.
              </div>
            )}
            {active && (
              <div className="card space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">{active.text}</h2>
                {active.tip && <p className="text-sm text-slate-600"><strong>Tip:</strong> {active.tip}</p>}
                {active.structure && (
                  <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <strong>Structure:</strong> {active.structure}
                  </p>
                )}
                {loadingNote ? (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                ) : (
                  <>
                    <div>
                      <label className="label">Your practice answer</label>
                      <textarea
                        className="input-field min-h-[140px]"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Write your answer in your own words. Base it only on real experience."
                      />
                    </div>
                    <div>
                      <label className="label">Personal notes</label>
                      <textarea
                        className="input-field min-h-[60px]"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Reminders, examples to use, etc."
                      />
                    </div>
                    <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save answer
                    </button>
                    {message && <p className="text-sm text-emerald-800">{message}</p>}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
