'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { demoDB, Tour, Stop } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical, MapPin, 
  Key, Camera, Navigation, FileText, ChevronDown
} from 'lucide-react'
import dynamic from 'next/dynamic'

const GpsPicker = dynamic(() => import('@/components/GpsPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-900/50 animate-pulse rounded-lg border border-white/5" />
})

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditTourPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [tour, setTour] = useState<Tour | null>(null)
  const [stops, setStops] = useState<Stop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedStop, setExpandedStop] = useState<string | null>(null)
  const [showNewStopModal, setShowNewStopModal] = useState(false)

  const [tourForm, setTourForm] = useState({
    name: '',
    description: '',
    city: '',
    theme: '',
    is_active: false
  })

  useEffect(() => {
    loadTour()
  }, [id])

  const loadTour = async () => {
    try {
      const tourData = await demoDB.getTour(id)
      if (!tourData) {
        toast.error("Tour not found")
        router.push('/dashboard/tours')
        return
      }
      setTour(tourData)
      setTourForm({
        name: tourData.name,
        description: tourData.description || '',
        city: tourData.city,
        theme: tourData.theme,
        is_active: tourData.is_active
      })

      const stopsData = await demoDB.getStops(id)
      setStops(stopsData)
      setIsLoading(false)
    } catch (err) {
      toast.error("Failed to load tour")
      setIsLoading(false)
    }
  }

  const handleSaveTour = async () => {
    if (!tour) return
    setIsSaving(true)
    try {
      await demoDB.updateTour(tour.id, tourForm)
      toast.success("Changes saved")
    } catch (err) {
      toast.error("Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReorder = async (newOrder: Stop[]) => {
    setStops(newOrder)
    try {
      const updates = newOrder.map((stop, index) => ({
        ...stop,
        stop_number: index + 1
      }))
      for (const stop of updates) {
        await demoDB.updateStop(stop.id, { stop_number: stop.stop_number })
      }
    } catch (err) {
      toast.error("Failed to reorder")
    }
  }

  const handleAddStop = async (stopData: Partial<Stop>) => {
    const toastId = toast.loading("Adding stop...")
    try {
      const newStop = await demoDB.createStop({
        tour_id: id,
        stop_number: stops.length + 1,
        name: stopData.name || 'New Stop',
        address: stopData.address || '',
        story_text: '',
        instructions: '',
        menu_items: [],
        tips: [],
        verification_type: stopData.verification_type || 'text',
        password: '1212',
        gps_lat: null,
        gps_lng: null,
        gps_radius: 50,
        image_url: null,
        transition_text: '',
        next_stop_preview: '',
        ...stopData
      })
      setStops([...stops, newStop])
      setShowNewStopModal(false)
      setExpandedStop(newStop.id)
      toast.success("Stop added", { id: toastId })
    } catch (err) {
      toast.error("Failed to add stop", { id: toastId })
    }
  }

  const handleDeleteStop = async (stopId: string) => {
    const toastId = toast.loading("Deleting stop...")
    try {
      await demoDB.deleteStop(stopId)
      const newStops = stops.filter(s => s.id !== stopId)
      setStops(newStops)
      toast.success("Stop deleted", { id: toastId })
    } catch (err) {
      toast.error("Failed to delete", { id: toastId })
    }
  }

  if (isLoading || !tour) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto pb-20"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#02040A]/80 backdrop-blur-xl -mx-5 px-5 py-4 mb-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/tours" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white font-display tracking-tight flex items-center gap-3">
              {tourForm.name || 'Untitled Tour'}
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                tourForm.is_active 
                  ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/5 text-amber-400 border-amber-500/20'
              }`}>
                {tourForm.is_active ? 'Active' : 'Draft'}
              </span>
            </h1>
          </div>
        </div>
        <button
          onClick={handleSaveTour}
          disabled={isSaving}
          className="btn-primary-glow px-5 py-2 rounded-lg font-bold text-white flex items-center gap-2 text-sm shadow-lg shadow-purple-900/10"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tour Details */}
        <div className="lg:col-span-4 space-y-6">
          <section className="glass-panel p-6 rounded-xl sticky top-24">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-white/5 pb-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Tour Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wide">Name</label>
                <input
                  type="text"
                  value={tourForm.name}
                  onChange={(e) => setTourForm({ ...tourForm, name: e.target.value })}
                  className="spy-input w-full px-4 py-2.5 rounded-lg text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wide">Description</label>
                <textarea
                  value={tourForm.description}
                  onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })}
                  className="spy-input w-full px-4 py-2.5 rounded-lg text-sm min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wide">City</label>
                  <input
                    type="text"
                    value={tourForm.city}
                    onChange={(e) => setTourForm({ ...tourForm, city: e.target.value })}
                    className="spy-input w-full px-4 py-2.5 rounded-lg text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wide">Theme</label>
                  <select
                    value={tourForm.theme}
                    onChange={(e) => setTourForm({ ...tourForm, theme: e.target.value })}
                    className="spy-input w-full px-4 py-2.5 rounded-lg text-sm font-medium appearance-none"
                  >
                    <option value="detective">🔍 Detective</option>
                    <option value="witches">🔮 Witches</option>
                    <option value="spy">🕵️ Spy</option>
                    <option value="pirates">🏴‍☠️ Pirates</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <label className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Active</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={tourForm.is_active}
                      onChange={(e) => setTourForm({ ...tourForm, is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-800 rounded-full peer-checked:bg-emerald-600 transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                  </div>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Stops */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-400" />
              Stops ({stops.length})
            </h2>
            <button
              onClick={() => setShowNewStopModal(true)}
              className="px-4 py-2 rounded-lg bg-teal-500/5 text-teal-400 hover:bg-teal-500/10 border border-teal-500/20 hover:border-teal-500/40 transition-all text-sm font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Stop
            </button>
          </div>

          <Reorder.Group axis="y" values={stops} onReorder={handleReorder} className="space-y-3">
            <AnimatePresence>
              {stops.map((stop) => (
                <EditableStop
                  key={stop.id}
                  stop={stop}
                  isExpanded={expandedStop === stop.id}
                  onToggle={() => setExpandedStop(expandedStop === stop.id ? null : stop.id)}
                  onUpdate={async (updates: Partial<Stop>) => {
                    await demoDB.updateStop(stop.id, updates)
                    setStops(stops.map(s => s.id === stop.id ? { ...s, ...updates } : s))
                  }}
                  onDelete={() => handleDeleteStop(stop.id)}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>

          {stops.length === 0 && (
            <div className="p-10 border border-dashed border-slate-800 rounded-xl text-center">
              <div className="w-14 h-14 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <MapPin className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-slate-500 mb-5 font-medium text-sm">No stops added yet.</p>
              <button
                onClick={() => setShowNewStopModal(true)}
                className="btn-primary-glow px-5 py-2 rounded-lg font-bold text-white text-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add First Stop
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Stop Modal */}
      <AnimatePresence>
        {showNewStopModal && (
          <NewStopModal 
            onClose={() => setShowNewStopModal(false)}
            onAdd={handleAddStop}
            stopNumber={stops.length + 1}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function EditableStop({ stop, isExpanded, onToggle, onUpdate, onDelete }: any) {
  return (
    <Reorder.Item value={stop} id={stop.id}>
      <motion.div 
        layout
        className={`glass-card rounded-xl overflow-hidden border transition-all ${
          isExpanded ? 'border-purple-500/20 ring-1 ring-purple-500/10' : 'border-white/5 hover:border-white/10'
        }`}
      >
        {/* Header */}
        <div 
          className="flex items-center gap-3 p-4 cursor-pointer bg-[#0B101B]/40 hover:bg-[#0B101B]/60 transition-colors"
          onClick={onToggle}
        >
          <div className="cursor-grab active:cursor-grabbing p-1.5 text-slate-600 hover:text-slate-400">
            <GripVertical className="w-4 h-4" />
          </div>

          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner transition-colors ${
            isExpanded ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'
          }`}>
            {stop.stop_number}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm transition-colors ${isExpanded ? 'text-white' : 'text-slate-300'}`}>
              {stop.name}
            </h3>
            <p className="text-[11px] text-slate-500 truncate">{stop.address || 'No address'}</p>
          </div>

          <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
            stop.verification_type === 'gps' ? 'bg-teal-500/5 text-teal-400 border-teal-500/20' :
            stop.verification_type === 'photo' ? 'bg-amber-500/5 text-amber-400 border-amber-500/20' :
            'bg-purple-500/5 text-purple-400 border-purple-500/20'
          }`}>
            {stop.verification_type === 'gps' ? <Navigation className="w-3 h-3" /> :
             stop.verification_type === 'photo' ? <Camera className="w-3 h-3" /> :
             <Key className="w-3 h-3" />}
            {stop.verification_type}
          </div>

          <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5 bg-black/20"
            >
              <div className="p-5 space-y-5">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-wide">Stop Name</label>
                    <input 
                      value={stop.name}
                      onChange={(e) => onUpdate({ name: e.target.value })}
                      className="spy-input w-full px-4 py-2.5 rounded-lg text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-wide">Address</label>
                    <input 
                      value={stop.address}
                      onChange={(e) => onUpdate({ address: e.target.value })}
                      className="spy-input w-full px-4 py-2.5 rounded-lg text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Story & Instructions */}
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-wide">Story Text</label>
                  <textarea 
                    value={stop.story_text}
                    onChange={(e) => onUpdate({ story_text: e.target.value })}
                    className="spy-input w-full px-4 py-2.5 rounded-lg text-sm min-h-[80px]"
                    placeholder="The narrative shown to players..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-wide">Action / Waitress Instructions</label>
                  <textarea 
                    value={stop.instructions}
                    onChange={(e) => onUpdate({ instructions: e.target.value })}
                    className="spy-input w-full px-4 py-2.5 rounded-lg text-sm min-h-[60px]"
                    placeholder="e.g. 'Ask the server for the Blue Envelope'..."
                  />
                </div>

                {/* Media & Appearance */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-wide">Media Type</label>
                    <div className="flex bg-slate-950 rounded-lg p-1 border border-white/5 mb-3">
                      {['image', 'video', 'youtube'].map((type) => (
                        <button
                          key={type}
                          onClick={() => onUpdate({ media_type: type as any })}
                          className={`flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                            stop.media_type === type 
                              ? 'bg-indigo-600 text-white shadow-md' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-wide">Media URL</label>
                    <input 
                      value={stop.image_url || ''}
                      onChange={(e) => onUpdate({ image_url: e.target.value })}
                      className="spy-input w-full px-3 py-2 rounded-lg text-xs"
                      placeholder={stop.media_type === 'youtube' ? 'YouTube Video ID or URL' : 'https://...'}
                    />
                  </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-wide">Background Image (Optional)</label>
                   <input 
                      value={stop.background_image || ''}
                      onChange={(e) => onUpdate({ background_image: e.target.value })}
                      className="spy-input w-full px-4 py-2.5 rounded-lg text-sm"
                      placeholder="Custom background URL for this stop..."
                    />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors w-full sm:w-auto inline-flex">
                    <div className="relative flex-none">
                      <input
                        type="checkbox"
                        checked={stop.is_info_only}
                        onChange={(e) => onUpdate({ is_info_only: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700/50 rounded-full peer-checked:bg-sky-600/80 transition-colors border border-white/10" />
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-slate-300 rounded-full transition-transform peer-checked:translate-x-4 peer-checked:bg-white shadow-sm" />
                    </div>
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                      Story Mode (No Verification Required)
                    </span>
                  </label>
                </div>

                {/* Verification Config */}
                {!stop.is_info_only && (
                  <div className="p-4 rounded-lg bg-slate-900/30 border border-white/5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                      <Key className="w-3 h-3 text-emerald-500" />
                      Verification
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-wide">Type</label>
                        <div className="flex bg-slate-950 rounded-lg p-1 border border-white/5">
                          {['text', 'multiple_choice', 'gps', 'photo'].map((type) => (
                            <button
                              key={type}
                              onClick={() => onUpdate({ verification_type: type as any })}
                              className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
                                stop.verification_type === type 
                                  ? 'bg-purple-600 text-white shadow-md' 
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {type.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                      {stop.verification_type === 'text' && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-wide">Password</label>
                          <input 
                            value={stop.password}
                            onChange={(e) => onUpdate({ password: e.target.value })}
                            className="spy-input w-full px-4 py-2 rounded-lg text-sm font-mono text-center tracking-widest text-emerald-400 bg-emerald-950/20 border-emerald-500/20"
                          />
                        </div>
                      )}

                      {stop.verification_type === 'multiple_choice' && (
                        <div className="md:col-span-2 space-y-3">
                          <label className="text-xs font-bold text-slate-500 ml-1 block uppercase tracking-wide">Options & Correct Answer</label>
                          {(stop.options || []).length === 0 && (
                             <div className="text-xs text-slate-500 italic mb-2">No options added yet.</div>
                          )}
                          {(stop.options || []).map((opt: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                               <input 
                                 type="radio"
                                 name={`correct-${stop.id}`}
                                 checked={stop.correct_answer === opt}
                                 onChange={() => onUpdate({ correct_answer: opt })}
                                 className="accent-emerald-500"
                               />
                               <input
                                 value={opt}
                                 onChange={(e) => {
                                    const newOpts = [...(stop.options || [])];
                                    newOpts[idx] = e.target.value;
                                    onUpdate({ options: newOpts });
                                    if (stop.correct_answer === opt) onUpdate({ correct_answer: e.target.value });
                                 }}
                                 className="spy-input flex-1 px-3 py-1.5 rounded text-sm"
                               />
                               <button 
                                onClick={() => {
                                  const newOpts = (stop.options || []).filter((_: any, i: number) => i !== idx);
                                  onUpdate({ options: newOpts });
                                }}
                                className="p-2 text-red-400 hover:bg-white/5 rounded"
                               >
                                 <Trash2 className="w-3 h-3" />
                               </button>
                            </div>
                          ))}
                          <button
                            onClick={() => onUpdate({ options: [...(stop.options || []), `Option ${(stop.options?.length || 0) + 1}`] })}
                            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Option
                          </button>
                        </div>
                      )}

                      {stop.verification_type === 'gps' && (
                        <div className="col-span-2 space-y-4">
                          <div className="bg-slate-950 rounded-lg p-1 border border-white/5 h-[320px]">
                            <GpsPicker 
                              lat={stop.gps_lat} 
                              lng={stop.gps_lng} 
                              radius={stop.gps_radius}
                              onChange={(lat, lng) => onUpdate({ gps_lat: lat, gps_lng: lng })}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 ml-1 mb-1 block uppercase">Latitude</label>
                              <input 
                                type="number"
                                value={stop.gps_lat || ''}
                                onChange={(e) => onUpdate({ gps_lat: parseFloat(e.target.value) })}
                                className="spy-input w-full px-3 py-2 rounded-lg text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 ml-1 mb-1 block uppercase">Longitude</label>
                              <input 
                                type="number"
                                value={stop.gps_lng || ''}
                                onChange={(e) => onUpdate({ gps_lng: parseFloat(e.target.value) })}
                                className="spy-input w-full px-3 py-2 rounded-lg text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 ml-1 mb-1 block uppercase">Radius (m)</label>
                              <input 
                                type="number"
                                value={stop.gps_radius}
                                onChange={(e) => onUpdate({ gps_radius: parseInt(e.target.value) })}
                                className="spy-input w-full px-3 py-2 rounded-lg text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={onDelete}
                    className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Stop
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Reorder.Item>
  )
}

function NewStopModal({ onClose, onAdd, stopNumber }: any) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [verificationType, setVerificationType] = useState('text')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-md p-6 rounded-xl relative z-10 border border-white/10 shadow-2xl"
      >
        <h2 className="text-lg font-bold text-white mb-5 font-display tracking-tight border-b border-white/5 pb-3">Add New Stop</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Stop Name</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="spy-input w-full px-4 py-3 rounded-lg text-sm"
              placeholder="e.g. Hawkers"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Address</label>
            <input 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="spy-input w-full px-4 py-3 rounded-lg text-sm"
              placeholder="Full street address"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Verification Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'text', label: 'Password', icon: Key },
                { id: 'gps', label: 'GPS', icon: Navigation },
                { id: 'photo', label: 'Photo', icon: Camera }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setVerificationType(opt.id)}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                    verificationType === opt.id
                      ? 'bg-purple-600/10 border-purple-500/50 text-purple-400'
                      : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-white transition-colors text-sm font-bold">Cancel</button>
          <button 
            onClick={() => onAdd({ name: name || `Stop ${stopNumber}`, address, verification_type: verificationType })}
            className="btn-primary-glow px-5 py-2 rounded-lg font-bold text-white text-sm"
          >
            Add Stop
          </button>
        </div>
      </motion.div>
    </div>
  )
}
