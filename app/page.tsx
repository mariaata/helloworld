import { createSupabaseServerClient } from "../src/lib/supabase/server"
import LoginButton from "./components/LoginButton"
import SignOutButton from "./components/SignOutButton"
import MainContent from "./components/MainContent"
import ThemeWrapper from "./components/ThemeWrapper"
import Link from "next/link"

export default function Page() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', color: 'white', background: 'black', minHeight: '100vh' }}>
      <h1>Basic Test Page</h1>
      <p>If you see this, Next.js routing works!</p>
      <p>Environment check:</p>
      <p>URL exists: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'YES' : 'NO'}</p>
      <p>Key exists: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'YES' : 'NO'}</p>
    </div>
  )
}