'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Map, 
  LogOut,
  Menu,
  RefreshCw,
  Trash2
} from 'lucide-react'
import { ThemeToggle } from "@/components/ThemeToggle"
import { toast } from 'sonner'
import { demoDB } from '@/lib/supabase'

interface AuthState {
  email: string
  loggedIn: boolean
  timestamp: number
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const authData = localStorage.getItem('mystery_served_auth')
    if (authData) {
      const parsed = JSON.parse(authData)
      if (parsed.loggedIn) {
        setAuth(parsed)
      } else {
        router.push('/')
      }
    } else {
      router.push('/')
    }
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('mystery_served_auth')
    router.push('/')
  }

  if (isLoading) return null
  if (!auth) return null

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/tours', icon: Map, label: 'Tours' },
  ]

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 spy-grid opacity-20" />
      </div>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed left-0 top-0 h-full w-[260px] glass-panel z-50 flex flex-col border-r border-[var(--border-dim)] transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[var(--border-dim)]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="Mystery Served"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-base font-bold font-display tracking-tight text-[var(--text)]">Mystery Served</h1>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className="block relative group"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-[var(--primary)]/10 dark:bg-[var(--primary)]/10 rounded-lg border-l-2 border-[var(--primary)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <div className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text)] group-hover:bg-[var(--surface-hover)]'
                }`}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[var(--border-dim)]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-dim)] border border-[var(--border-dim)]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {auth.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text)] truncate">{auth.email.split('@')[0]}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Admin</p>
            </div>
            <ThemeToggle />
            <div className="flex items-center gap-1">
              <button 
                onClick={async () => {
                  const data = demoDB.exportData()
                  await navigator.clipboard.writeText(data)
                  toast.success("Sync Code Copied!", {
                    description: "Pasted it on your phone's 'Sync from Computer' button."
                  })
                }}
                className="p-2 text-slate-400 hover:text-[var(--primary)] transition-colors"
                title="Sync to Phone"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={async () => {
                  if (confirm("⚠️ FACTORY RESET?\n\nThis will delete ALL tours you created and reset to the default Sherlock demo.\n\nOnly do this if you are stuck or want to see the latest updates (like the 1212 passwords).")) {
                    await demoDB.resetToDemo()
                    window.location.reload()
                  }
                }}
                className="p-2 text-slate-400 hover:text-orange-400 transition-colors"
                title="Reset to Factory Defaults"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[260px] relative z-10 w-full">
        {/* Mobile Header */}
        <div className="lg:hidden h-14 border-b border-[var(--border-dim)] flex items-center justify-between px-4 glass-panel sticky top-0 z-40">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[var(--text)]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-[var(--text)] text-sm">Mystery Served</span>
          <div className="w-8" />
        </div>

        <div className="p-5 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-56px)] lg:min-h-screen">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
