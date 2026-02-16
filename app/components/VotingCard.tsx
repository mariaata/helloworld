"use client"
import { useState, useEffect } from "react"
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
}

export default function VotingCard({ images, userId }: VotingCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0)
  const [userVote, setUserVote] = useState<number | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [showUndo, setShowUndo] = useState(false)
  const [lastVote, setLastVote] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()

  const currentImage = images[currentIndex]
  const currentCaption = currentImage?.captions[currentCaptionIndex]
  const nextImage = images[currentIndex + 1]

  useEffect(() => {
    if (nextImage?.url) {
      const img = new Image()
      img.src = nextImage.url
    }
  }, [nextImage])

  useEffect(() => {
    if (!currentCaption) return

    const loadUserVote = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("caption_votes")
          .select("vote_value")
          .eq("caption_id", currentCaption.id)
          .eq("profile_id", userId)
          .maybeSingle()

        if (error) {
          console.error("Error loading vote:", error)
          setIsLoading(false)
          return
        }

        if (data?.vote_value) {
          setTimeout(() => {
            handleNext()
          }, 100)
        } else {
          setUserVote(null)
          setShowUndo(false)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error in loadUserVote:", error)
        setIsLoading(false)
      }
    }

    loadUserVote()
  }, [currentCaption?.id, userId, supabase])

  const handleVote = async (vote: number) => {
    if (!currentCaption || isVoting) return

    setIsVoting(true)
    setLastVote(userVote)

    try {
      const { data: existingVote } = await supabase
        .from("caption_votes")
        .select("id, vote_value")
        .eq("caption_id", currentCaption.id)
        .eq("profile_id", userId)
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
            profile_id: userId,
            caption_id: currentCaption.id,
            vote_value: vote,
            created_datetime_utc: new Date().toISOString(),
            modified_datetime_utc: new Date().toISOString()
          })

        if (error) throw error
      }

      setUserVote(vote)
      setShowUndo(true)
      
      setTimeout(() => {
        setShowUndo(false)
        handleNext()
      }, 800)
    } catch (error: any) {
      console.error("Error voting:", error)
      alert(`Failed to record vote: ${error.message}`)
      setIsVoting(false)
    }
  }

  const handleUndo = async () => {
    if (!currentCaption || isVoting) return

    setIsVoting(true)

    try {
      if (lastVote === null) {
        const { error } = await supabase
          .from("caption_votes")
          .delete()
          .eq("caption_id", currentCaption.id)
          .eq("profile_id", userId)

        if (error) throw error
      } else {
        const { data: existingVote } = await supabase
          .from("caption_votes")
          .select("id")
          .eq("caption_id", currentCaption.id)
          .eq("profile_id", userId)
          .single()

        if (existingVote) {
          const { error } = await supabase
            .from("caption_votes")
            .update({ 
              vote_value: lastVote,
              modified_datetime_utc: new Date().toISOString()
            })
            .eq("id", existingVote.id)

          if (error) throw error
        }
      }

      setUserVote(lastVote)
      setShowUndo(false)
    } catch (error) {
      console.error("Error undoing vote:", error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleNext = () => {
    setIsTransitioning(true)
    setIsVoting(false)

    setTimeout(() => {
      if (currentCaptionIndex < currentImage.captions.length - 1) {
        setCurrentCaptionIndex(currentCaptionIndex + 1)
      } else if (currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setCurrentCaptionIndex(0)
      }
      setIsTransitioning(false)
    }, 300)
  }

  if (!currentImage || !currentCaption) {
    return (
      <div className="text-center text-white py-20">
        <p className="text-2xl mb-2">🎉 All done!</p>
        <p className="text-gray-400">You've reviewed all available captions</p>
      </div>
    )
  }

  const isLastItem = currentIndex === images.length - 1 && currentCaptionIndex === currentImage.captions.length - 1

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center text-gray-500 py-20">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-2xl mx-auto transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-98' : 'opacity-100 scale-100'}`}>
      {/* Progress */}
      <div className="mb-4 text-center">
        <span className="text-gray-500 text-sm">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* Image with caption */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-6 bg-black">
        <img
          src={currentImage.url}
          alt="Meme"
          className="w-full max-h-[65vh] object-contain"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-16 pb-6 px-6">
          <p className="text-white text-lg sm:text-xl text-center font-medium leading-relaxed">
            {currentCaption.content}
          </p>
        </div>
      </div>

      {/* Voting interface */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Downvote */}
        <button
          onClick={() => handleVote(-1)}
          disabled={isVoting}
          className={`group relative w-16 h-16 rounded-full transition-all duration-200 disabled:opacity-50 ${
            userVote === -1
              ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110'
              : 'bg-gray-800 hover:bg-gray-700 hover:scale-110'
          }`}
        >
          <span className="text-3xl">👎</span>
        </button>

        {/* Undo (appears between buttons) */}
        {showUndo && (
          <button
            onClick={handleUndo}
            disabled={isVoting}
            className="px-4 py-2 bg-gray-800 text-white text-sm rounded-full hover:bg-gray-700 transition-all animate-fade-in"
          >
            ↩ Undo
          </button>
        )}

        {/* Upvote */}
        <button
          onClick={() => handleVote(1)}
          disabled={isVoting}
          className={`group relative w-16 h-16 rounded-full transition-all duration-200 disabled:opacity-50 ${
            userVote === 1
              ? 'bg-green-500 shadow-lg shadow-green-500/50 scale-110'
              : 'bg-gray-800 hover:bg-gray-700 hover:scale-110'
          }`}
        >
          <span className="text-3xl">👍</span>
        </button>
      </div>

      {/* Next button */}
      <div className="text-center">
        <button
          onClick={handleNext}
          disabled={isLastItem}
          className={`px-6 py-2 text-sm rounded-full font-medium transition-all ${
            isLastItem
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {isLastItem ? 'No more' : 'Skip →'}
        </button>
      </div>
    </div>
  )
}