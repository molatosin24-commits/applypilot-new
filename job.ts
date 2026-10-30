export type Eligibility =
  | 'worldwide'
  | 'country-restricted'
  | 'region-restricted'
  | 'unclear'

export type JobType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'freelance'
  | 'internship'
  | 'other'

export interface Job {
  id: string
  title: string
  company: string
  companyLogo?: string
  description: string
  excerpt?: string
  url: string // original employer / board apply link
  source: 'jobicy' | 'remotive' | 'remoteok'
  sourceUrl?: string
  publishedAt?: string
  jobType: JobType
  category?: string
  tags?: string[]
  salary?: string
  experience?: string
  locationRaw: string
  eligibility: Eligibility
  eligibilityLabel: string
}

export interface JobSearchParams {
  query?: string
  category?: string
  jobType?: string
  eligibility?: string
}
