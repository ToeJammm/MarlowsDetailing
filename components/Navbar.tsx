'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#2a2a2a]' : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo/logo-wo-text.jpeg"
            alt="Marlow's Detailing"
            width={40}
            height={40}
            className="rounded-sm"
          />
          <span className="font-bold text-white text-sm tracking-wide hidden sm:block">
            MARLOW&apos;S DETAILING
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#services" className="text-sm text-gray-300 hover:text-white transition-colors">
            Services
          </Link>
          <Link href="/#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">
            How It Works
          </Link>
          <Link
            href="/book"
            className="bg-brand hover:bg-brand-light text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-1"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0f0f0f] border-t border-[#2a2a2a] px-4 py-4 flex flex-col gap-4">
          <Link
            href="/#services"
            onClick={() => setMenuOpen(false)}
            className="text-gray-300 hover:text-white text-sm py-2"
          >
            Services
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMenuOpen(false)}
            className="text-gray-300 hover:text-white text-sm py-2"
          >
            How It Works
          </Link>
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="bg-brand hover:bg-brand-light text-white text-sm font-semibold px-5 py-3 rounded-full text-center transition-colors"
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  )
}
