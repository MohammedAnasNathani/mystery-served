'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { demoDB, Tour, Stop } from '@/lib/supabase'
import { MapPin, ArrowRight, HelpCircle, CheckCircle, XCircle, SkipForward, Play, AlertTriangle, X, Lightbulb } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import dynamic from 'next/dynamic'

// Dynamically import map for the transition view (optional, or just use external link)
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false })

// Sound utility
const playSound = (type: 'success' | 'failure' | 'click' | 'blip') => {
  if (typeof window === 'undefined') return
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  
  osc.connect(gain)
  gain.connect(ctx.destination)
  
  const now = ctx.currentTime
  
  if (type === 'success') {
    osc.type = 'sine'
    osc.frequency.setValueAtTime(523.25, now) // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.1) // C6
    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
    osc.start(now)
    osc.stop(now + 0.3)
  } else if (type === 'failure') {
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(110, now)
    osc.frequency.linearRampToValueAtTime(55, now + 0.2)
    gain.gain.setValueAtTime(0.05, now)
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2)
    osc.start(now)
    osc.stop(now + 0.2)
  } else if (type === 'click') {
    osc.type = 'square'
    osc.frequency.setValueAtTime(1500, now)
    gain.gain.setValueAtTime(0.05, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
    osc.start(now)
    osc.stop(now + 0.05)
  } else if (type === 'blip') {
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    gain.gain.setValueAtTime(0.02, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
    osc.start(now)
    osc.stop(now + 0.1)
  }
}

interface PageProps {
  params: Promise<{ tourId: string }>
}

export default function PlayTourPage({ params }: PageProps) {
  const { tourId } = use(params)
  const router = useRouter()
  
  // Data State
  const [tour, setTour] = useState<Tour | null>(null)
  const [stops, setStops] = useState<Stop[]>([])
  const [loading, setLoading] = useState(true)

  // Game State
  const [currentStopIndex, setCurrentStopIndex] = useState(0)
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'transition' | 'completed'>('intro')
  const [userInput, setUserInput] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [shake, setShake] = useState(0)
  const [showHintModal, setShowHintModal] = useState(false)

  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [agentName, setAgentName] = useState('')

  // Derived State
  const currentStop = stops[currentStopIndex]
  const isLastStop = (stops.length > 0) && (currentStopIndex === stops.length - 1)

  useEffect(() => {
    loadGame()
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const configured = await demoDB.isSupabaseConfigured()
    setIsConnected(configured)
  }

  const loadGame = async () => {
    try {
      const t = await demoDB.getTour(tourId)
      const s = await demoDB.getStops(tourId)
      if (!t) {
         toast.error("Tour not found")
         router.push('/play')
         return
      }
      setTour(t)
      setStops(s)
    } catch (e) {
      toast.error("Failed to load tour")
    } finally {
      setLoading(false)
    }
  }

  const handleStart = () => {
    setGameState('playing')
  }

  const checkAnswer = (answerOverride?: string) => {
    if (!currentStop) return

    // Logic for Info Only
    if (currentStop.is_info_only) {
      handleSuccess()
      return
    }
    
    const answerToCheck = answerOverride !== undefined ? answerOverride : userInput
    let isCorrect = false

    // Logic for Text Password
    if (currentStop.verification_type === 'text') {
       if (answerToCheck.toLowerCase().trim() === currentStop.password.toLowerCase().trim()) {
         isCorrect = true
       }
    }
    // Logic for Multiple Choice
    else if (currentStop.verification_type === 'multiple_choice') {
       if (answerToCheck === currentStop.correct_answer) {
         isCorrect = true
       }
    }
    // Logic for GPS/Photo (Simulated success for now)
    else {
        isCorrect = true
    }

    if (isCorrect) {
      playSound('success')
      handleSuccess()
    } else {
      playSound('failure')
      handleFailure()
    }
  }

  const handleSuccess = () => {
    setShowSuccessOverlay(true)
    
    setTimeout(() => {
      setShowSuccessOverlay(false)
      if (isLastStop) {
        setGameState('completed')
      } else {
        setGameState('transition')
      }
    }, 1500)

    toast.success("Correct!", { icon: '🎉' })
    setUserInput('')
    setFailedAttempts(0)
    setShowHintModal(false)
  }

  const handleFailure = () => {
    setFailedAttempts(prev => prev + 1)
    setShake(prev => prev + 1)
    toast.error("Incorrect code. Try again.")
    
    // Show a tip automatically after 2 failures if enabled and available
    if (failedAttempts === 1 && currentStop.auto_show_hint !== false && currentStop.tips && currentStop.tips.length > 0) {
        toast("Need help? Check the hints!", { icon: '💡' })
    } else if (failedAttempts + 1 >= (currentStop.failures_allowed || 2)) {
        if (currentStop.enable_skip !== false) {
           toast("Stuck? You can now skip this stop.", { icon: '⏭️' })
        }
    }
  }

  const handleSkip = () => {
    toast.info("Skipping stop...")
    handleSuccess()
  }

  const nextStop = () => {
    setCurrentStopIndex(prev => prev + 1)
    setGameState('playing')
    setUserInput('')
    setFailedAttempts(0)
  }

  const renderMedia = () => {
    if (!currentStop.image_url) return null

    const mediaClass = "w-full h-full object-cover"

    if (currentStop.media_type === 'youtube') {
      // Extract video ID from typical youtube URLs
      let videoId = currentStop.image_url
      if (currentStop.image_url.includes('v=')) {
        videoId = currentStop.image_url.split('v=')[1].split('&')[0]
      } else if (currentStop.image_url.includes('youtu.be/')) {
        videoId = currentStop.image_url.split('youtu.be/')[1]
      }

      return (
        <div className="aspect-video w-full">
           <iframe 
             src={`https://www.youtube.com/embed/${videoId}`} 
             className="w-full h-full" 
             allowFullScreen 
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
           />
        </div>
      )
    } 
    
    if (currentStop.media_type === 'video') {
       return (
         <video controls className="w-full max-h-[400px] bg-black">
            <source src={currentStop.image_url} />
            Your browser does not support the video tag.
         </video>
       )
    }

    // Default to image
    return <img src={currentStop.image_url} alt="Stop clue" className={mediaClass} />
  }

  if (loading || !tour) return (
    <div className="flex h-screen items-center justify-center text-[var(--text)] bg-[var(--deep-space)]">
      <div className="w-8 h-8 border-2 border-[var(--primary)] rounded-full animate-spin border-t-transparent" />
    </div>
  )

  // 1. Intro Screen
  if (gameState === 'intro') {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center space-y-8 py-10 px-6 bg-[var(--deep-space)]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
           <div className="w-24 h-24 bg-[var(--primary)]/20 rounded-full mx-auto flex items-center justify-center mb-6 ring-1 ring-[var(--primary)]/50 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
              <Play className="w-10 h-10 text-[var(--primary)] ml-1" />
           </div>
           <h1 className="text-3xl font-bold font-display text-[var(--text)] mb-4">{tour.name}</h1>
           <p className="text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">{tour.description}</p>
        </motion.div>
        
        <div className="w-full max-w-xs space-y-3">
           <button onClick={handleStart} className="w-full btn-primary-glow bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--text-on-primary)] font-bold py-4 rounded-xl shadow-lg shadow-purple-900/40 transition-all text-lg">
             Start Mission
           </button>
           <button onClick={() => router.push('/play')} className="w-full py-3 text-[var(--text-muted)] text-sm hover:text-[var(--text)] transition-colors">
             Back to Lobby
           </button>
        </div>
      </div>
    )
  }

  // 4. Completed Screen
  if (gameState === 'completed') {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center space-y-8 py-10 px-6 bg-[var(--deep-space)] relative overflow-hidden">
        <ReactConfetti recycle={false} numberOfPieces={500} gravity={0.15} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10">
           <div className="w-24 h-24 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center mb-6 ring-1 ring-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
           </div>
           <h1 className="text-4xl font-bold font-display text-[var(--text)] mb-2">Mission Accomplished!</h1>
           <p className="text-emerald-600 dark:text-emerald-400 font-medium italic tracking-widest uppercase text-xs">Credential Status: LEGENDARY</p>
        </motion.div>
        
        <div className="bg-[var(--surface-dim)] p-8 rounded-2xl border border-[var(--border-dim)] max-w-sm mx-auto w-full relative z-10 space-y-6">
           <p className="text-[var(--text-muted)] text-sm">Sign your name to claim your <strong>Certified Sunshine Agent</strong> credentials.</p>
           
           <input 
             type="text"
             value={agentName}
             onChange={(e) => setAgentName(e.target.value)}
             placeholder="ENTER YOUR NAME"
             className="w-full bg-black/40 border-b-2 border-[var(--primary)] py-3 text-center text-xl font-bold tracking-widest text-white uppercase focus:outline-none placeholder:text-white/20"
           />

           {agentName.length > 2 && (
             <motion.button 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               onClick={() => {
                 playSound('success')
                 window.location.href = `/play/${tourId}/certificate?name=${encodeURIComponent(agentName)}&tour=${encodeURIComponent(tour.name)}`
               }}
               className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl shadow-lg shadow-orange-900/40 uppercase tracking-tighter italic flex items-center justify-center gap-2 group"
             >
               Claim Certification
               <div className="bg-white/20 p-1 rounded-full group-hover:translate-x-1 transition-transform">
                 <ArrowRight className="w-4 h-4" />
               </div>
             </motion.button>
           )}
        </div>

        <button onClick={() => router.push('/play')} className="w-full max-w-xs py-3 text-[var(--text-muted)] text-xs hover:text-[var(--text)] transition-colors relative z-10">
          Return to HQ
        </button>
      </div>
    )
  }

  // 2. Gameplay (Playing) & 3. Transition
  const isTransition = gameState === 'transition'

  return (
    <div className="flex flex-col h-full bg-[var(--deep-space)]">
       <Toaster position="top-center" theme="system" />
       
       <AnimatePresence>
         {showSuccessOverlay && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-500/10 backdrop-blur-[2px]"
           >
             <motion.div
               initial={{ scale: 0.5, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 1.2, opacity: 0 }}
               className="flex flex-col items-center gap-4"
             >
               <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                 <CheckCircle className="w-16 h-16 text-white" />
               </div>
               <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">Verified!</h2>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
       
       {/* Header */}
       <div className="flex items-center justify-between p-5 pb-4 border-b border-[var(--border-dim)] bg-[var(--deep-space)]/95 backdrop-blur z-10">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">
              Stop {currentStop.stop_number} / {stops.length}
            </span>
            {isConnected && (
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Live Sync</span>
              </div>
            )}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--primary)] truncate max-w-[150px] text-right">
            {currentStop.name}
          </span>
       </div>

       {/* Main Scrollable Area */}
       <div className="flex-1 overflow-y-auto pb-32 no-scrollbar px-6">
          
          {/* Transition View */ }
          {isTransition ? (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center pt-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center mb-4 ring-1 ring-emerald-500/50 shadow-lg">
                   <CheckCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-[var(--text)] mb-3">Excellent work!</h2>
                   <p className="text-[var(--text-muted)] italic">"{currentStop.transition_text}"</p>
                </div>
                
                <div className="glass-panel p-6 rounded-xl border border-[var(--border-dim)] mt-8 text-left bg-[var(--surface-dim)]">
                   <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Next Destination</h3>
                   <div className="flex items-center gap-3 mb-2">
                       <MapPin className="w-5 h-5 text-[var(--primary)]" />
                       <span className="text-[var(--text)] font-bold text-lg">{stops[currentStopIndex + 1]?.name}</span>
                   </div>
                   <p className="text-sm text-[var(--text-muted)] mb-4">{currentStop.next_stop_preview}</p>
                   
                   {/* Map Link */}
                   {stops[currentStopIndex + 1]?.address && (
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stops[currentStopIndex + 1].address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--surface-hover)] hover:bg-[var(--surface-dim)] text-[var(--text)] rounded-lg text-sm font-bold transition-colors border border-[var(--border-dim)]"
                      >
                         <MapPin className="w-4 h-4" /> Open Maps
                      </a>
                   )}
                </div>
             </motion.div>
          ) : (
            /* Gameplay View */
            <motion.div 
               key={currentStop.id} 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="space-y-6 pt-6"
            >
               {/* Media */}
               {currentStop.image_url && (
                 <div className="rounded-xl overflow-hidden border border-[var(--border-dim)] shadow-2xl bg-black">
                    {renderMedia()}
                 </div>
               )}

               {/* Story */}
               <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-lg leading-relaxed text-[var(--text)] font-sans">{currentStop.story_text}</p>
               </div>

               {/* Instructions - Dossier Style */}
               <motion.div 
                 initial={{ rotate: -1, y: 10 }}
                 animate={{ rotate: 0, y: 0 }}
                 className="dossier-paper p-8 rounded-sm shadow-2xl relative overflow-hidden"
               >
                  {/* Stamp */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="top-secret-stamp text-xs px-2 py-1">Top Secret</div>
                  </div>

                  <h3 className="typewriter-font text-[10px] uppercase tracking-[0.2em] mb-4 opacity-70 border-b border-black/10 pb-2">
                    Mission Directive // Ref: {currentStop.id.slice(0,8)}
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="typewriter-font text-sm leading-relaxed">
                      {currentStop.instructions}
                    </p>
                  </div>

                  {/* Coffee mark decoration */}
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 border-[8px] border-black/5 rounded-full" />
               </motion.div>
            </motion.div>
          )}
       </div>

       {/* Footer / Interaction Area */}
       <div className="fixed bottom-0 left-0 right-0 p-5 bg-[var(--deep-space)]/90 backdrop-blur-xl border-t border-[var(--border-dim)] z-20">
          <div className="max-w-md mx-auto">
             {isTransition ? (
                <button 
                  onClick={nextStop}
                  className="w-full btn-primary-glow bg-[var(--text)] text-[var(--deep-space)] hover:bg-[var(--text-muted)] py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl"
                >
                  Head to Next Stop <ArrowRight className="w-4 h-4" />
                </button>
             ) : (
                <div className="space-y-3">
                   {/* Input based on type */}
                   {currentStop.is_info_only ? (
                      <button 
                        onClick={() => checkAnswer()}
                        className="w-full btn-primary-glow bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-900/20"
                      >
                        Continue
                      </button>
                   ) : currentStop.verification_type === 'multiple_choice' ? (
                      <div className="grid grid-cols-1 gap-2">
                         {currentStop.options?.map((opt, i) => (
                           <button
                             key={i}
                             className={`p-4 rounded-xl text-left font-medium border transition-all ${
                               userInput === opt 
                                 ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--text-on-primary)] shadow-md' 
                                 : 'bg-[var(--surface-dim)] border-[var(--border-dim)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'
                             }`}
                             onClick={() => setUserInput(opt)}
                           >
                             {opt}
                           </button>
                         ))}
                         {userInput && (
                            <button onClick={() => checkAnswer()} className="w-full mt-2 btn-primary-glow bg-[var(--primary)] text-[var(--text-on-primary)] py-3 rounded-xl font-bold shadow-lg">
                               Confirm Selection
                            </button>
                         )}
                      </div>
                   ) : (
                      // Text / Default
                      <div className="relative">
                         <motion.input
                           animate={{ x: shake }}
                           transition={{ type: "spring", stiffness: 300, damping: 10 }}
                           onAnimationComplete={() => setShake(0)}
                           value={userInput}
                           onChange={(e) => setUserInput(e.target.value)}
                           className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-4 text-center text-lg font-bold tracking-widest text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                           placeholder="ENTER CODE"
                           autoComplete="off"
                           autoCorrect="off" 
                           autoCapitalize="characters"
                         />
                         <button 
                             onClick={() => checkAnswer()}
                             className="absolute right-2 top-2 bottom-2 aspect-square bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-lg flex items-center justify-center transition-colors text-[var(--text-on-primary)] shadow-md type-button"
                         >
                            <ArrowRight className="w-5 h-5" />
                         </button>
                      </div>
                   )}

                   {/* Help / Skip Controls */}
                   {!currentStop.is_info_only && (
                       <div className="flex items-center justify-between text-xs font-bold pt-2 px-1">
                           <button 
                              onClick={() => setShowHintModal(true)}
                              className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2"
                           >
                              <HelpCircle className="w-3.5 h-3.5" /> Need a hint?
                           </button>
                           
                           {(currentStop.enable_skip !== false && failedAttempts >= (currentStop.failures_allowed || 2)) && (
                              <button onClick={handleSkip} className="flex items-center gap-1.5 text-red-500 hover:text-red-400 transition-colors py-2">
                                 <SkipForward className="w-3.5 h-3.5" /> Give Up & Skip
                              </button>
                           )}
                       </div>
                   )}
                </div>
             )}
          </div>
       </div>

       {/* Hint Modal */}
       <AnimatePresence>
         {showHintModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                 onClick={() => setShowHintModal(false)}
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                 animate={{ opacity: 1, scale: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.95, y: 10 }}
                 className="glass-panel w-full max-w-sm p-6 rounded-2xl relative z-10 border border-[var(--border-dim)] bg-[var(--surface-dim)] shadow-2xl"
               >
                  <button onClick={() => setShowHintModal(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text)]">
                     <X className="w-5 h-5" />
                  </button>
                  
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 text-amber-500 mx-auto">
                     <Lightbulb className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-[var(--text)] text-center mb-4">Hints</h3>
                  
                  <div className="space-y-3">
                     {currentStop.tips && currentStop.tips.length > 0 ? (
                        currentStop.tips.map((tip, i) => (
                           <div key={i} className="flex gap-3 text-left bg-[var(--surface-hover)] p-3 rounded-lg border border-[var(--border-dim)]">
                              <span className="flex-none w-5 h-5 rounded-full bg-[var(--deep-space)] text-[var(--text-muted)] flex items-center justify-center text-xs font-bold border border-[var(--border-dim)]">
                                {i + 1}
                              </span>
                              <p className="text-sm text-[var(--text)]">{tip}</p>
                           </div>
                        ))
                     ) : (
                        <p className="text-center text-[var(--text-muted)] italic">No specific hints available for this step. Re-read the instructions carefully!</p>
                     )}
                  </div>
                  
                  <button 
                    onClick={() => setShowHintModal(false)}
                    className="w-full mt-6 py-3 bg-[var(--surface-hover)] text-[var(--text)] font-bold rounded-xl text-sm"
                  >
                     Got it
                  </button>
               </motion.div>
            </div>
         )}
       </AnimatePresence>
    </div>
  )
}
