'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Award, Shield, CheckCircle2, Printer, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CertificatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const name = searchParams.get('name') || 'Mystery Agent'
  const tourName = searchParams.get('tour') || 'Sunshine Mission'
  const date = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })
  
  const [certId] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase())

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4 print:p-0 print:bg-white">
      {/* Controls - Hidden on print */}
      <div className="w-full max-w-4xl flex justify-between mb-8 print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Mission
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition-all"
        >
          <Printer className="w-4 h-4" /> Print Certificate
        </button>
      </div>

      {/* Certificate Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl aspect-[1.414/1] bg-white border-[20px] border-slate-900 relative shadow-2xl p-16 flex flex-col items-center justify-between text-slate-900 overflow-hidden"
      >
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[size:20px_20px]" />
        </div>
        
        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 w-20 h-20 border-t-4 border-l-4 border-slate-900/10" />
        <div className="absolute top-4 right-4 w-20 h-20 border-t-4 border-r-4 border-slate-900/10" />
        <div className="absolute bottom-4 left-4 w-20 h-20 border-b-4 border-l-4 border-slate-900/10" />
        <div className="absolute bottom-4 right-4 w-20 h-20 border-b-4 border-r-4 border-slate-900/10" />

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <Shield className="w-16 h-16 text-slate-900" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-[0.2em] italic border-b-4 border-slate-900 pb-2">
            Certificate of Achievement
          </h1>
          <p className="text-xl font-bold uppercase tracking-widest text-slate-500">
            Official Sunshine Agent Credentials
          </p>
        </div>

        {/* Content */}
        <div className="text-center space-y-8 w-full">
          <div>
            <p className="text-lg italic font-medium text-slate-500 mb-2">This is to certify that</p>
            <h2 className="text-6xl font-black text-slate-900 uppercase tracking-tight scale-y-110">
              {name}
            </h2>
          </div>

          <div className="max-w-xl mx-auto border-y border-slate-200 py-6">
            <p className="text-lg leading-relaxed">
              Has successfully completed the demanding fieldwork for <br />
              <strong className="text-2xl uppercase tracking-wider">{tourName}</strong> <br />
              and is hereby recognized as a certified <strong>Mystery Served Field Agent</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full flex justify-between items-end">
          <div className="space-y-2 border-t-2 border-slate-200 pt-4 w-48 text-center">
            <p className="font-bold uppercase tracking-widest text-xs">Date Issued</p>
            <p className="font-black italic underline decoration-slate-300">{date}</p>
          </div>

          {/* Seal */}
          <div className="relative group">
            <div className="w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
               <div className="w-28 h-28 border-4 border-white/30 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 animate-[spin_10s_linear_infinite] opacity-50">
                    <div className="w-full h-full border-4 border-dashed border-white/50 rounded-full" />
                  </div>
                  <Award className="w-16 h-16 text-white" />
               </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-slate-900 text-white px-3 py-1 text-[10px] font-bold rounded uppercase tracking-widest">
              OFFICIAL SEAL
            </div>
          </div>

          <div className="space-y-2 border-t-2 border-slate-200 pt-4 w-48 text-center">
            <p className="font-bold uppercase tracking-widest text-xs">Credential ID</p>
            <p className="font-mono font-bold">#MS-{certId}</p>
          </div>
        </div>

        {/* Small Print */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
          &copy; {new Date().getFullYear()} Mystery Served // All Rights Reserved
        </div>
      </motion.div>
    </div>
  )
}
