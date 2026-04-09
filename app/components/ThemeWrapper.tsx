"use client"
import { useState, useEffect } from "react"
import MainContent from "./MainContent"
import SignOutButton from "./SignOutButton"
import Link from "next/link"

interface ThemeWrapperProps {
  images: any[]
  userId: string
}

export default function ThemeWrapper({ images, userId }: ThemeWrapperProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light'
    if (savedTheme) setTheme(savedTheme)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.body.classList.toggle('light-mode', theme === 'light')
  }, [theme])

  return (
    <div className="min-h-screen bg-black">
      <div className={`sticky top-0 z-50 border-b transition-colors ${
        theme === 'light' 
          ? 'bg-white border-gray-200' 
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
                    ? 'bg-gray-100 hover:bg-gray-200' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
              </button>
              
              <Link
                href="/upload"
                className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                  theme === 'light'
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Upload
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {images.length > 0 ? (
          <MainContent images={images} userId={userId} theme={theme} setTheme={setTheme} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">📸</span>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">No captions yet</h2>
            <p className="text-gray-400 mb-8">Upload an image to get started</p>
            <Link
              href="/upload"
              className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:scale-105 transition-transform"
            >
              Upload Image
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}