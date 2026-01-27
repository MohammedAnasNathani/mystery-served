'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { demoDB, Tour } from '@/lib/supabase'
import { Map, ChevronRight, Loader2, RefreshCw, Smartphone } from 'lucide-react'
import Image from 'next/image'

export default function PlayerLobby() {
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Determine active tours
    const loadTours = async () => {
       // In a real app, we'd filter by is_active on the backend
       // For demo, we get all and filter
       const allTours = await demoDB.getTours()
       setTours(allTours.filter(t => t.is_active))
       setIsLoading(false)
    }
    loadTours()
  }, [])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="mb-8 text-center pt-8 px-6">
        <div className="relative w-16 h-16 mx-auto mb-4">
           <Image src="/logo.png" alt="Mystery Served" fill className="object-contain" />
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-[var(--text)] mb-2">Available Missions</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">Select a tour to begin your investigation.</p>
        
        <button 
          onClick={async () => {
             const data = prompt("ENTER SYNC CODE FROM COMPUTER:\n\n1. Find the Sync button (refresh icon) on your computer.\n2. Click it to copy the long code to your clipboard.\n3. Paste that very long code here.\n\n(It is NOT the 1212 pin)")
             if (data) {
                if (data.length < 50) {
                   alert("❌ That code looks too short. Make sure you copy the long code from the Admin Panel!")
                   return
                }
                const success = demoDB.importData(data)
                if (success) {
                   alert("✅ Sync Successful! Your tours are now updated.")
                   window.location.reload()
                } else {
                   alert("❌ Invalid Code. Please copy the long text from the computer and try again.")
                }
             }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-xs font-bold hover:bg-[var(--primary)]/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync from Computer
        </button>
      </header>

      <div className="flex-1 space-y-4">
        {tours.length === 0 ? (
          <div className="text-center p-8 bg-[var(--surface-dim)] rounded-xl border border-[var(--border-dim)]">
             <p className="text-[var(--text-muted)]">No active missions available.</p>
          </div>
        ) : (
          tours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/play/${tour.id}`} className="block group">
                <div className="glass-card p-5 rounded-xl hover:bg-[var(--surface-hover)] transition-all relative overflow-hidden group-hover:ring-1 ring-[var(--primary)]/50">
                   <div className="flex items-start justify-between gap-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                              {tour.theme || 'Mystery'}
                           </span>
                           <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider flex items-center gap-1">
                              <Map className="w-3 h-3" /> {tour.city}
                           </span>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text)] mb-1 leading-tight group-hover:text-[var(--primary)] transition-colors">
                          {tour.name}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                          {tour.description}
                        </p>
                      </div>
                      <div className="bg-[var(--surface-dim)] p-2.5 rounded-full text-[var(--text)] group-hover:bg-[var(--primary)] group-hover:text-[var(--text-on-primary)] transition-colors">
                         <ChevronRight className="w-5 h-5" />
                      </div>
                   </div>
                   
                   {/* Decoration */}
                   <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--primary)]/10 rounded-full blur-3xl group-hover:bg-[var(--primary)]/20 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      <footer className="mt-8 text-center pb-8">
        <p className="text-xs text-[var(--text-muted)]">
           &copy; {new Date().getFullYear()} Mystery Served.
        </p>
      </footer>
    </div>
  )
}
