'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Instagram } from 'lucide-react'
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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-elevation-lg'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0 group">
          <span className="font-black text-white text-base tracking-tight">MARLOW&apos;S</span>
          <span className="font-black text-brand text-base tracking-tight ml-1.5">DETAILING</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/#services" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
            Services
          </Link>
          <Link href="/#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
            How It Works
          </Link>
          <a
            href="https://instagram.com/marlowsdetailing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
          <Link
            href="/book"
            className="bg-brand hover:bg-brand-light text-white text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200"
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
        <div className="md:hidden bg-surface-2/95 backdrop-blur-2xl border-t border-white/[0.06] px-4 py-4 flex flex-col gap-4 shadow-elevation-lg">
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
          <a
            href="https://instagram.com/marlowsdetailing"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-gray-300 hover:text-white text-sm py-2"
          >
            <Instagram size={16} /> @marlowsdetailing
          </a>
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="bg-brand hover:bg-brand-light text-white text-sm font-semibold px-5 py-3 rounded-full text-center transition-all duration-200"
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  )
}
