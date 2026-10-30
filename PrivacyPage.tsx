import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Privacy & data</h1>
      <div className="prose prose-slate mt-6 space-y-4 text-sm text-slate-700">
        <p>
          ApplyPilot stores account and job-search data in a free Supabase project you configure.
          We do not sell your data.
        </p>
        <h2 className="text-base font-semibold text-slate-900">What is stored</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Email and profile fields you enter (name, country, profession, preferences)</li>
          <li>Saved jobs, application tracker records, CVs, cover letters, interview notes, saved searches and in-app alerts</li>
        </ul>
        <h2 className="text-base font-semibold text-slate-900">What is not done automatically</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>CVs are never uploaded without you saving them in the app</li>
          <li>No background email or push job alerts in this free version</li>
          <li>No payment or subscription systems</li>
        </ul>
        <h2 className="text-base font-semibold text-slate-900">Access control</h2>
        <p>
          Row Level Security (RLS) in Supabase is configured so each user can only read and write their own rows.
        </p>
        <h2 className="text-base font-semibold text-slate-900">Your controls</h2>
        <p>
          You can edit or delete CVs, cover letters, applications, saved jobs and searches from within the app.
          To delete your entire account, use Supabase Auth (or ask your project admin) after exporting anything you need.
        </p>
        <p>
          Job listings come from third-party public APIs (Jobicy, Remotive, RemoteOK). Their privacy practices are separate from ApplyPilot.
        </p>
      </div>
      <Link to="/" className="btn-secondary mt-8 inline-flex">Back to home</Link>
    </div>
  )
}
