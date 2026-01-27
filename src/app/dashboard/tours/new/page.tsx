'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { demoDB } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Palette,
  FileText,
  Search,
  Sparkles,
  Anchor,
  Ghost
} from 'lucide-react'

export default function NewTourPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: 'St. Petersburg, FL',
    theme: 'detective',
    is_active: false
  })

  const themes = [
    { value: 'detective', label: 'Detective / Sherlock', icon: Search },
    { value: 'witches', label: 'Witches & Crystals', icon: Sparkles },
    { value: 'spy', label: 'Spy / Secret Agent', icon: FileText },
    { value: 'pirates', label: 'Pirates & Treasure', icon: Anchor },
    { value: 'mystery', label: 'General Mystery', icon: Ghost },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error("Name required", { description: "Please enter a tour name." })
      return
    }

    setIsLoading(true)
    const toastId = toast.loading("Creating tour...")

    try {
      const tour = await demoDB.createTour({
        name: formData.name,
        description: formData.description,
        city: formData.city,
        theme: formData.theme,
        cover_image: null,
        is_active: formData.is_active
      })

      toast.success("Tour created", { 
        id: toastId,
        description: "Redirecting to editor..." 
      })
      
      setTimeout(() => {
        router.push(`/dashboard/tours/${tour.id}`)
      }, 500)
    } catch (error) {
      console.error('Failed to create tour:', error)
      toast.error("Failed to create tour", { id: toastId })
      setIsLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto pb-20"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/tours" 
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">Create New Tour</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Set up a new scavenger hunt experience
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="glass-panel p-6 rounded-xl">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-white/5 pb-2">
            <FileText className="w-4 h-4 text-purple-400" />
            Basic Information
          </h2>

          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wide">
                Tour Name <span className="text-purple-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. The Sherlock Holmes Final Exam"
                className="spy-input w-full px-4 py-3 rounded-lg text-sm font-medium"
                autoFocus
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wide">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the tour experience..."
                className="spy-input w-full px-4 py-3 rounded-lg text-sm min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="glass-panel p-6 rounded-xl">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-white/5 pb-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            Location
          </h2>

          <div>
            <label htmlFor="city" className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wide">
              City
            </label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. St. Petersburg, FL"
              className="spy-input w-full px-4 py-3 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Theme */}
        <div className="glass-panel p-6 rounded-xl">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-white/5 pb-2">
            <Palette className="w-4 h-4 text-amber-400" />
            Theme
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {themes.map((theme) => {
              const Icon = theme.icon
              const isSelected = formData.theme === theme.value
              
              return (
                <label
                  key={theme.value}
                  className={`relative flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-purple-600/10 border-purple-500'
                      : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={theme.value}
                    checked={isSelected}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="sr-only"
                  />
                  
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {theme.label}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Status */}
        <div className="glass-panel p-6 rounded-xl">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 rounded-full peer-checked:bg-emerald-500 transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
            <div>
              <p className="font-bold text-white">Make Active</p>
              <p className="text-xs text-slate-500">Active tours are visible to players</p>
            </div>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link 
            href="/dashboard/tours" 
            className="px-5 py-2.5 rounded-lg font-bold text-slate-400 hover:text-white transition-colors text-sm"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isLoading || !formData.name}
            className="btn-primary-glow px-6 py-2.5 rounded-lg font-bold text-white shadow-lg shadow-purple-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Tour
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
