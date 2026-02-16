"use client";
import { createSupabaseBrowserClient } from "../../src/lib/supabase/client";

export default function LoginPage() {
  const signInWithGoogle = async () => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <button
        onClick={signInWithGoogle}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg"
      >
        Sign in with Google
      </button>
    </div>
  );
}