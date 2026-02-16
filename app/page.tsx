import { createSupabaseServerClient } from "../src/lib/supabase/server"
import LoginButton from "./components/LoginButton"
import SignOutButton from "./components/SignOutButton"
import VotingCard from "./components/VotingCard"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Page() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <h1 className="text-4xl text-white mb-6">Humor Feed</h1>
        <LoginButton />
      </div>
    )
  }

  const { data: images, error } = await supabase
    .from("images")
    .select("id, url, captions(id, content)")
    .eq("is_public", true)
    .order("created_datetime_utc", { ascending: false })
    .limit(20)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-red-500 text-lg">Error fetching images: {error.message}</p>
      </div>
    )
  }

  const imagesWithCaptions = images?.filter(img => img.captions && img.captions.length > 0) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Top navigation bar */}
      <div className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-md border-b border-gray-800/50 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Humor Feed</h1>
          </div>
          <SignOutButton />
        </div>
      </div>

      {/* Main content with top padding for fixed nav */}
      <div className="pt-20 px-4 pb-8">
        {imagesWithCaptions.length > 0 ? (
          <VotingCard images={imagesWithCaptions} userId={session.user.id} />
        ) : (
          <div className="text-center text-white">
            <p className="text-xl">No captions available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}