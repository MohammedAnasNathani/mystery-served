'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { demoDB, Tour, Stop } from '@/lib/supabase'
import { MapPin, ArrowRight, HelpCircle, CheckCircle, XCircle, SkipForward, Play, AlertTriangle } from 'lucide-react'
import Confetti from 'react-confetti'
import { Toaster, toast } from 'sonner'
import dynamic from 'next/dynamic'

// Dynamically import map for the transition view (optional, or just use external link)
// For now, simpler to use external Google Maps link
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false })

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

  // Derived State
  const currentStop = stops[currentStopIndex]
  const isLastStop = currentStopIndex === stops.length - 1

  useEffect(() => {
    loadGame()
  }, [])

  const loadGame = async () => {
    const t = await demoDB.getTour(tourId)
    const s = await demoDB.getStops(tourId)
    if (!t) {
       toast.error("Tour not found")
       router.push('/play')
       return
    }
    setTour(t)
    setStops(s)
    setLoading(false)
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
       // userInput holds the selected option
       if (answerToCheck === currentStop.correct_answer) {
         isCorrect = true
       }
    }
    // Logic for GPS/Photo (Simulated success for now or strictly manual override)
    else {
        // For prototype, we treat others as auto-success or manual confirm "I'm here"
        isCorrect = true
    }

    if (isCorrect) {
      handleSuccess()
    } else {
      handleFailure()
    }
  }

  const handleSuccess = () => {
    if (isLastStop) {
      setGameState('completed')
    } else {
      setGameState('transition')
    }
    toast.success("Correct!", { icon: '🎉' })
    setUserInput('')
    setFailedAttempts(0)
  }

  const handleFailure = () => {
    setFailedAttempts(prev => prev + 1)
    setShake(prev => prev + 1)
    toast.error("Incorrect, try again.")
    if (failedAttempts + 1 >= (currentStop.failures_allowed || 3)) {
        toast("Stuck? You can now skip this stop.", { icon: '💡' })
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

  if (loading || !tour) return (
    <div className="flex h-screen items-center justify-center text-white">
      <div className="w-8 h-8 border-2 border-purple-500 rounded-full animate-spin border-t-transparent" />
    </div>
  )

  // 1. Intro Screen
  if (gameState === 'intro') {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center space-y-8 py-10">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
           <div className="w-24 h-24 bg-purple-600/20 rounded-full mx-auto flex items-center justify-center mb-6 ring-1 ring-purple-500/50">
              <Play className="w-10 h-10 text-purple-400 ml-1" />
           </div>
           <h1 className="text-3xl font-bold font-display text-white mb-4">{tour.name}</h1>
           <p className="text-slate-400 leading-relaxed max-w-sm mx-auto">{tour.description}</p>
        </motion.div>
        
        <div className="w-full max-w-xs space-y-3">
           <button onClick={handleStart} className="w-full btn-primary-glow bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/40 transition-all text-lg">
             Start Mission
           </button>
           <button onClick={() => router.push('/play')} className="w-full py-3 text-slate-500 text-sm hover:text-white transition-colors">
             Back to Lobby
           </button>
        </div>
      </div>
    )
  }

  // 4. Completed Screen
  if (gameState === 'completed') {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center space-y-8 py-10">
        <ReactConfetti recycle={false} numberOfPieces={500} gravity={0.15} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
           <div className="w-24 h-24 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center mb-6 ring-1 ring-emerald-500/50">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
           </div>
           <h1 className="text-4xl font-bold font-display text-white mb-2">Mission Accomplished!</h1>
           <p className="text-emerald-400/80 font-medium">Agent Status: LEGENDARY</p>
        </motion.div>
        
        <div className="bg-white/5 p-6 rounded-xl border border-white/5 max-w-sm mx-auto w-full">
           <p className="text-slate-300">You have successfully completed <strong>{tour.name}</strong>.</p>
        </div>

        <button onClick={() => router.push('/play')} className="w-full max-w-xs btn-primary-glow bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all">
          Return to HQ
        </button>
      </div>
    )
  }

  // 2. Gameplay (Playing) & 3. Transition
  // For transition, we show "Success" UI then the next info
  const isTransition = gameState === 'transition'

  return (
    <div className="flex flex-col h-full">
       <Toaster position="top-center" />
       
       {/* Header */}
       <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
            Stop {currentStop.stop_number} / {stops.length}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
            {currentStop.name}
          </span>
       </div>

       {/* Main Scrollable Area */}
       <div className="flex-1 overflow-y-auto space-y-6 pb-20 no-scrollbar">
          
          {/* Transition View: Success Message & Next Preview */}
          {isTransition ? (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center pt-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center mb-4 ring-1 ring-emerald-500/50">
                   <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-white mb-3">Excellent work!</h2>
                   <p className="text-slate-300 italic">"{currentStop.transition_text}"</p>
                </div>
                
                <div className="bg-white/5 p-6 rounded-xl border border-white/5 mt-8 text-left">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Next Destination</h3>
                   <div className="flex items-center gap-3 mb-2">
                       <MapPin className="w-5 h-5 text-purple-400" />
                       <span className="text-white font-bold text-lg">{stops[currentStopIndex + 1]?.name}</span>
                   </div>
                   <p className="text-sm text-slate-400 mb-4">{currentStop.next_stop_preview}</p>
                   
                   {/* Map Link */}
                   {stops[currentStopIndex + 1]?.address && (
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stops[currentStopIndex + 1].address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-bold transition-colors"
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
               className="space-y-6"
            >
               {/* Media */}
               {currentStop.image_url && (
                 <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
                    {/* Basic Image Handling - can use correct types later */}
                    <img src={currentStop.image_url} alt="Stop Clue" className="w-full object-cover" />
                 </div>
               )}

               {/* Story */}
               <div className="prose prose-invert prose-sm">
                  <p className="text-lg leading-relaxed text-slate-200">{currentStop.story_text}</p>
               </div>

               {/* Instructions */}
               <div className="bg-purple-900/10 border border-purple-500/20 p-5 rounded-xl">
                  <h3 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> Mission Directive
                  </h3>
                  <p className="text-purple-100 font-medium italic">{currentStop.instructions}</p>
               </div>
               
               {/* Spacer */}
               <div className="h-4" />
            </motion.div>
          )}
       </div>

       {/* Footer / Interaction Area */}
       <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#0B101B]/90 backdrop-blur-xl border-t border-white/10 z-20">
          <div className="max-w-md mx-auto">
             {isTransition ? (
                <button 
                  onClick={nextStop}
                  className="w-full btn-primary-glow bg-white text-black hover:bg-slate-200 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  Head to Next Stop <ArrowRight className="w-4 h-4" />
                </button>
             ) : (
                <div className="space-y-3">
                   {/* Input based on type */}
                   {currentStop.is_info_only ? (
                      <button 
                        onClick={() => checkAnswer()}
                        className="w-full btn-primary-glow bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold"
                      >
                        Continue
                      </button>
                   ) : currentStop.verification_type === 'multiple_choice' ? (
                      <div className="grid grid-cols-1 gap-2">
                         {currentStop.options?.map((opt, i) => (
                           <button
                             key={i}
                             onClick={() => { setUserInput(opt); checkAnswer(opt); }}  // Immediate check for speed? Or select then submit. Let's do select then auto-submit for simplicity or select state.
                             // Actually user needs to select first. Let's make it select state.
                             // Wait, existing checkAnswer uses `userInput`. 
                             // Let's wrapping it:
                             className={`p-4 rounded-xl text-left font-medium border transition-all ${
                               userInput === opt 
                                 ? 'bg-purple-600 border-purple-400 text-white' 
                                 : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                             }`}
                             onClickCapture={() => setUserInput(opt)} // Just set
                           >
                             {opt}
                           </button>
                         ))}
                         {userInput && (
                            <button onClick={() => checkAnswer()} className="w-full mt-2 btn-primary-glow bg-purple-600 text-white py-3 rounded-xl font-bold">
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
                           className="w-full bg-slate-950/80 border border-white/20 rounded-xl px-4 py-4 text-center text-lg font-bold tracking-widest text-white placeholder:text-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                           placeholder="ENTER PASSWORD"
                         />
                         <button 
                             onClick={() => checkAnswer()}
                             className="absolute right-2 top-2 bottom-2 aspect-square bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center justify-center transition-colors"
                         >
                            <ArrowRight className="w-5 h-5 text-white" />
                         </button>
                      </div>
                   )}

                   {/* Help / Skip Controls */}
                   {!currentStop.is_info_only && (
                       <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-2">
                           <button className="flex items-center gap-1 hover:text-white transition-colors">
                              <HelpCircle className="w-3 h-3" /> Need a hint?
                           </button>
                           
                           {failedAttempts >= (currentStop.failures_allowed || 3) && (
                              <button onClick={handleSkip} className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors">
                                 <SkipForward className="w-3 h-3" /> Give Up & Skip
                              </button>
                           )}
                       </div>
                   )}
                </div>
             )}
          </div>
       </div>
    </div>
  )
}
