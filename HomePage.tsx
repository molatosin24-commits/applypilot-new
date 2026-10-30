import { Link } from 'react-router-dom'
import { Search, FileText, ClipboardList, ShieldCheck, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Find remote jobs.
              <br />
              <span className="text-brand-700">Apply smarter.</span>
            </h1>
            <p className="mt-5 text-base text-slate-600 sm:text-lg">
              Discover legitimate remote opportunities worldwide. Prepare strong applications.
              Track your progress. Built for everyone looking for remote work.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/jobs" className="btn-primary w-full sm:w-auto">
                <Search className="h-4 w-4" />
                Browse remote jobs
              </Link>
              <Link to="/signup" className="btn-secondary w-full sm:w-auto">
                Create free account
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              No account needed to browse jobs. Sign up only to save and track.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-slate-900">
          Everything you need for remote job search
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
          Simple tools that help you discover, prepare and organise — without the clutter.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Search,
              title: 'Job discovery',
              desc: 'Search real remote roles from trusted public sources. Filter by category, location eligibility and type.',
            },
            {
              icon: FileText,
              title: 'CV & cover letter',
              desc: 'Build a professional CV and create tailored cover letters. Download as PDF when ready.',
            },
            {
              icon: ClipboardList,
              title: 'Application tracker',
              desc: 'Save jobs, update status, add notes and never lose track of where you applied.',
            },
            {
              icon: ShieldCheck,
              title: 'Safety checks',
              desc: 'Spot common warning signs of suspicious job posts before you share personal details.',
            },
          ].map((item) => (
            <div key={item.title} className="card flex flex-col">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1.5 flex-1 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="rounded-2xl bg-brand-700 px-6 py-10 text-center text-white sm:px-10">
            <h2 className="text-2xl font-semibold">Ready to start?</h2>
            <p className="mx-auto mt-2 max-w-md text-brand-100">
              Browse open remote positions right now. Create an account later when you want to save jobs or track applications.
            </p>
            <Link
              to="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 shadow-sm transition hover:bg-brand-50"
            >
              Explore jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
