"use client"
import { useState, useEffect, useMemo } from "react"
import { createSupabaseBrowserClient } from "../../src/lib/supabase/client"

interface Caption {
  id: string
  content: string
}

interface Image {
  id: string
  url: string
  captions: Caption[]
}

interface VotingCardProps {
  images: Image[]
  userId: string
  currentIndex: number
  setCurrentIndex: (index: number) => void
}

export default function VotingCard({ images, userId, currentIndex, setCurrentIndex }: VotingCardProps) {
  const supabase = createSupabaseBrowserClient()

  const allCaptions = useMemo(() => {
    return images.flatMap(image =>
      image.captions
        .filter(caption => caption?.content?.trim())
        .map(caption => ({
          captionId: caption.id,
          content: caption.content,
          imageUrl: image.url,
          imageId: image.id
        }))
    )
  }, [images])

  const [shuffledCaptions, setShuffledCaptions] = useState(allCaptions)
  const [loadedCount, setLoadedCount] = useState(50)
  const [userVote, setUserVote] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [voteHistory, setVoteHistory] = useState<Array<{index: number, vote: number | null}>>([])
  const [voteCounts, setVoteCounts] = useState({ liked: 0, disliked: 0 })

  useEffect(() => {
    setShuffledCaptions([...allCaptions].sort(() => Math.random() - 0.5))
  }, [allCaptions])

  useEffect(() => {
    const savedCounts = localStorage.getItem(`voteCounts_${userId}`)
    if (savedCounts) {
      setVoteCounts(JSON.parse(savedCounts))
    }
    loadExistingVotes()
  }, [userId])

  useEffect(() => {
    localStorage.setItem(`voteCounts_${userId}`, JSON.stringify(voteCounts))
  }, [voteCounts, userId])

  const loadExistingVotes = async () => {
    try {
      const { data: votes } = await supabase
        .from("caption_votes")
        .select("vote_value")
        .eq("profile_id", userId)

      if (votes) {
        const liked = votes.filter(v => v.vote_value === 1).length
        const disliked = votes.filter(v => v.vote_value === -1).length
        setVoteCounts({ liked, disliked })
      }
    } catch (error) {
      console.error("Error loading votes:", error)
    }
  }

  const visibleCaptions = shuffledCaptions.slice(0, loadedCount)
  const currentCard = visibleCaptions[currentIndex]
  const nextCard = visibleCaptions[currentIndex + 1]

  useEffect(() => {
    if (nextCard?.imageUrl) {
      const img = new Image()
      img.src = nextCard.imageUrl
    }
  }, [nextCard])

  useEffect(() => {
    setUserVote(null)
  }, [currentIndex])

  const handleVote = async (vote: number) => {
    if (!currentCard) return

    setUserVote(vote)
    
    setVoteCounts(prev => ({
      liked: prev.liked + (vote === 1 ? 1 : 0),
      disliked: prev.disliked + (vote === -1 ? 1 : 0)
    }))
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        alert("You must be logged in to vote")
        return
      }

      const { data: existingVote } = await supabase
        .from("caption_votes")
        .select("id, vote_value")
        .eq("caption_id", currentCard.captionId)
        .eq("profile_id", session.user.id)
        .maybeSingle()

      if (existingVote) {
        const { error } = await supabase
          .from("caption_votes")
          .update({ 
            vote_value: vote,
            modified_datetime_utc: new Date().toISOString()
          })
          .eq("id", existingVote.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("caption_votes")
          .insert({
            profile_id: session.user.id,
            caption_id: currentCard.captionId,
            vote_value: vote,
            created_datetime_utc: new Date().toISOString(),
            modified_datetime_utc: new Date().toISOString()
          })

        if (error) throw error
      }

      console.log("✅ Vote saved")
      
    } catch (error: any) {
      console.error("❌ Error saving vote:", error)
      alert(`Failed to save vote: ${error.message}`)
      return
    }
    
    setVoteHistory(prev => [...prev, { index: currentIndex, vote }])
    
    setTimeout(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setIsTransitioning(false)
      }, 250)
    }, 400)
  }

  const handleBack = () => {
    if (voteHistory.length === 0) return
    
    const lastVote = voteHistory[voteHistory.length - 1]
    
    setVoteCounts(prev => ({
      liked: prev.liked - (lastVote.vote === 1 ? 1 : 0),
      disliked: prev.disliked - (lastVote.vote === -1 ? 1 : 0)
    }))
    
    setIsTransitioning(true)
    setTimeout(() => {
      const newHistory = [...voteHistory]
      newHistory.pop()
      setVoteHistory(newHistory)
      setCurrentIndex(currentIndex - 1)
      setIsTransitioning(false)
    }, 250)
  }

  const handleLoadMore = () => {
    setLoadedCount(prev => prev + 50)
  }

  if (shuffledCaptions.length === 0) {
    return (
      <div className="text-center text-white py-20">
        <p className="text-gray-400">No images with captions available</p>
      </div>
    )
  }

  if (!currentCard || currentIndex >= visibleCaptions.length) {
    if (loadedCount < shuffledCaptions.length) {
      return (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <p className="text-xl text-white mb-1">Great job!</p>
          <p className="text-gray-400 text-sm mb-6">You've reviewed {loadedCount} captions</p>
          <div className="flex gap-8 justify-center mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{voteCounts.liked}</p>
              <p className="text-sm text-gray-400">Liked</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400">{voteCounts.disliked}</p>
              <p className="text-sm text-gray-400">Disliked</p>
            </div>
          </div>
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
          >
            Load 50 More
          </button>
        </div>
      )
    }

    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🎉</span>
        </div>
        <p className="text-xl text-white mb-1">All done!</p>
        <p className="text-gray-400 text-sm mb-4">You've reviewed all captions</p>
        <div className="flex gap-8 justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{voteCounts.liked}</p>
            <p className="text-sm text-gray-400">Liked</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">{voteCounts.disliked}</p>
            <p className="text-sm text-gray-400">Disliked</p>
          </div>
        </div>
      </div>
    )
  }

  const canGoBack = currentIndex > 0 && voteHistory.length > 0
  const progress = ((currentIndex / visibleCaptions.length) * 100).toFixed(0)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{currentIndex + 1} / {visibleCaptions.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-6 justify-center mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{voteCounts.liked}</p>
          <p className="text-xs text-gray-400">Liked</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">{voteCounts.disliked}</p>
          <p className="text-xs text-gray-400">Disliked</p>
        </div>
      </div>

      <div className={`transition-all duration-250 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="bg-white/5 rounded-3xl overflow-hidden backdrop-blur-sm border border-white/10 shadow-2xl mb-4">
          <div className="relative">
            <img
              src={currentCard.imageUrl}
              alt="Meme"
              className="w-full max-h-[50vh] object-contain bg-black"
            />
          </div>

          <div className="p-5">
            <p className="text-white text-lg text-center leading-relaxed font-light">
              {currentCard.content}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-3">
          <button
            onClick={() => handleVote(-1)}
            disabled={userVote !== null}
            className={`group relative w-16 h-16 rounded-full transition-all duration-200 disabled:opacity-50 ${
              userVote === -1
                ? 'bg-red-500 shadow-lg shadow-red-500/30 scale-110'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <span className="text-2xl">👎</span>
          </button>

          <button
            onClick={() => handleVote(1)}
            disabled={userVote !== null}
            className={`group relative w-16 h-16 rounded-full transition-all duration-200 disabled:opacity-50 ${
              userVote === 1
                ? 'bg-green-500 shadow-lg shadow-green-500/30 scale-110'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <span className="text-2xl">👍</span>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={handleBack}
            disabled={!canGoBack}
            className={`px-6 py-2 text-sm rounded-full font-medium transition-all ${
              !canGoBack
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}