import type { Job, JobType, Eligibility, JobSearchParams } from '../types/job'

function normalizeJobType(raw: string | undefined | null): JobType {
  if (!raw) return 'other'
  const t = raw.toLowerCase()
  if (t.includes('full') || t === 'fulltime' || t === 'full-time') return 'full-time'
  if (t.includes('part')) return 'part-time'
  if (t.includes('contract') || t.includes('contractor')) return 'contract'
  if (t.includes('freelance') || t.includes('gig')) return 'freelance'
  if (t.includes('intern')) return 'internship'
  return 'other'
}

function detectEligibility(location: string | undefined | null): { eligibility: Eligibility; label: string } {
  if (!location || !location.trim()) {
    return { eligibility: 'unclear', label: 'Eligibility unclear' }
  }
  const loc = location.toLowerCase().trim()

  // Worldwide signals
  const worldwideSignals = [
    'worldwide', 'anywhere', 'remote - worldwide', 'global', 'work from anywhere',
    'fully remote', '100% remote', 'remote worldwide', 'any location', 'all countries'
  ]
  if (worldwideSignals.some(s => loc.includes(s)) || loc === 'remote' || loc === 'anywhere') {
    return { eligibility: 'worldwide', label: 'Worldwide' }
  }

  // Region signals
  const regionSignals = [
    'europe', 'eu only', 'european union', 'emea', 'apac', 'asia', 'latam',
    'north america', 'south america', 'africa', 'middle east', 'oceania',
    'uk & eu', 'uk/eu', 'us & canada', 'usa & canada'
  ]
  if (regionSignals.some(s => loc.includes(s))) {
    return { eligibility: 'region-restricted', label: `Region: ${location.trim()}` }
  }

  // Country / specific list
  // If it looks like a list of countries or a single country name, treat as country-restricted
  if (
    loc.includes(',') ||
    loc.includes('/') ||
    loc.includes('only') ||
    loc.length < 40 // short location strings are usually country lists
  ) {
    return { eligibility: 'country-restricted', label: `Country-restricted: ${location.trim()}` }
  }

  return { eligibility: 'unclear', label: `Eligibility unclear (${location.trim()})` }
}

function cleanHtml(html: string | undefined | null): string {
  if (!html) return ''
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function makeId(source: string, rawId: string | number, title: string, company: string): string {
  return `${source}-${rawId || `${title}-${company}`.toLowerCase().replace(/\s+/g, '-').slice(0, 60)}`
}

// ---------- Jobicy ----------
async function fetchJobicy(query?: string): Promise<Job[]> {
  try {
    const params = new URLSearchParams()
    params.set('count', '50')
    if (query) params.set('tag', query)

    const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?${params.toString()}`, {
      headers: { Accept: 'application/json' }
    })
    if (!res.ok) throw new Error(`Jobicy ${res.status}`)
    const data = await res.json()
    const list = data.jobs || data || []

    return list.map((j: any): Job => {
      const location = j.jobGeo || j.jobLocation || 'Remote'
      const { eligibility, label } = detectEligibility(location)
      const desc = cleanHtml(j.jobDescription || j.jobExcerpt || '')
      return {
        id: makeId('jobicy', j.id, j.jobTitle, j.companyName),
        title: j.jobTitle || 'Untitled',
        company: j.companyName || 'Unknown company',
        companyLogo: j.companyLogo,
        description: desc,
        excerpt: j.jobExcerpt || desc.slice(0, 160),
        url: j.url || j.jobUrl || '#',
        source: 'jobicy',
        publishedAt: j.pubDate,
        jobType: normalizeJobType(
          Array.isArray(j.jobType) ? j.jobType[0] : j.jobType
        ),
        category: Array.isArray(j.jobIndustry) ? j.jobIndustry[0] : j.jobIndustry,
        salary:
          j.salaryMin || j.salaryMax
            ? `${j.salaryCurrency || ''} ${j.salaryMin || '?'}${j.salaryMax ? `–${j.salaryMax}` : ''} ${j.salaryPeriod || ''}`.trim()
            : undefined,
        experience: j.jobLevel && j.jobLevel !== 'Any' ? j.jobLevel : undefined,
        locationRaw: location,
        eligibility,
        eligibilityLabel: label
      }
    })
  } catch (err) {
    console.warn('Jobicy fetch failed:', err)
    return []
  }
}

// ---------- Remotive ----------
async function fetchRemotive(query?: string): Promise<Job[]> {
  try {
    const params = new URLSearchParams()
    if (query) params.set('search', query)
    params.set('limit', '50')

    const res = await fetch(`https://remotive.com/api/remote-jobs?${params.toString()}`, {
      headers: { Accept: 'application/json' }
    })
    if (!res.ok) throw new Error(`Remotive ${res.status}`)
    const data = await res.json()
    const list = data.jobs || []

    return list.map((j: any): Job => {
      const location = j.candidate_required_location || 'Remote'
      const { eligibility, label } = detectEligibility(location)
      const desc = cleanHtml(j.description)
      return {
        id: makeId('remotive', j.id, j.title, j.company_name),
        title: j.title || 'Untitled',
        company: j.company_name || 'Unknown company',
        companyLogo: j.company_logo,
        description: desc,
        excerpt: desc.slice(0, 160),
        url: j.url || j.job_url || '#',
        source: 'remotive',
        publishedAt: j.publication_date,
        jobType: normalizeJobType(j.job_type),
        category: j.category,
        tags: j.tags,
        salary: j.salary || undefined,
        locationRaw: location,
        eligibility,
        eligibilityLabel: label
      }
    })
  } catch (err) {
    console.warn('Remotive fetch failed:', err)
    return []
  }
}

