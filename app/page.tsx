import Image from 'next/image'
import Link from 'next/link'
import { Car, Sparkles, CheckCircle, Star, Droplets, Zap, ArrowRight } from 'lucide-react'
import { PRICING, ADDON_PRICING, ADDON_DESCRIPTIONS } from '@/lib/types'

export default function HomePage() {
  return (
    <>
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-[#1a2e2e] via-[#0a0a0a] to-[#0a0a0a]" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #527474 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-20">
          <Image
            src="/logo/logo-w-text.jpeg"
            alt="Marlow's Detailing"
            width={240}
            height={240}
            className="rounded-xl mb-8 shadow-2xl"
            priority
          />

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            Your Car, Transformed.
            <br />
            <span className="text-brand-muted">At Your Door.</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed">
            Professional mobile auto detailing — we bring the equipment, the expertise, and
            the shine straight to you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/book"
              className="bg-brand hover:bg-brand-light text-white font-bold text-base px-8 py-4 rounded-full transition-all duration-200 shadow-lg shadow-brand/20 flex items-center gap-2 justify-center"
            >
              Book Your Detail <ArrowRight size={18} />
            </Link>
            <Link
              href="#services"
              className="border border-[#3a3a3a] hover:border-brand text-gray-300 hover:text-white font-semibold text-base px-8 py-4 rounded-full transition-all duration-200"
            >
              See Services & Pricing
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-2 text-gray-500 text-sm">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-brand fill-brand" />
              ))}
            </div>
            <span>Mobile detailing you can trust</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-9 border-2 border-[#3a3a3a] rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-brand rounded-full" />
          </div>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────── */}
      <section id="services" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand text-sm font-semibold uppercase tracking-widest mb-3">
              What We Offer
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Services & Pricing
            </h2>
            <p className="text-gray-400 mt-3 max-w-lg mx-auto">
              Every job is done right. No shortcuts, no rushing.
            </p>
          </div>

          {/* Service cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Interior */}
            <div className="bg-[#111] border border-[#2a2a2a] hover:border-brand rounded-2xl p-6 transition-colors group">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
                <Sparkles size={20} className="text-brand" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Interior Detail</h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Full vacuum, wipe-down, window cleaning, and deep interior clean. Your cabin
                will look and smell brand new.
              </p>
              <div className="border-t border-[#2a2a2a] pt-4 flex justify-between items-center">
                <div>
                  <p className="text-2xl font-extrabold text-white">
                    ${PRICING.sedan_coupe['Interior Detail']}
                    <span className="text-sm font-normal text-gray-500"> sedan/coupe</span>
                  </p>
                  <p className="text-lg font-bold text-gray-300">
                    ${PRICING.suv_truck['Interior Detail']}
                    <span className="text-sm font-normal text-gray-500"> SUV/truck</span>
                  </p>
                </div>
                <Link href="/book" className="text-brand hover:text-brand-light text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Book <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Exterior */}
            <div className="bg-[#111] border border-[#2a2a2a] hover:border-brand rounded-2xl p-6 transition-colors group">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
                <Car size={20} className="text-brand" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Exterior Detail</h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Hand wash, wheel clean, tire dressing, and exterior wipe-down. Your paint
                will turn heads.
              </p>
              <div className="border-t border-[#2a2a2a] pt-4 flex justify-between items-center">
                <div>
                  <p className="text-2xl font-extrabold text-white">
                    ${PRICING.sedan_coupe['Exterior Detail']}
                    <span className="text-sm font-normal text-gray-500"> sedan/coupe</span>
                  </p>
                  <p className="text-lg font-bold text-gray-300">
                    ${PRICING.suv_truck['Exterior Detail']}
                    <span className="text-sm font-normal text-gray-500"> SUV/truck</span>
                  </p>
                </div>
                <Link href="/book" className="text-brand hover:text-brand-light text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Book <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Both — featured */}
            <div className="bg-brand/10 border border-brand rounded-2xl p-6 relative group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
                BEST VALUE
              </div>
              <div className="w-10 h-10 bg-brand/20 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle size={20} className="text-brand" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Interior + Exterior</h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                The full treatment — inside and out. Best way to restore your vehicle to
                showroom condition.
              </p>
              <div className="border-t border-brand/30 pt-4 flex justify-between items-center">
                <div>
                  <p className="text-2xl font-extrabold text-white">
                    ${PRICING.sedan_coupe['Both']}
                    <span className="text-sm font-normal text-gray-400"> sedan/coupe</span>
                  </p>
                  <p className="text-lg font-bold text-gray-300">
                    ${PRICING.suv_truck['Both']}
                    <span className="text-sm font-normal text-gray-400"> SUV/truck</span>
                  </p>
                </div>
                <Link href="/book" className="text-brand hover:text-brand-light text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Book <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <h3 className="text-white font-bold text-xl mb-6 text-center">
              Add-On Services
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.entries(ADDON_PRICING) as [keyof typeof ADDON_PRICING, number][]).map(
                ([addon, price]) => (
                  <div
                    key={addon}
                    className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 hover:border-brand/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-white font-semibold text-sm">{addon}</p>
                      <span className="text-brand font-bold text-sm">+${price}</span>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {ADDON_DESCRIPTIONS[addon]}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand text-sm font-semibold uppercase tracking-widest mb-3">
              Simple Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <Sparkles size={24} className="text-brand" />,
                title: 'Pick Your Date',
                desc: 'Choose from available openings on our calendar — we post up to 2 weeks in advance.',
              },
              {
                step: '02',
                icon: <Car size={24} className="text-brand" />,
                title: 'Tell Us About Your Car',
                desc: 'Fill out a quick form with your vehicle details, services, and location.',
              },
              {
                step: '03',
                icon: <CheckCircle size={24} className="text-brand" />,
                title: 'We Come to You',
                desc: "Once confirmed, we show up with everything we need. You don't lift a finger.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div className="text-[80px] font-black text-[#1a1a1a] leading-none mb-4 select-none">
                  {step}
                </div>
                <div className="w-12 h-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full flex items-center justify-center mb-4 -mt-14">
                  {icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Utility note */}
          <div className="mt-14 bg-[#111] border border-[#2a2a2a] rounded-xl p-6 flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Droplets size={16} className="text-brand shrink-0" />
                <span>
                  <span className="text-white font-medium">Water access</span> — helpful but not always required. Let us know when booking.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm shrink-0">
              <Zap size={16} className="text-brand shrink-0" />
              <span>
                <span className="text-white font-medium">Power access</span> — required for some services. Specify when booking.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Image
            src="/logo/logo-wo-text.jpeg"
            alt="Marlow's Detailing"
            width={80}
            height={80}
            className="rounded-lg mx-auto mb-6"
          />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready for a Clean Ride?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Book your appointment in under 2 minutes. We&apos;ll handle the rest.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-light text-white font-bold text-lg px-10 py-4 rounded-full transition-all duration-200 shadow-lg shadow-brand/20"
          >
            Book Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  )
}
