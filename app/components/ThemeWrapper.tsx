"use client"
import { useState, useEffect } from "react"
import SignOutButton from "./SignOutButton"
import { usePathname } from "next/navigation"
import { createSupabaseBrowserClient } from "../../src/lib/supabase/client"

interface ThemeWrapperProps {
  children: React.ReactNode
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light'
    if (savedTheme) setTheme(savedTheme)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.body.classList.toggle('light-mode', theme === 'light')
  }, [theme])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    
    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [pathname])

  return (
<div className={`min-h-screen ${
  theme === 'light' 
    ? 'bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-100' 
    : 'bg-black'
}`}>
        <div className={`sticky top-0 z-50 border-b transition-colors ${
  theme === 'light' 
    ? 'bg-white/80 backdrop-blur-2xl border-gray-200' 
    : 'bg-black/80 backdrop-blur-2xl border-white/5'
}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">😂</span>
              </div>
              <h1 className={`text-lg font-semibold ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                Humor Feed
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-lg transition ${
                  theme === 'light' 
                    ? 'bg-gray-100 hover:bg-gray-200 text-purple-200' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
              </button>
              
              {/* ✅ Only show SignOutButton when logged in */}
              {isLoggedIn && <SignOutButton />}
            </div>
          </div>
        </div>
      </div>

      <div className={theme}>
        {children}
      </div>
    </div>
  )
}