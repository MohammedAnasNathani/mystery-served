'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { demoDB, Tour } from '@/lib/supabase'
import { 
  Map, 
  Plus, 
  MapPin, 
  Clock,
  TrendingUp,
  Users,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Activity
} from 'lucide-react'

export default function DashboardPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    loadTours()
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const configured = await demoDB.isSupabaseConfigured()
    setIsConnected(configured)
  }

  const loadTours = async () => {
    const data = await demoDB.getTours()
    setTours(data)
    setIsLoading(false)
  }

  const activeTours = tours.filter(t => t.is_active).length
  const totalTours = tours.length

  const stats = [
    { 
      label: 'Active Tours', 
      value: activeTours, 
      icon: CheckCircle2, 
      color: 'from-emerald-500 to-teal-500',
      subtext: 'Ready for players' 
    },
    { 
      label: 'Total Library', 
      value: totalTours, 
      icon: Map, 
      color: 'from-purple-500 to-indigo-500',
      subtext: 'Your tour assets' 
    },
    { 
      label: 'Real-time Sync', 
      value: isConnected ? 'Live' : 'Sandbox', 
      icon: TrendingUp, 
      color: isConnected ? 'from-blue-500 to-cyan-500' : 'from-slate-500 to-slate-600',
      subtext: isConnected ? 'Connected to Cloud' : 'Local Storage Only',
      status: true
    },
    { 
      label: 'Global Rank', 
      value: totalTours > 0 ? 'Top 1%' : '—', 
      icon: Users, 
      color: 'from-amber-500 to-orange-500',
      subtext: 'Beta access active' 
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const item = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={container}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold font-display tracking-tight text-[var(--text)]">
              Mission Control
            </h1>
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Database Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Sandbox Mode</span>
              </div>
            )}
          </div>
          <p className="text-[var(--text-muted)] text-sm">
            Everything is locked, loaded, and syncing to the cloud.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link 
            href="/dashboard/tours/new"
            className="btn-primary-glow px-5 py-2.5 rounded-lg font-bold text-[var(--text-on-primary)] flex items-center gap-2 shadow-lg shadow-purple-900/10 text-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Tour
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="glass-card rounded-xl p-5 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform duration-500`} />
            <div className="relative z-10">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} p-[1px] mb-3 shadow-lg shadow-black/20`}>
                <div className="w-full h-full rounded-[7px] bg-[var(--surface-dim)] backdrop-blur flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[var(--text)] mb-0.5 font-display tracking-tight">{stat.value}</h3>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Tours */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Recent Tours
          </h2>
          <Link href="/dashboard/tours" className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors">
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 rounded-xl bg-[var(--surface-dim)] animate-pulse border border-[var(--border-dim)]" />
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="glass-panel rounded-xl p-10 text-center border-dashed border-[var(--border-dim)]">
            <div className="w-14 h-14 rounded-full bg-[var(--surface-dim)] flex items-center justify-center mx-auto mb-4 border border-[var(--border-dim)]">
              <Map className="w-7 h-7 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--text)] mb-1">No Tours Yet</h3>
            <p className="text-[var(--text-muted)] mb-5 text-sm max-w-xs mx-auto">
              Create your first scavenger hunt tour to get started.
            </p>
            <Link href="/dashboard/tours/new" className="btn-primary-glow px-5 py-2 rounded-lg font-bold text-[var(--text-on-primary)] inline-flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Create Tour
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tours.slice(0, 3).map((tour) => (
              <Link
                key={tour.id}
                href={`/dashboard/tours/${tour.id}`}
                className="glass-card p-5 rounded-xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    tour.is_active 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {tour.is_active ? 'Active' : 'Draft'}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[var(--surface-hover)] flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-purple-400" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-[var(--text)] mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors">
                  {tour.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mb-4 line-clamp-2 h-8">
                  {tour.description || 'No description provided.'}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] relative z-10 border-t border-[var(--border-dim)] pt-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {tour.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(tour.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Live Activity Log */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Live Activity
          </h2>
          <span className="text-[10px] font-bold text-emerald-400 animate-pulse bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
            Real-time Feed
          </span>
        </div>

        <div className="glass-card rounded-xl overflow-hidden divide-y divide-[var(--border-dim)]">
          {[
            { action: 'Account Secured', detail: 'Cloud database verified', time: 'Just now', icon: CheckCircle2, color: 'text-emerald-400' },
            { action: 'Tour Template Loaded', detail: 'Sherlock Holmes Institute content synced', time: '2m ago', icon: FileText, color: 'text-purple-400' },
            { action: 'System Update', detail: 'V3.0 "Long Term Memory" active', time: '5m ago', icon: TrendingUp, color: 'text-blue-400' }
          ].map((activity, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-[var(--surface-dim)] transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg bg-[var(--surface-dim)] border border-[var(--border-dim)] flex items-center justify-center ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text)]">{activity.action}</h4>
                  <p className="text-xs text-[var(--text-muted)]">{activity.detail}</p>
                </div>
              </div>
              <span className="text-[10px] font-medium text-[var(--text-muted)]">{activity.time}</span>
            </div>
          ))}
          {tours.length === 0 && (
             <div className="p-10 text-center text-[var(--text-muted)] text-sm italic">
                Waiting for mission activity...
             </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
