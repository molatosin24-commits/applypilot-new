export type RiskLevel = 'low' | 'caution' | 'high'

export interface SafetyFlag {
  id: string
  severity: 'caution' | 'high'
  title: string
  explanation: string
  matched?: string
}

export interface SafetyResult {
  level: RiskLevel
  flags: SafetyFlag[]
  summary: string
}

const HIGH_PATTERNS: { id: string; re: RegExp; title: string; explanation: string }[] = [
  {
    id: 'payment',
    re: /pay\s*(us|me|them|now)|upfront\s*fee|registration\s*fee|training\s*fee|buy\s*(equipment|software)|send\s*money|wire\s*transfer|gift\s*card|western\s*union|moneygram|bitcoin|crypto\s*payment/i,
    title: 'Request for payment or money',
    explanation: 'Legitimate employers do not ask candidates to pay for a job, training, equipment packages, or “processing fees”. This is a classic scam pattern.'
  },
  {
    id: 'check',
    re: /overpay|extra\s*check|cash\s*the\s*check|refund\s*the\s*difference|fake\s*check/i,
    title: 'Overpayment / fake check scheme',
    explanation: 'Scammers send a fake cheque for more than agreed and ask you to return the difference. The cheque later bounces and you lose the money.'
  },
  {
    id: 'personal_id',
    re: /send\s*(your\s*)?(passport|national\s*id|driver.?s?\s*licence|ssn|social\s*security|bank\s*account|routing\s*number|credit\s*card)/i,
    title: 'Sensitive personal or banking information requested early',
    explanation: 'Passport, full bank details, or SSN should not be required before a formal offer and proper verification process. Early requests are a red flag.'
  },
  {
    id: 'urgency_secret',
    re: /urgent\s*hiring|act\s*now|limited\s*slots|do\s*not\s*tell|keep\s*this\s*confidential|secret\s*job/i,
    title: 'Extreme urgency or secrecy',
    explanation: 'Pressure to act immediately or keep the “job” secret is often used to stop you from researching the company.'
  }
]

const CAUTION_PATTERNS: { id: string; re: RegExp; title: string; explanation: string }[] = [
  {
    id: 'salary_unreal',
    re: /(\$|usd|eur|£)\s?\d{2,3},?\d{3}\s*(\+|plus)?\s*(per\s*week|\/\s*week|weekly)|earn\s*\$?\d{4,}\s*(a|per)\s*day|guaranteed\s*income/i,
    title: 'Unrealistic salary or “guaranteed” earnings',
    explanation: 'Very high pay for simple remote tasks, or “guaranteed” income with little experience, is often used as bait. Compare with normal market rates for the role.'
  },
  {
    id: 'free_email',
    re: /@(gmail|yahoo|hotmail|outlook|protonmail|icloud)\.com/i,
    title: 'Recruiter using a free public email domain',
    explanation: 'Many real freelancers use Gmail, but company recruiters usually have a company domain. A free email alone is not proof of a scam, but combine it with other signs.'
  },
  {
    id: 'whatsapp_only',
    re: /contact\s*(us|me)\s*(only\s*)?(on|via)\s*whatsapp|interview\s*(on|via)\s*whatsapp|text\s*me\s*on\s*whatsapp/i,
    title: 'Interview or hiring only via WhatsApp / messaging apps',
    explanation: 'Some remote teams use chat tools, but exclusive WhatsApp hiring with no company website or formal process is a common scam pattern.'
  },
  {
    id: 'poor_grammar',
    re: /dear\s*(applicant|candidate|friend)|kindly\s*do\s*the\s*needful|you\s*has\s*been\s*selected/i,
    title: 'Generic or poorly written outreach',
    explanation: 'Mass-sounding “Dear Applicant” messages and broken English are common in scam emails. Not definitive alone, but worth extra caution.'
  },
  {
    id: 'no_company',
    re: /work\s*from\s*home\s*opportunity|no\s*experience\s*needed.*high\s*pay/i,
    title: 'Vague “work from home” opportunity language',
    explanation: 'Listings that emphasise lifestyle over the actual job and company details are often low-quality or fraudulent.'
  }
]

export function analyseJobSafety(input: {
  jobText?: string
  company?: string
  applyUrl?: string
  recruiterEmail?: string
  extra?: string
}): SafetyResult {
  const blob = [input.jobText, input.company, input.applyUrl, input.recruiterEmail, input.extra]
    .filter(Boolean)
    .join('\n')

  const flags: SafetyFlag[] = []

  for (const p of HIGH_PATTERNS) {
    const m = blob.match(p.re)
    if (m) {
      flags.push({
        id: p.id,
        severity: 'high',
        title: p.title,
        explanation: p.explanation,
        matched: m[0]
      })
    }
  }

  for (const p of CAUTION_PATTERNS) {
    const m = blob.match(p.re)
    if (m) {
      flags.push({
        id: p.id,
        severity: 'caution',
        title: p.title,
        explanation: p.explanation,
        matched: m[0]
      })
    }
  }

  // Simple URL check
  if (input.applyUrl) {
    try {
      const u = new URL(input.applyUrl.startsWith('http') ? input.applyUrl : `https://${input.applyUrl}`)
      if (u.protocol !== 'https:') {
        flags.push({
          id: 'http',
          severity: 'caution',
          title: 'Application link is not HTTPS',
          explanation: 'Prefer https links. Plain http pages can be riskier, especially if they ask for personal data.'
        })
      }
    } catch {
      flags.push({
        id: 'bad_url',
        severity: 'caution',
        title: 'Application link looks invalid',
        explanation: 'Could not parse the URL. Double-check it opens the real company or job board site.'
      })
    }
  }

  const highCount = flags.filter((f) => f.severity === 'high').length
  const cautionCount = flags.filter((f) => f.severity === 'caution').length

  let level: RiskLevel = 'low'
  if (highCount >= 1) level = 'high'
  else if (cautionCount >= 2) level = 'caution'
  else if (cautionCount === 1) level = 'caution'

  const summary =
    level === 'high'
      ? 'High concern — one or more strong scam indicators were found. Do not send money or sensitive documents. Verify the company independently before proceeding.'
      : level === 'caution'
        ? 'Caution — some warning signs were found. Research the company and recruiter carefully before sharing personal information or applying.'
        : 'Low concern based on the text provided — no strong automated red flags. This is not a guarantee of safety; always verify the employer yourself.'

  return { level, flags, summary }
}

export const APPLICATION_SAFETY_CHECKLIST = [
  'I can find the company on an official website or reputable directory',
  'The application link goes to the company domain or a known job board (not a random form asking for payment)',
  'No one has asked me to pay money, buy gift cards, or cash a cheque',
  'Salary claims look realistic for the role and location',
  'Recruiter email (if any) matches a company domain or is from a known platform',
  'I have not been asked for passport, bank details, or full ID before a formal offer',
  'I researched the company name + “scam” or “review” online',
  'I am applying through the official channel, not only WhatsApp or Telegram'
]
