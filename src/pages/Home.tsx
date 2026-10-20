import { useEffect } from 'react'
import { Header } from '@/components/site/Header'
import { Hero } from '@/components/site/Hero'
import { Faq, FinalCta, HowItWorks, ServiceMarquee, ServicesGrid, WhyShark } from '@/components/site/Sections'
import { Footer, MobileCta } from '@/components/site/Footer'
import { useReveal } from '@/lib/useReveal'

export function HomePage() {
  useReveal()
  useEffect(() => {
    document.title = 'S.H.A.R.K. Services | Long Island Junk Removal, Handyman, Mechanic & More'
    // arriving from another page with a hash (e.g. /#faq)
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
  }, [])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServiceMarquee />
        <ServicesGrid />
        <HowItWorks />
        <WhyShark />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MobileCta />
      {/* keeps the sticky mobile bar from covering the footer's last line */}
      <div className="h-20 bg-paper-2 md:hidden" />
    </>
  )
}
