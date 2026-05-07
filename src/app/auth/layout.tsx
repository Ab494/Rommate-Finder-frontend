export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-400/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl">🏠</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Roommate Finder</h1>
          <p className="text-gray-500 text-sm mt-1">Find your perfect match</p>
        </div>
        {children}
      </div>
    </div>
  )
}
