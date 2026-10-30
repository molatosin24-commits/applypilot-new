import { supabase } from './supabase'
import { searchJobs } from './jobs'
import type { Job } from '../types/job'

export interface SavedSearch {
  id: string
  user_id: string
  name: string
  keywords: string
  category: string
  job_type: string
  eligibility: string
  active: boolean
  last_checked_at?: string | null
  created_at: string
}

export interface JobAlert {
  id: string
  user_id: string
  search_id?: string | null
  job_id: string
  title: string
  company: string
  url: string
  source?: string | null
  read: boolean
  created_at: string
}

export async function listSavedSearches(): Promise<SavedSearch[]> {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []) as SavedSearch[]
}

export async function createSavedSearch(input: {
  name: string
  keywords?: string
  category?: string
  job_type?: string
  eligibility?: string
}): Promise<SavedSearch> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in')
  const { data, error } = await supabase
    .from('saved_searches')
    .insert({
      user_id: user.id,
      name: input.name || 'My search',
      keywords: input.keywords || '',
      category: input.category || '',
      job_type: input.job_type || '',
      eligibility: input.eligibility || '',
      active: true
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as SavedSearch
}

export async function updateSavedSearch(
  id: string,
  updates: Partial<{ name: string; keywords: string; category: string; job_type: string; eligibility: string; active: boolean }>
): Promise<void> {
  const { error } = await supabase
    .from('saved_searches')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteSavedSearch(id: string): Promise<void> {
  const { error } = await supabase.from('saved_searches').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function listAlerts(): Promise<JobAlert[]> {
  const { data, error } = await supabase
    .from('job_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw new Error(error.message)
  return (data || []) as JobAlert[]
}

export async function unreadAlertCount(): Promise<number> {
  const { count, error } = await supabase
    .from('job_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)
  if (error) return 0
  return count || 0
}

export async function markAlertRead(id: string): Promise<void> {
  await supabase.from('job_alerts').update({ read: true }).eq('id', id)
}

export async function markAllAlertsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('job_alerts').update({ read: true }).eq('user_id', user.id).eq('read', false)
}

/**
 * Check active saved searches against live job APIs and insert new alerts.
 * Runs only when the user opens the Alerts page or clicks "Check now".
 * Does NOT run in the background and does NOT send email.
 */
export async function checkSearchesNow(): Promise<{ newAlerts: number; errors: string[] }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in')

  const searches = (await listSavedSearches()).filter((s) => s.active)
  let newAlerts = 0
  const errors: string[] = []

  for (const search of searches) {
    try {
      const { jobs, errors: srcErrors } = await searchJobs({
        query: search.keywords || undefined,
        category: search.category || undefined,
        jobType: search.job_type || undefined,
        eligibility: search.eligibility || undefined
      })
      errors.push(...srcErrors)

      for (const job of jobs.slice(0, 25)) {
        const { error } = await supabase.from('job_alerts').upsert(
          {
            user_id: user.id,
            search_id: search.id,
            job_id: job.id,
            title: job.title,
            company: job.company,
            url: job.url,
            source: job.source,
            read: false
          },
          { onConflict: 'user_id,job_id', ignoreDuplicates: true }
        )
        if (!error) newAlerts++
      }

      await supabase
        .from('saved_searches')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('id', search.id)
    } catch (e: any) {
      errors.push(e.message || 'Search failed')
    }
  }

  return { newAlerts, errors }
}
