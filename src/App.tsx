import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useLocation } from '@/lib/router'
import { GlassFilters, GlassLink } from '@/components/ui/Glass'
import { Wordmark } from '@/components/ui/Brand'
import { HomePage } from '@/pages/Home'
import { RequestPage } from '@/pages/Request'
import { InboxPage } from '@/pages/Inbox'

export default function App() {
  const { pathname } = useLocation()
  return (
    <>
      <GlassFilters />
      {pathname === '/' ? <HomePage /> : pathname === '/request' ? <RequestPage /> : pathname === '/demo/leads' ? <InboxPage /> : <NotFound />}
    </>
  )
}

function NotFound() {
  useEffect(() => {
    document.title = 'Page not found | S.H.A.R.K. Services'
  }, [])
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center bg-ink px-5 text-center text-white">
      <Wordmark />
      <p className="display mt-12 text-[clamp(5rem,16vw,12rem)] text-white/10">404</p>
      <h1 className="-mt-4 font-display text-[28px] font-bold tracking-[-0.02em]">This page isn't here.</h1>
      <p className="mt-3 text-white/60">The job you're looking for might be on the homepage.</p>
      <GlassLink href="/" variant="red" className="mt-8">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </GlassLink>
    </main>
  )
}
