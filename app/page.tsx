import { createSupabaseServerClient } from "../src/lib/supabase/server"
import LoginButton from "./components/LoginButton"
import SignOutButton from "./components/SignOutButton"
import MainContent from "./components/MainContent"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Page() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/20">
              <span className="text-5xl">😂</span>
            </div>
            <h1 className="text-5xl font-bold text-white dark:text-white light:text-gray-900 mb-3 tracking-tight">Humor Feed</h1>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-lg">Vote on the funniest captions</p>
          </div>
          <LoginButton />
        </div>
      </div>
    )
  }

  const { data: images, error } = await supabase
    .from("images")
    .select("id, url, captions!inner(id, content)")
    .eq("is_public", true)
    .order("created_datetime_utc", { ascending: false})
    .limit(50)

  if (error) {
    console.error("Database error:", error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-lg">Error fetching images: {error.message}</p>
      </div>
    )
  }

  const imagesWithCaptions = images?.filter(img => 
    img.captions && 
    Array.isArray(img.captions) && 
    img.captions.length > 0 &&
    img.captions.some((caption: any) => caption.content && caption.content.trim() !== '')
  ) || []

  return <MainContent images={imagesWithCaptions} userId={session.user.id} />
}