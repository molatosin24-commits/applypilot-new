import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Briefcase, Menu, X, LogOut, User, LayoutDashboard, Bookmark, ClipboardList, FileText, Bell } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut, loading } = useAuth()

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/jobs', label: 'Find Jobs' },
    { to: '/safety', label: 'Safety' }
  ]

  const authLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/saved', label: 'Saved', icon: Bookmark },
    { to: '/tracker', label: 'Tracker', icon: ClipboardList },
    { to: '/cvs', label: 'CVs', icon: FileText },
    { to: '/cover-letters', label: 'Letters', icon: FileText },
    { to: '/alerts', label: 'Alerts', icon: Bell },
    { to: '/interview', label: 'Interview', icon: ClipboardList },
    { to: '/profile', label: 'Profile', icon: User }
  ]

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    await signOut()
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 font-semibold text-brand-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-lg tracking-tight">ApplyPilot</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {publicLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive(link.to) ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                {link.label}
              </Link>
            ))}
            {!loading && user ? (
              <>
                {authLinks.map((link) => (
                  <Link key={link.to} to={link.to}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                      isActive(link.to) ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100'
                    }`}>
                    {link.label}
                  </Link>
                ))}
                <button type="button" onClick={handleSignOut} className="btn-ghost ml-2 text-sm">
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </>
            ) : (
              !loading && (
                <div className="ml-3 flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm">Log in</Link>
                  <Link to="/signup" className="btn-primary text-sm">Sign up</Link>
                </div>
              )
            )}
          </nav>

          <button type="button" className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {publicLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive(link.to) ? 'bg-brand-50 text-brand-800' : 'text-slate-700'
                  }`}>{link.label}</Link>
              ))}
              {!loading && user ? (
                <>
                  {authLinks.map((link) => (
                    <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <link.icon className="h-4 w-4" /> {link.label}
                      </span>
                    </Link>
                  ))}
                  <button type="button" onClick={handleSignOut}
                    className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                  {profile?.full_name && (
                    <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
                      Signed in as {profile.full_name}
                    </p>
                  )}
                </>
              ) : (
                !loading && (
                  <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full justify-center">Log in</Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center">Sign up</Link>
                  </div>
                )
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Briefcase className="h-4 w-4 text-brand-600" />
              <span>ApplyPilot — Find Jobs. Apply Smarter. Get Hired.</span>
            </div>
            <div className="flex flex-col items-center gap-1 sm:items-end">
              <Link to="/privacy" className="text-xs text-slate-500 hover:text-slate-700">Privacy & data</Link>
              <p className="text-xs text-slate-400">Free to use. No subscriptions required.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
