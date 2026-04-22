"use client"
import { useState, useEffect } from "react"
import VotingCard from "./VotingCard"
import GalleryView from "./GalleryView"
import ImageUpload from "./ImageUpload"

interface Caption {
  id: string
  content: string
}

interface Image {
  id: string
  url: string
  captions: Caption[]
}

interface MainContentProps {
  images: Image[]
  userId: string
}

export default function MainContent({ images, userId }: MainContentProps) {
  const [viewMode, setViewMode] = useState<"swipe" | "gallery" | "upload">("swipe")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding")
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const closeOnboarding = () => {
    setShowOnboarding(false)
    localStorage.setItem("hasSeenOnboarding", "true")
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/20">
            <span className="text-4xl">😂</span>
          </div>
          <h1 className="text-4xl font-bold text-white dark:text-white light:text-gray-900 mb-2">Humor Feed</h1>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">Vote on the funniest captions</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setViewMode("swipe")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              viewMode === "swipe"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-white/10 dark:bg-white/10 light:bg-black/10 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-black/20"
            }`}
          >
            👆 Swipe Mode
          </button>
          <button
            onClick={() => setViewMode("gallery")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              viewMode === "gallery"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-white/10 dark:bg-white/10 light:bg-black/10 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-black/20"
            }`}
          >
            🖼️ Gallery View
          </button>
          <button
            onClick={() => setViewMode("upload")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              viewMode === "upload"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-white/10 dark:bg-white/10 light:bg-black/10 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-black/20"
            }`}
          >
            📤 Upload
          </button>
        </div>

        {/* Content */}
        {viewMode === "swipe" && (
          <VotingCard 
            images={images} 
            userId={userId}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
        )}
        {viewMode === "gallery" && <GalleryView images={images} userId={userId} />}
        {viewMode === "upload" && <ImageUpload />}

        {/* Onboarding Modal */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-2xl p-8 max-w-md">
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-4">Welcome! 👋</h2>
              <div className="space-y-4 text-gray-300 dark:text-gray-300 light:text-gray-700">
                <div>
                  <p className="font-semibold text-white dark:text-white light:text-gray-900 mb-1">👆 Swipe Mode</p>
                  <p className="text-sm">Vote one caption at a time. Perfect for focused rating!</p>
                </div>
                <div>
                  <p className="font-semibold text-white dark:text-white light:text-gray-900 mb-1">🖼️ Gallery View</p>
                  <p className="text-sm">See all captions at once. Great for quick comparisons!</p>
                </div>
                <div>
                  <p className="font-semibold text-white dark:text-white light:text-gray-900 mb-1">📤 Upload</p>
                  <p className="text-sm">Add your own images and generate captions!</p>
                </div>
              </div>
              <button
                onClick={closeOnboarding}
                className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}