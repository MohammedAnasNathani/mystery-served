export default function PlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--deep-space)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-white pb-20 md:pb-0">
      <main className="max-w-md mx-auto min-h-screen bg-[#0B101B]/50 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
        {/* Mobile-first centered container */}
        <div className="relative z-10 p-5 md:p-8 min-h-screen flex flex-col">
            {children}
        </div>
      </main>
    </div>
  )
}
