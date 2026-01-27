'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Dramatic pause for effect
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (email === 'admin@mysteryserved.com' && password === 'agent007') {
      localStorage.setItem('mystery_served_auth', JSON.stringify({
        email,
        loggedIn: true,
        timestamp: Date.now()
      }))
      router.push('/dashboard')
    } else {
      setError('Access Denied. Invalid Credentials.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Cinematic Background Elements */}
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[var(--deep-space)] to-[var(--deep-space)]" />
      <div className="absolute inset-0 spy-grid opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel rounded-2xl p-8 md:p-10 backdrop-blur-2xl">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative w-32 h-32 mb-6"
            >
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
              <Image
                src="/logo.png"
                alt="Mystery Served"
                fill
                className="object-contain relative z-10 drop-shadow-2xl"
                priority
              />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-center font-display tracking-tight text-[var(--text)]"
            >
              Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">Center</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-[var(--text-muted)] mt-2 font-medium tracking-wide uppercase"
            >
              Authorized Personnel Only
            </motion.p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Agent ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-[var(--text-muted)] group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="spy-input w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-[var(--text)] placeholder:text-[var(--text-muted)] transition-all font-medium"
                    placeholder="agent@mysteryserved.com"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Access Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[var(--text-muted)] group-focus-within:text-teal-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="spy-input w-full pl-10 pr-12 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[var(--text)] placeholder:text-[var(--text-muted)] transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary-glow py-3.5 rounded-xl font-bold text-[var(--text-on-primary)] shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 mt-8 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Restricted Area • Security Level 5 • <span className="text-[var(--text-muted)]/70">v1.2.0</span>
            </p>
          </div>
        </div>
        
        {/* Demo Hint (Subtle) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-[var(--surface-dim)] border border-[var(--border-dim)] text-[10px] text-[var(--text-muted)] backdrop-blur-sm">
            Demo: admin@mysteryserved.com / agent007
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
