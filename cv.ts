export interface CvPersonal {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin?: string
  website?: string
}

export interface CvExperience {
  id: string
  company: string
  title: string
  location?: string
  startDate: string
  endDate: string
  current: boolean
  bullets: string[]
}

export interface CvEducation {
  id: string
  school: string
  degree: string
  field?: string
  startDate: string
  endDate: string
  details?: string
}

export interface CvProject {
  id: string
  name: string
  description: string
  link?: string
  technologies?: string
}

export interface CvData {
  personal: CvPersonal
  summary: string
  experience: CvExperience[]
  education: CvEducation[]
  skills: string[]
  certifications: string[]
  projects: CvProject[]
  languages: string[]
}

export interface CvRecord {
  id: string
  user_id: string
  title: string
  template: 'classic' | 'modern' | 'compact'
  data: CvData
  created_at: string
  updated_at: string
}

export interface CoverLetterRecord {
  id: string
  user_id: string
  title: string
  job_title?: string | null
  company?: string | null
  content: string
  tone: string
  created_at: string
  updated_at: string
}

export function emptyCvData(): CvData {
  return {
    personal: { fullName: '', email: '', phone: '', location: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: []
  }
}

export function newId() {
  return Math.random().toString(36).slice(2, 10)
}
