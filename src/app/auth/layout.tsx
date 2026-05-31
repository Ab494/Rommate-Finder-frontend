export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[460px] xl:w-[520px] bg-sidebar-bg flex-col justify-between p-12 relative overflow-hidden shrink-0">

        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full border-2 border-white" />
          <div className="absolute top-48 left-40 w-40 h-40 rounded-full border border-white" />
          <div className="absolute bottom-24 right-8 w-96 h-96 rounded-full border-2 border-white" />
          <div className="absolute bottom-10 right-28 w-52 h-52 rounded-full border border-white" />
        </div>

        {/* Top content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Roommate Finder</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Find your perfect roommate in Nairobi
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Join thousands of young professionals finding great rooms and compatible roommates across Kenya.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: '🏠', text: 'Verified listings across Nairobi, Mombasa & more' },
              { icon: '🤝', text: 'AI-powered compatibility matching' },
              { icon: '💬', text: 'Secure in-app messaging with roommates' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">
                  {icon}
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom social proof */}
        <div className="relative z-10 border-t border-white/10 pt-8">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['NK', 'AM', 'JO', 'BK'].map((initials, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-sidebar-bg bg-primary-600 flex items-center justify-center text-white text-xs font-bold"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm">
              <span className="text-white font-semibold">2,400+</span> matches made this month
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">Roommate Finder</span>
          </div>

          <div className="animate-slide-up">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
