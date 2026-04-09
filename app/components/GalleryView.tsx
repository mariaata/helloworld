"use client"
import { useState, useMemo, useEffect } from "react"
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

interface GalleryViewProps {
  images: Image[]
  userId: string
}

export default function GalleryView({ images, userId }: GalleryViewProps) {
  const supabase = createSupabaseBrowserClient()
  const [votes, setVotes] = useState<Record<string, number>>({})

  const groupedCards = useMemo(() => {
    const imageMap = new Map<string, Array<{
      captionId: string
      content: string
      imageUrl: string
      imageId: string
    }>>()
    
    images.forEach(image => {
      const seen = new Set<string>()
      const captions = image.captions
        .filter(caption => {
          if (!caption?.content?.trim()) return false
          const normalized = caption.content.trim().toLowerCase()
          if (seen.has(normalized)) return false
          seen.add(normalized)
          return true
        })
        .map(caption => ({
          captionId: caption.id,
          content: caption.content,
          imageUrl: image.url,
          imageId: image.id
        }))
      
      if (captions.length > 0) {
        if (!imageMap.has(image.url)) {
          imageMap.set(image.url, [])
        }
        imageMap.get(image.url)!.push(...captions)
      }
    })
    
    return Array.from(imageMap.entries())
  }, [images])

  const [shuffledGroups, setShuffledGroups] = useState(groupedCards)

  useEffect(() => {
    setShuffledGroups([...groupedCards].sort(() => Math.random() - 0.5))
  }, [groupedCards])

  useEffect(() => {
    const savedVotes = localStorage.getItem(`galleryVotes_${userId}`)
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes))
    }
    loadExistingVotes()
  }, [userId])

  useEffect(() => {
    localStorage.setItem(`galleryVotes_${userId}`, JSON.stringify(votes))
  }, [votes, userId])

  const loadExistingVotes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) return

      const { data: dbVotes } = await supabase
        .from("caption_votes")
        .select("caption_id, vote_value")
        .eq("profile_id", session.user.id)

      if (dbVotes) {
        const voteMap: Record<string, number> = {}
        dbVotes.forEach(v => {
          voteMap[v.caption_id] = v.vote_value
        })
        setVotes(voteMap)
      }
    } catch (error) {
      console.error("Error loading votes:", error)
    }
  }

  const handleVote = async (captionId: string, vote: number) => {
    const newVote = votes[captionId] === vote ? 0 : vote
    
    setVotes(prev => ({
      ...prev,
      [captionId]: newVote
    }))

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        alert("You must be logged in to vote")
        return
      }

      if (newVote === 0) {
        const { error } = await supabase
          .from("caption_votes")
          .delete()
          .eq("caption_id", captionId)
          .eq("profile_id", session.user.id)

        if (error) throw error
      } else {
        const { data: existingVote } = await supabase
          .from("caption_votes")
          .select("id")
          .eq("caption_id", captionId)
          .eq("profile_id", session.user.id)
          .maybeSingle()

        if (existingVote) {
          const { error } = await supabase
            .from("caption_votes")
            .update({ 
              vote_value: newVote,
              modified_datetime_utc: new Date().toISOString()
            })
            .eq("id", existingVote.id)

          if (error) throw error
        } else {
          const { error } = await supabase
            .from("caption_votes")
            .insert({
              profile_id: session.user.id,
              caption_id: captionId,
              vote_value: newVote,
              created_datetime_utc: new Date().toISOString(),
              modified_datetime_utc: new Date().toISOString()
            })

          if (error) throw error
        }
      }

      console.log("✅ Vote saved")
    } catch (error: any) {
      console.error("❌ Error saving vote:", error)
      alert(`Failed to save vote: ${error.message}`)
    }
  }

  const upvoted = Object.values(votes).filter(v => v === 1).length
  const downvoted = Object.values(votes).filter(v => v === -1).length

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex gap-8 justify-center">
        <div className="text-center">
          <p className="text-3xl font-bold text-green-400">{upvoted}</p>
          <p className="text-sm text-gray-400">Liked</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-red-400">{downvoted}</p>
          <p className="text-sm text-gray-400">Disliked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shuffledGroups.map(([imageUrl, cards]) => {
          const remainingCards = cards.filter(card => !votes[card.captionId])
          
          if (remainingCards.length === 0) return null

          const topCard = remainingCards[0]
          const stackCount = remainingCards.length

          return (
            <div
              key={imageUrl}
              className="relative"
            >
              {/* Stack indicator */}
              {stackCount > 1 && (
                <div className="absolute -top-1 -right-1 z-10 bg-purple-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                  {stackCount}
                </div>
              )}

              {/* Stacked shadow effect */}
              {stackCount > 1 && (
                <>
                  <div className="absolute inset-0 bg-white/5 rounded-2xl transform translate-x-1 translate-y-1 -z-10" />
                  {stackCount > 2 && (
                    <div className="absolute inset-0 bg-white/5 rounded-2xl transform translate-x-2 translate-y-2 -z-20" />
                  )}
                </>
              )}

              <div
                className={`bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10 transition-all hover:scale-[1.02] ${
                  votes[topCard.captionId] ? 'opacity-0 scale-95' : 'opacity-100'
                }`}
              >
                <div className="relative aspect-video">
                  <img
                    src={topCard.imageUrl}
                    alt="Meme"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <p className="text-white text-sm leading-relaxed mb-4 line-clamp-3">
                    {topCard.content}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVote(topCard.captionId, 1)}
                      className="flex-1 py-2 rounded-lg transition-all bg-white/10 text-gray-300 hover:bg-green-500 hover:text-white"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleVote(topCard.captionId, -1)}
                      className="flex-1 py-2 rounded-lg transition-all bg-white/10 text-gray-300 hover:bg-red-500 hover:text-white"
                    >
                      👎
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}