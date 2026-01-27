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
  FileText
} from 'lucide-react'

export default function DashboardPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTours()
  }, [])

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
      subtext: 'Currently live' 
    },
    { 
      label: 'Total Tours', 
      value: totalTours, 
      icon: Map, 
      color: 'from-purple-500 to-indigo-500',
      subtext: 'In your library' 
    },
    { 
      label: 'Participants', 
      value: '—', 
      icon: Users, 
      color: 'from-blue-500 to-cyan-500',
      subtext: 'Coming soon' 
    },
    { 
      label: 'Completion Rate', 
      value: '—', 
      icon: TrendingUp, 
      color: 'from-amber-500 to-orange-500',
      subtext: 'Coming soon' 
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-[var(--text)] mb-1">
            Dashboard
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Welcome back! Here's an overview of your tours.
          </p>
        </div>
        <Link 
          href="/dashboard/tours/new"
          className="btn-primary-glow px-5 py-2.5 rounded-lg font-bold text-[var(--text-on-primary)] flex items-center gap-2 shadow-lg shadow-purple-900/10 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Tour
        </Link>
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
    </motion.div>
  )
}
