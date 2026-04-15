import Image from 'next/image'
import Link from 'next/link'
import { Car, Sparkles, CheckCircle, Star, Droplets, Zap, ArrowRight, Phone, Truck } from 'lucide-react'
import { PRICING, ADDON_PRICING, ADDON_DESCRIPTIONS } from '@/lib/types'

export default function HomePage() {
  return (
    <>
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-[#162828] via-[#0a0a0a] to-[#0a0a0a]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #527474 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-20">
          <Image
            src="/logo/detailing_logo_dark_no_bg.png"
            alt="Marlow's Detailing"
            width={220}
            height={220}
            className="mb-8 drop-shadow-[0_8px_32px_rgba(82,116,116,0.3)]"
            priority
          />

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            Professional Detailing
            <br />
            <span className="text-brand-muted">At Your Door.</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed">
            We bring the equipment, the expertise, and showroom shine
            straight to your driveway.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/book"
              className="bg-brand hover:bg-brand-light text-white font-bold text-base px-8 py-4 rounded-full transition-all duration-200 flex items-center gap-2 justify-center"
            >
              Book Your Detail <ArrowRight size={18} />
            </Link>
            <Link
              href="#services"
              className="border border-white/[0.1] hover:border-brand/60 bg-white/[0.03] hover:bg-white/[0.05] text-gray-300 hover:text-white font-semibold text-base px-8 py-4 rounded-full transition-all duration-200 backdrop-blur-sm"
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
          <div className="w-5 h-9 border border-white/10 rounded-full flex justify-center pt-1.5">
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
            <div className="bg-surface-2 border border-white/[0.07] hover:border-brand/40 rounded-3xl p-7 transition-all duration-300 group shadow-elevation-md hover:shadow-elevation-lg hover:-translate-y-0.5">
              <div className="w-11 h-11 bg-brand/10 rounded-2xl flex items-center justify-center mb-5 shadow-elevation-sm">
                <Sparkles size={20} className="text-brand" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Interior Detail</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Full vacuum, carpet shampoo, drill brush cleaning, wipe-down, and window cleaning. Your cabin will look and smell brand new.
              </p>
              <div className="border-t border-white/[0.06] pt-5 flex justify-between items-center">
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
            <div className="bg-surface-2 border border-white/[0.07] hover:border-brand/40 rounded-3xl p-7 transition-all duration-300 group shadow-elevation-md hover:shadow-elevation-lg hover:-translate-y-0.5">
              <div className="w-11 h-11 bg-brand/10 rounded-2xl flex items-center justify-center mb-5 shadow-elevation-sm">
                <Car size={20} className="text-brand" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Exterior Detail</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Includes door jambs, wheels, foam cannon rinse, and foam agitation wash to restore your car&apos;s shine.
              </p>
              <div className="border-t border-white/[0.06] pt-5 flex justify-between items-center">
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

            {/* Both — featured, highest elevation */}
            <div className="bg-surface-3 border border-brand/25 hover:border-brand/50 rounded-3xl p-7 relative group shadow-elevation-lg hover:shadow-[0_12px_48px_rgba(0,0,0,0.65),0_0_0_1px_rgba(82,116,116,0.15)] transition-all duration-300 hover:-translate-y-0.5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full shadow-brand-sm">
                BEST VALUE
              </div>
              <div className="w-11 h-11 bg-brand/15 rounded-2xl flex items-center justify-center mb-5 shadow-elevation-sm">
                <CheckCircle size={20} className="text-brand" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Interior + Exterior</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                The full treatment — inside and out. Best way to restore your vehicle to
                showroom condition.
              </p>
              <div className="border-t border-brand/15 pt-5 flex justify-between items-center">
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
                    className="bg-surface-1 border border-white/[0.06] hover:border-brand/35 rounded-2xl p-5 transition-all duration-200 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5"
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
      <section id="how-it-works" className="py-24 px-4" style={{ backgroundColor: 'var(--surface-1)' }}>
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
                <div className="text-[80px] font-black text-surface-3 leading-none mb-4 select-none">
                  {step}
                </div>
                <div className="w-12 h-12 bg-surface-3 border border-white/[0.08] rounded-2xl flex items-center justify-center mb-4 -mt-14 shadow-elevation-md">
                  {icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Utility note */}
          <div className="mt-14 bg-surface-2 border border-white/[0.07] rounded-3xl p-7 space-y-4 shadow-elevation-md">
            <p className="text-white font-semibold text-sm">Important — Before You Book</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              For us to come to <span className="text-white font-medium">your location</span>, you must be able to provide access to both a water source (outdoor spigot or hose) and a power outlet. These are required to perform the detail on-site.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              <span className="text-white font-medium">No water or power at your location?</span> No problem — you&apos;re welcome to bring your vehicle to us instead. Just mention it in the notes when booking and we&apos;ll coordinate a drop-off time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <div className="flex items-center gap-2 text-sm">
                <Droplets size={15} className="text-brand shrink-0" />
                <span className="text-gray-400">Water source required for mobile service</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap size={15} className="text-brand shrink-0" />
                <span className="text-gray-400">Power outlet required for mobile service</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPECIAL JOBS ─────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface-2 border border-white/[0.07] rounded-3xl p-8 sm:p-10 shadow-elevation-md">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0 shadow-elevation-sm">
                <Truck size={26} className="text-brand" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-white mb-2">
                  Got a Special Job?
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                  Fleets, motorcycles, RVs, or anything outside the standard booking — give us a call and we&apos;ll work out the details directly.
                </p>
              </div>
              <a
                href="tel:8324492025"
                className="flex items-center gap-2.5 bg-brand hover:bg-brand-light text-white font-bold px-7 py-4 rounded-full transition-all duration-200 shrink-0 text-sm"
              >
                <Phone size={16} />
                (832) 449-2025
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready for a Clean Ride?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Book your appointment in under 2 minutes. We&apos;ll handle the rest.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-light text-white font-bold text-lg px-10 py-4 rounded-full transition-all duration-200 hover:-translate-y-0.5"
          >
            Book Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  )
}
