export type ApplicationStatus =
  | 'interested'
  | 'preparing'
  | 'applied'
  | 'interview'
  | 'rejected'
  | 'offer'

export interface SavedJob {
  id: string
  user_id: string
  job_id: string
  title: string
  company: string
  url: string
  source?: string
  location_raw?: string
  eligibility?: string
  job_type?: string
  salary?: string
  published_at?: string
  saved_at: string
}

export interface Application {
  id: string
  user_id: string
  job_id?: string | null
  title: string
  company: string
  url?: string | null
  status: ApplicationStatus
  applied_at?: string | null
  follow_up_at?: string | null
  interview_at?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  interested: 'Interested',
  preparing: 'Preparing',
  applied: 'Applied',
  interview: 'Interview',
  rejected: 'Rejected',
  offer: 'Offer'
}

export const STATUS_COLOURS: Record<ApplicationStatus, string> = {
  interested: 'bg-slate-100 text-slate-800',
  preparing: 'bg-amber-50 text-amber-900',
  applied: 'bg-sky-50 text-sky-900',
  interview: 'bg-violet-50 text-violet-900',
  rejected: 'bg-red-50 text-red-800',
  offer: 'bg-emerald-50 text-emerald-900'
}
