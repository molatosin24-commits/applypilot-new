export type QuestionCategory =
  | 'general'
  | 'behavioural'
  | 'situational'
  | 'remote'
  | 'questions-to-ask'
  | 'role'

export interface InterviewQuestion {
  id: string
  category: QuestionCategory
  text: string
  tip?: string
  structure?: string
  roles?: string[] // optional role tags
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // General
  { id: 'g1', category: 'general', text: 'Tell me about yourself.', tip: 'Keep it to 1–2 minutes. Focus on relevant experience, not life story.', structure: 'Present role → relevant past → why this job.' },
  { id: 'g2', category: 'general', text: 'Why do you want this job?', tip: 'Link the role to your skills and interests. Avoid “I need a job”.' },
  { id: 'g3', category: 'general', text: 'Why do you want to work at this company?', tip: 'Mention something specific about the company that is public and genuine.' },
  { id: 'g4', category: 'general', text: 'What are your strengths?', tip: 'Pick 2–3 strengths with a short example each.' },
  { id: 'g5', category: 'general', text: 'What is a weakness you are working on?', tip: 'Be honest but show improvement. Avoid clichés like “I work too hard”.' },
  { id: 'g6', category: 'general', text: 'Where do you see yourself in 3–5 years?', tip: 'Show ambition aligned with realistic growth in the field.' },
  { id: 'g7', category: 'general', text: 'Why are you leaving your current role? (or why are you looking now?)', tip: 'Stay positive. Focus on growth, not complaints.' },
  { id: 'g8', category: 'general', text: 'How do you handle feedback?', tip: 'Give a short real example of receiving feedback and acting on it.' },

  // Behavioural (STAR)
  { id: 'b1', category: 'behavioural', text: 'Tell me about a time you solved a difficult problem.', structure: 'STAR: Situation, Task, Action, Result.' },
  { id: 'b2', category: 'behavioural', text: 'Describe a time you worked with a difficult colleague or client.', structure: 'STAR. Focus on calm communication and outcome.' },
  { id: 'b3', category: 'behavioural', text: 'Give an example of a goal you set and how you achieved it.', structure: 'STAR. Quantify the result if possible.' },
  { id: 'b4', category: 'behavioural', text: 'Tell me about a mistake you made and what you learned.', structure: 'Own it briefly, then focus on learning and prevention.' },
  { id: 'b5', category: 'behavioural', text: 'Describe a time you had to meet a tight deadline.', structure: 'STAR. Highlight prioritisation and communication.' },
  { id: 'b6', category: 'behavioural', text: 'Tell me about a time you went above and beyond.', structure: 'STAR. Keep it relevant to the job.' },

  // Situational
  { id: 's1', category: 'situational', text: 'How would you prioritise if you had multiple urgent tasks?', tip: 'Talk about clarifying deadlines, impact, and communicating trade-offs.' },
  { id: 's2', category: 'situational', text: 'What would you do if you disagreed with your manager?', tip: 'Respectful discussion, evidence, and willingness to align once decided.' },
  { id: 's3', category: 'situational', text: 'How would you handle an unclear assignment?', tip: 'Ask clarifying questions early; summarise understanding back.' },

  // Remote-specific
  { id: 'r1', category: 'remote', text: 'How do you stay productive and organised while working remotely?', tip: 'Mention routines, tools, and communication habits you actually use.' },
  { id: 'r2', category: 'remote', text: 'How do you communicate with a distributed team?', tip: 'Async updates, clear written communication, time-zone respect.' },
  { id: 'r3', category: 'remote', text: 'Describe your remote work setup (internet, workspace, tools).', tip: 'Be honest about reliability of your connection and quiet space.' },
  { id: 'r4', category: 'remote', text: 'How do you manage time zones and overlapping hours?', tip: 'Show flexibility and proactive scheduling.' },

  // Questions candidates can ask
  { id: 'q1', category: 'questions-to-ask', text: 'What does success look like in this role in the first 90 days?' },
  { id: 'q2', category: 'questions-to-ask', text: 'How is the team structured and who would I work with most?' },
  { id: 'q3', category: 'questions-to-ask', text: 'What are the biggest challenges the team is facing right now?' },
  { id: 'q4', category: 'questions-to-ask', text: 'How do you support professional development?' },
  { id: 'q5', category: 'questions-to-ask', text: 'What is the interview process and expected timeline?' },
  { id: 'q6', category: 'questions-to-ask', text: 'Is this role fully remote, and are there any location or time-zone requirements?' },

  // Role-flavoured (still general enough for many professions)
  { id: 'role1', category: 'role', text: 'Walk me through a typical day or week in a similar role you have done.', roles: ['any'] },
  { id: 'role2', category: 'role', text: 'Which tools or systems are you most comfortable using for this kind of work?', roles: ['any'] },
  { id: 'role3', category: 'role', text: 'How do you measure quality in your work?', roles: ['any'] },
  { id: 'role4', category: 'role', text: 'Describe a project you are proud of and your contribution.', roles: ['any'] },
  { id: 'role5', category: 'role', text: 'How do you handle repetitive or detailed tasks without losing accuracy?', roles: ['admin', 'data', 'support'] },
  { id: 'role6', category: 'role', text: 'How do you approach learning a new tool or process quickly?', roles: ['any'] },
]

export const REMOTE_CHECKLIST = [
  'Test internet speed and have a backup (mobile hotspot) ready',
  'Camera and microphone work; test in the interview platform beforehand',
  'Quiet, well-lit space; neutral background',
  'Phone on silent; notifications off on computer',
  'Confirm time zone and join 5–10 minutes early',
  'Have water, notepad, and a copy of your CV nearby',
  'Close unnecessary browser tabs and apps',
  'Dress professionally (at least from the waist up)',
  'Know the interviewer names if provided',
  'Prepare 2–3 questions to ask them'
]

export const PREP_CHECKLIST = [
  'Read the job description again and note key requirements',
  'Research the company (website, LinkedIn, recent news)',
  'Match 3–5 of your experiences to the role requirements',
  'Prepare STAR stories for behavioural questions',
  'Update and print or open your CV',
  'Prepare questions to ask the interviewer',
  'Confirm date, time, time zone, and meeting link',
  'Test tech for remote interviews',
  'Plan what you will wear',
  'Rest well the night before'
]

import { supabase } from './supabase'

export async function getInterviewNote(questionId: string) {
  const { data, error } = await supabase
    .from('interview_notes')
    .select('*')
    .eq('question_id', questionId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as { answer: string; notes: string } | null
}

export async function saveInterviewNote(questionId: string, questionText: string, answer: string, notes: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in')
  const { error } = await supabase.from('interview_notes').upsert(
    {
      user_id: user.id,
      question_id: questionId,
      question_text: questionText,
      answer,
      notes,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id,question_id' }
  )
  if (error) throw new Error(error.message)
}
