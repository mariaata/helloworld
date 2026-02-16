"use client"
import { createSupabaseBrowserClient } from "../../src/lib/supabase/client"

export default function LoginButton() {
  const handleSignIn = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      onClick={handleSignIn}
    >
      Sign in with Google
    </button>
  )
}