// ---------- RemoteOK ----------
async function fetchRemoteOK(query?: string): Promise<Job[]> {
  try {
    // RemoteOK returns an array; first element is legal notice
    const res = await fetch('https://remoteok.com/api', {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ApplyPilot/1.0 (remote job search; educational)'
      }
    })
    if (!res.ok) throw new Error(`RemoteOK ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data)) return []

    const jobs = data.slice(1) // skip legal notice
    const q = (query || '').toLowerCase()

    return jobs
      .filter((j: any) => {
        if (!q) return true
        const hay = `${j.position || ''} ${j.company || ''} ${(j.tags || []).join(' ')}`.toLowerCase()
        return hay.includes(q)
      })
      .slice(0, 50)
      .map((j: any): Job => {
        const location = j.location || 'Remote'
        const { eligibility, label } = detectEligibility(location)
        const desc = cleanHtml(j.description)
        return {
          id: makeId('remoteok', j.id || j.slug, j.position, j.company),
          title: j.position || 'Untitled',
          company: j.company || 'Unknown company',
          companyLogo: j.company_logo || j.logo,
          description: desc,
          excerpt: desc.slice(0, 160),
          url: j.url || j.apply_url || `https://remoteok.com/remote-jobs/${j.id}`,
          source: 'remoteok',
          publishedAt: j.date || (j.epoch ? new Date(j.epoch * 1000).toISOString() : undefined),
          jobType: normalizeJobType(
            (j.tags || []).find((t: string) =>
              /full|part|contract|freelance|intern/i.test(t)
            ) || 'other'
          ),
          tags: j.tags,
          salary: j.salary || undefined,
          locationRaw: location,
          eligibility,
          eligibilityLabel: label
        }
      })
  } catch (err) {
    console.warn('RemoteOK fetch failed:', err)
    return []
  }
}

function deduplicate(jobs: Job[]): Job[] {
  const seen = new Map<string, Job>()
  for (const job of jobs) {
    // Key by title + company (normalised)
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`
    if (!seen.has(key)) {
      seen.set(key, job)
    }
  }
  return Array.from(seen.values())
}

/**
 * Search remote jobs from free public APIs.
 * Returns real listings only. Never invents data.
 */
export async function searchJobs(params: JobSearchParams = {}): Promise<{
  jobs: Job[]
  errors: string[]
  sourcesTried: string[]
}> {
  const { query, category, jobType, eligibility } = params
  const errors: string[] = []
  const sourcesTried: string[] = []

  const results = await Promise.allSettled([
    fetchJobicy(query).then(r => { sourcesTried.push('Jobicy'); return r }),
    fetchRemotive(query).then(r => { sourcesTried.push('Remotive'); return r }),
    fetchRemoteOK(query).then(r => { sourcesTried.push('RemoteOK'); return r })
  ])

  let all: Job[] = []
  results.forEach((r, i) => {
    const name = ['Jobicy', 'Remotive', 'RemoteOK'][i]
    if (r.status === 'fulfilled') {
      all = all.concat(r.value)
    } else {
      errors.push(`${name} unavailable`)
    }
  })

  // Client-side filters (APIs have limited filter support)
  if (category) {
    const c = category.toLowerCase()
    all = all.filter(j =>
      (j.category || '').toLowerCase().includes(c) ||
      (j.tags || []).some(t => t.toLowerCase().includes(c)) ||
      j.title.toLowerCase().includes(c)
    )
  }
  if (jobType && jobType !== 'any') {
    all = all.filter(j => j.jobType === jobType)
  }
  if (eligibility && eligibility !== 'any') {
    all = all.filter(j => j.eligibility === eligibility)
  }

  // Sort newest first when date available
  all.sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return db - da
  })

  return {
    jobs: deduplicate(all),
    errors,
    sourcesTried
  }
}

export const CATEGORIES = [
  'Any',
  'Software Development',
  'Design',
  'Marketing',
  'Sales',
  'Customer Support',
  'Writing',
  'Data',
  'Product',
  'Human Resources',
  'Finance',
  'Operations',
  'Virtual Assistant',
  'Other'
]

export const JOB_TYPES = [
  { value: 'any', label: 'Any type' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' }
]

export const ELIGIBILITY_OPTIONS = [
  { value: 'any', label: 'Any eligibility' },
  { value: 'worldwide', label: 'Worldwide only' },
  { value: 'country-restricted', label: 'Country-restricted' },
  { value: 'region-restricted', label: 'Region-restricted' },
  { value: 'unclear', label: 'Eligibility unclear' }
]
