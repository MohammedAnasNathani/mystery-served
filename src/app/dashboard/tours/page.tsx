'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { demoDB, Tour, Stop } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  Copy, 
  Trash2, 
  Edit, 
  MapPin,
  MoreVertical,
  Clock,
  Layers
} from 'lucide-react'

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [tourStops, setTourStops] = useState<Record<string, Stop[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteModal, setDeleteModal] = useState<Tour | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  useEffect(() => {
    loadTours()
  }, [])

  const loadTours = async () => {
    try {
      const data = await demoDB.getTours()
      setTours(data)
      
      const stopsMap: Record<string, Stop[]> = {}
      for (const tour of data) {
        stopsMap[tour.id] = await demoDB.getStops(tour.id)
      }
      setTourStops(stopsMap)
      setIsLoading(false)
    } catch (err) {
      toast.error("Failed to load tours")
      setIsLoading(false)
    }
  }

  const handleDuplicate = async (tour: Tour) => {
    const toastId = toast.loading("Duplicating tour...")
    try {
      await demoDB.duplicateTour(tour.id)
      await loadTours()
      toast.success("Tour duplicated", { 
        id: toastId,
        description: `Copy of "${tour.name}" created.`
      })
      setActiveMenu(null)
    } catch (err) {
      toast.error("Failed to duplicate", { id: toastId })
    }
  }

  const handleDelete = async () => {
    if (deleteModal) {
      const toastId = toast.loading("Deleting tour...")
      try {
        await demoDB.deleteTour(deleteModal.id)
        setDeleteModal(null)
        await loadTours()
        toast.success("Tour deleted", { id: toastId })
      } catch (err) {
        toast.error("Failed to delete", { id: toastId })
      }
    }
  }

  const filteredTours = tours.filter(tour =>
    tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tour.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  }

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white mb-1">
            Tours
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your scavenger hunt experiences
          </p>
        </div>
        <Link 
          href="/dashboard/tours/new"
          className="btn-primary-glow px-5 py-2.5 rounded-lg font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-900/10 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Tour
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search tours..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="spy-input w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 transition-all font-medium"
        />
      </div>

      {/* Tours List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-xl bg-slate-900/20 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="glass-panel rounded-xl p-10 text-center border-dashed border-slate-800">
          <div className="w-14 h-14 rounded-full bg-slate-900/50 flex items-center justify-center mx-auto mb-4 border border-white/5">
            <Layers className="w-7 h-7 text-slate-600" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {searchQuery ? 'No tours found' : 'No tours yet'}
          </h3>
          <p className="text-slate-500 mb-5 text-sm">
            {searchQuery 
              ? 'Try a different search term.' 
              : 'Create your first scavenger hunt tour.'}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/tours/new" className="text-purple-400 hover:text-purple-300 text-sm font-bold inline-flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Create Tour
            </Link>
          )}
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {filteredTours.map((tour) => (
            <motion.div 
              key={tour.id} 
              variants={item}
              className="glass-card rounded-xl p-[1px] group"
            >
              <div className="bg-[#0B101B]/80 rounded-[10px] p-4 flex items-center justify-between backdrop-blur-sm h-full hover:bg-white/[0.03] transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex-1 min-w-0 pr-4 pl-2">
                  <div className="flex items-center gap-3 mb-1">
                    <Link 
                      href={`/dashboard/tours/${tour.id}`}
                      className="text-base font-bold text-slate-100 hover:text-white transition-colors tracking-tight truncate font-display"
                    >
                      {tour.name}
                    </Link>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      tour.is_active 
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/5 text-amber-400 border-amber-500/20'
                    }`}>
                      {tour.is_active ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2 line-clamp-1 max-w-xl font-medium">
                    {tour.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-600" />
                      {tour.city}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-slate-600" />
                      {tourStops[tour.id]?.length || 0} stops
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-600" />
                      {new Date(tour.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === tour.id ? null : tour.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      activeMenu === tour.id ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  <AnimatePresence>
                    {activeMenu === tour.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="absolute right-0 top-10 w-44 glass-panel rounded-lg overflow-hidden z-20 shadow-xl shadow-black/80 border border-white/10"
                      >
                        <div className="p-1">
                          <Link
                            href={`/dashboard/tours/${tour.id}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white w-full transition-colors text-left"
                            onClick={() => setActiveMenu(null)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDuplicate(tour)}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white w-full transition-colors text-left"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Duplicate
                          </button>
                          <div className="h-[1px] bg-white/5 my-1" />
                          <button
                            onClick={() => {
                              setDeleteModal(tour)
                              setActiveMenu(null)
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-sm p-6 rounded-xl relative z-10 border border-red-900/40"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-400 mx-auto border border-red-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white text-center mb-1 font-display">Delete Tour</h2>
              <p className="text-slate-400 text-center mb-6 text-xs leading-relaxed max-w-[250px] mx-auto font-medium">
                Are you sure you want to delete <span className="text-white">"{deleteModal.name}"</span>? This cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30 transition-colors font-bold text-xs"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
