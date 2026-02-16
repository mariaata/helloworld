import { createSupabaseServerClient } from "../src/lib/supabase/server"
import LoginButton from "./components/LoginButton"
import SignOutButton from "../app/components/SignOutButton" // Add this

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
    .select("id, url, captions(content)")
    .eq("is_public", true)
    .order("created_datetime_utc", { ascending: false })
    .limit(100)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-red-500 text-lg">Error fetching images: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
          Humor Feed
        </h1>
        <p className="text-gray-400 text-lg">
          The internet's quiet thoughts, out loud.
        </p>
        <div className="mt-6 flex justify-center gap-4 items-center">
          <SignOutButton /> {/* Add sign out button */}
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {images?.map((img: any) => (
          <div
            key={img.id}
            className="group relative w-72 rounded-xl shadow-2xl overflow-hidden transform transition duration-500 hover:scale-105 hover:rotate-1"
          >
            <div className="relative w-full h-56">
              <img src={img.url} alt="Image" className="w-full h-full object-cover" />
              {img.captions && img.captions.length > 0 && (
                <div className="absolute bottom-0 left-0 w-full p-3 bg-black/50 backdrop-blur-sm rounded-b-xl">
                  <p className="text-sm text-gray-100 font-medium">
                    {img.captions[0].content}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}