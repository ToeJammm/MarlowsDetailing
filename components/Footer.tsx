import Link from 'next/link'
import Image from 'next/image'
import { Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12 px-4" style={{ backgroundColor: 'var(--surface-1)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Image
              src="/logo/detailing_logo_dark_no_bg.png"
              alt="Marlow's Detailing"
              width={120}
              height={120}
              className="drop-shadow-[0_4px_16px_rgba(82,116,116,0.2)]"
            />
            <p className="text-gray-500 text-sm text-center md:text-left max-w-xs">
              Premium mobile auto detailing brought to your door.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Navigation</p>
            <Link href="/#services" className="text-gray-400 hover:text-white text-sm transition-colors">
              Services & Pricing
            </Link>
            <Link href="/#how-it-works" className="text-gray-400 hover:text-white text-sm transition-colors">
              How It Works
            </Link>
            <Link href="/book" className="text-brand hover:text-brand-light text-sm font-medium transition-colors">
              Book an Appointment
            </Link>
          </div>

          {/* Social */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <p className="text-gray-500 text-xs uppercase tracking-widest">Follow Us</p>
            <a
              href="https://instagram.com/MarlowsDetailing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Instagram size={18} />
              <span className="text-sm">@MarlowsDetailing</span>
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.05] text-center">
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} Marlow&apos;s Detailing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
