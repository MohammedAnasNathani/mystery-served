'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { demoDB, Tour } from '@/lib/supabase'
import { Map, ChevronRight, Loader2 } from 'lucide-react'
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
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="mb-8 text-center pt-8">
        <div className="relative w-16 h-16 mx-auto mb-4">
           <Image src="/logo.png" alt="Mystery Served" fill className="object-contain" />
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-white mb-2">Available Missions</h1>
        <p className="text-slate-400 text-sm">Select a tour to begin your investigation.</p>
      </header>

      <div className="flex-1 space-y-4">
        {tours.length === 0 ? (
          <div className="text-center p-8 bg-white/5 rounded-xl border border-white/5">
             <p className="text-slate-400">No active missions available.</p>
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
                <div className="glass-card p-5 rounded-xl hover:bg-white/5 transition-all relative overflow-hidden group-hover:ring-1 ring-purple-500/50">
                   <div className="flex items-start justify-between gap-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/20">
                              {tour.theme || 'Mystery'}
                           </span>
                           <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1">
                              <Map className="w-3 h-3" /> {tour.city}
                           </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 leading-tight group-hover:text-purple-400 transition-colors">
                          {tour.name}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {tour.description}
                        </p>
                      </div>
                      <div className="bg-white/10 p-2.5 rounded-full text-white group-hover:bg-purple-600 transition-colors">
                         <ChevronRight className="w-5 h-5" />
                      </div>
                   </div>
                   
                   {/* Decoration */}
                   <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      <footer className="mt-8 text-center pb-8">
        <p className="text-xs text-slate-600">
           &copy; {new Date().getFullYear()} Mystery Served.
        </p>
      </footer>
    </div>
  )
}
