"use client"
import { createSupabaseBrowserClient } from "../../src/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function SignOutButton() {
  const router = useRouter()
  
  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
    >
      Sign Out
    </button>
  )
}