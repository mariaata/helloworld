"use client"
import { useState, useEffect } from "react"
import VotingCard from "./VotingCard"
import GalleryView from "./GalleryView"

interface MainContentProps {
  images: any[]
  userId: string
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
}

export default function MainContent({ images, userId, theme, setTheme }: MainContentProps) {
  const [viewMode, setViewMode] = useState<'swipe' | 'gallery'>('swipe')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const closeOnboarding = () => {
    setShowOnboarding(false)
    localStorage.setItem('hasSeenOnboarding', 'true')
  }

  return (
    <>
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome! 👋</h2>
            <div className="space-y-4 text-gray-300 mb-6">
              <p><strong className="text-white">Swipe Mode:</strong> Vote on captions one at a time. Tap 👍 or 👎 to rate each caption.</p>
              <p><strong className="text-white">Gallery View:</strong> See all captions at once and vote on any you like. Images with multiple captions stack together.</p>
              <p><strong className="text-white">Your Progress:</strong> Your votes are saved automatically. The counter shows how many you've liked/disliked.</p>
            </div>
            <button
              onClick={closeOnboarding}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center mb-6 px-4">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setViewMode('swipe')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition ${
              viewMode === 'swipe'
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Swipe Mode
          </button>
          <button
            onClick={() => setViewMode('gallery')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition ${
              viewMode === 'gallery'
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Gallery View
          </button>
        </div>
      </div>

      {viewMode === 'swipe' ? (
        <VotingCard 
          images={images} 
          userId={userId}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      ) : (
        <GalleryView images={images} userId={userId} />
      )}
    </>
  )
}