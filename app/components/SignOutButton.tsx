"use client"
import { createSupabaseBrowserClient } from "../../src/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function SignOutButton() {
  const router = useRouter()
  
  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-gray-400 hover:text-white text-sm font-medium transition"
    >
      Sign Out
    </button>
  )
}