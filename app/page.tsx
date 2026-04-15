import Image from 'next/image'
import Link from 'next/link'
import { Car, Sparkles, CheckCircle, Droplets, ArrowRight, Phone, Truck } from 'lucide-react'
import { PRICING, ADDON_PRICING, ADDON_DESCRIPTIONS } from '@/lib/types'

export default function HomePage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />

        {/* Ambient glow */}
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-brand/10 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-brand/6 blur-[70px] pointer-events-none" />

        {/* Micro-dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #527474 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Left edge accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-brand to-transparent opacity-70" />

        {/* Content */}
        <div className="relative z-10 px-6 pt-28 pb-16 w-full max-w-lg mx-auto sm:max-w-2xl">
          {/* Logo */}
          <div className="mb-3 animate-fade-up">
            <Image
              src="/logo/detailing_logo_dark_no_bg.png"
              alt="Marlow's Detailing"
              width={250}
              height={250}
              className="drop-shadow-[0_4px_32px_rgba(82,116,116,0.45)]"
              priority
            />
          </div>

          {/* Eyebrow label */}
          <p className="text-brand text-[11px] font-semibold tracking-[0.22em] uppercase mb-4 animate-fade-up delay-100">
            Mobile Auto Detailing · Knoxville, TN
          </p>

          {/* Main headline */}
          <h1 className="font-display font-extrabold uppercase leading-[0.88] text-white mb-5 animate-fade-up delay-200"
              style={{ fontSize: 'clamp(3.6rem, 18vw, 7rem)' }}>
            Detailing<br />
            <span className="text-brand">You</span><br />
            Can Trust.
          </h1>
          {/* CTAs */}
          <div className="flex flex-col gap-3 mt-8 animate-fade-up delay-400">
            <Link
              href="/book"
              className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-white font-semibold text-[15px] py-[17px] rounded-2xl transition-all duration-200 active:scale-[0.98]"
            >
              Book Your Detail <ArrowRight size={16} />
            </Link>
            <Link
              href="#services"
              className="flex items-center justify-center border border-white/10 hover:border-brand/50 bg-white/[0.03] hover:bg-white/[0.06] text-gray-300 hover:text-white font-medium text-[15px] py-[17px] rounded-2xl transition-all duration-200 backdrop-blur-sm"
            >
              See Services & Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────── */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="mb-10">
            <p className="text-brand text-[11px] font-semibold uppercase tracking-[0.22em] mb-2">
              What We Offer
            </p>
            <h2 className="font-display font-extrabold uppercase text-white leading-tight"
                style={{ fontSize: 'clamp(2.2rem, 10vw, 3.5rem)' }}>
              Services & Pricing
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Every job is done right. No shortcuts, no rushing.
            </p>
          </div>

          {/* Service cards — full-width stacked on mobile, 3-col on desktop */}
          <div className="flex flex-col gap-4 mb-10 md:grid md:grid-cols-3">
            {/* Interior */}
            <div className="bg-surface-2 border border-white/[0.07] hover:border-brand/40 rounded-2xl p-6 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                  <Sparkles size={18} className="text-brand" />
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-white text-2xl uppercase leading-none">
                    ${PRICING.sedan_coupe['Interior Detail']}
                    <span className="text-gray-500 text-sm font-sans font-normal normal-case"> coupe/sedan</span>
                  </p>
                  <p className="font-display font-bold text-gray-400 text-lg uppercase leading-none mt-1">
                    ${PRICING.suv_truck['Interior Detail']}
                    <span className="text-gray-600 text-sm font-sans font-normal normal-case"> SUV/truck</span>
                  </p>
                </div>
              </div>
              <h3 className="font-display font-bold uppercase text-white text-xl mb-2">Interior Detail</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Full vacuum, carpet shampoo, drill brush cleaning, wipe-down, and window cleaning.
              </p>
              <Link href="/book" className="inline-flex items-center gap-1 text-brand hover:text-brand-light text-sm font-semibold group-hover:gap-2 transition-all duration-200">
                Book this <ArrowRight size={13} />
              </Link>
            </div>

            {/* Exterior */}
            <div className="bg-surface-2 border border-white/[0.07] hover:border-brand/40 rounded-2xl p-6 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                  <Car size={18} className="text-brand" />
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-white text-2xl uppercase leading-none">
                    ${PRICING.sedan_coupe['Exterior Detail']}
                    <span className="text-gray-500 text-sm font-sans font-normal normal-case"> coupe/sedan</span>
                  </p>
                  <p className="font-display font-bold text-gray-400 text-lg uppercase leading-none mt-1">
                    ${PRICING.suv_truck['Exterior Detail']}
                    <span className="text-gray-600 text-sm font-sans font-normal normal-case"> SUV/truck</span>
                  </p>
                </div>
              </div>
              <h3 className="font-display font-bold uppercase text-white text-xl mb-2">Exterior Detail</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Door jambs, wheels, foam cannon rinse, and foam agitation wash to restore your car&apos;s shine.
              </p>
              <Link href="/book" className="inline-flex items-center gap-1 text-brand hover:text-brand-light text-sm font-semibold group-hover:gap-2 transition-all duration-200">
                Book this <ArrowRight size={13} />
              </Link>
            </div>

            {/* Both — featured */}
            <div className="relative bg-surface-3 border border-brand/30 hover:border-brand/55 rounded-2xl p-6 transition-all duration-300 group shadow-[0_0_40px_rgba(82,116,116,0.08)]">
              <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent rounded-t-2xl" />
              <div className="absolute -top-3 right-5 bg-brand text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase">
                Best Value
              </div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-brand/15 rounded-xl flex items-center justify-center">
                  <CheckCircle size={18} className="text-brand" />
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-white text-2xl uppercase leading-none">
                    ${PRICING.sedan_coupe['Both']}
                    <span className="text-gray-400 text-sm font-sans font-normal normal-case"> coupe/sedan</span>
                  </p>
                  <p className="font-display font-bold text-gray-400 text-lg uppercase leading-none mt-1">
                    ${PRICING.suv_truck['Both']}
                    <span className="text-gray-500 text-sm font-sans font-normal normal-case"> SUV/truck</span>
                  </p>
                </div>
              </div>
              <h3 className="font-display font-bold uppercase text-white text-xl mb-2">Interior + Exterior</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                The full treatment — inside and out. Best way to restore your vehicle to showroom condition.
              </p>
              <Link href="/book" className="inline-flex items-center gap-1 text-brand hover:text-brand-light text-sm font-semibold group-hover:gap-2 transition-all duration-200">
                Book this <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <p className="text-gray-400 text-sm font-semibold mb-4">Add-On Services</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(ADDON_PRICING) as [keyof typeof ADDON_PRICING, number][]).map(
                ([addon, price]) => (
                  <div
                    key={addon}
                    className="flex items-center gap-4 bg-surface-1 border border-white/[0.06] hover:border-brand/30 rounded-xl px-5 py-4 transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{addon}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-snug">{ADDON_DESCRIPTIONS[addon]}</p>
                    </div>
                    <span className="text-brand font-display font-bold text-lg uppercase shrink-0">+${price}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-surface-1">
        <div className="max-w-lg mx-auto md:max-w-4xl">
          <div className="mb-10">
            <p className="text-brand text-[11px] font-semibold uppercase tracking-[0.22em] mb-2">
              Simple Process
            </p>
            <h2 className="font-display font-extrabold uppercase text-white leading-tight"
                style={{ fontSize: 'clamp(2.2rem, 10vw, 3.5rem)' }}>
              How It Works
            </h2>
          </div>

          {/* Step cards */}
          <div className="flex flex-col">
            {[
              {
                step: '01',
                icon: <Sparkles size={18} className="text-brand" />,
                title: 'Pick Your Date',
                desc: 'Choose from available openings on our calendar — we post up to 2 weeks in advance.',
              },
              {
                step: '02',
                icon: <Car size={18} className="text-brand" />,
                title: 'Tell Us About Your Car',
                desc: 'Fill out a quick form with your vehicle details, services, and location.',
              },
              {
                step: '03',
                icon: <CheckCircle size={18} className="text-brand" />,
                title: 'We Come to You',
                desc: "Once confirmed, we show up with everything we need. You don't lift a finger.",
              },
            ].map(({ step, icon, title, desc }, i) => (
              <div key={step}>
                <div className="relative bg-surface-2 border border-white/[0.07] rounded-2xl p-6 overflow-hidden">
                  {/* Watermark step number */}
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 font-display font-extrabold leading-none select-none pointer-events-none text-brand/[0.06]"
                    style={{ fontSize: '6.5rem' }}
                  >
                    {step}
                  </span>

                  {/* Icon + step label */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <span className="font-display font-bold text-brand text-xs uppercase tracking-[0.18em]">
                      Step {step}
                    </span>
                  </div>

                  <h3 className="font-display font-bold uppercase text-white leading-tight mb-2"
                      style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)' }}>
                    {title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{desc}</p>
                </div>

                {/* Connector line between cards */}
                {i < 2 && (
                  <div className="flex pl-9 py-0">
                    <div className="w-px h-5 bg-gradient-to-b from-brand/25 to-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Requirements note */}
          <div className="mt-8 border border-white/[0.07] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Droplets size={14} className="text-brand shrink-0" />
              <p className="text-white font-semibold text-sm">Before You Book</p>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Mobile service requires access to a <span className="text-gray-300 font-medium">water source</span> and a <span className="text-gray-300 font-medium">power outlet</span> at your location.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              <span className="text-gray-300 font-medium">No water or power?</span> You&apos;re welcome to bring your vehicle to us — just mention it in the booking notes.
            </p>
          </div>
        </div>
      </section>

      {/* ── SPECIAL JOBS ──────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface-2 border border-white/[0.07] rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                <Truck size={22} className="text-brand" />
              </div>
              <div className="flex-1">
                <h2 className="font-display font-extrabold uppercase text-white text-2xl mb-1">
                  Got a Special Job?
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                  Fleets, motorcycles, RVs, or anything outside standard booking — shoot us a text and we&apos;ll work out the details.
                </p>
              </div>
              <a
                href="sms:8324492025"
                className="flex items-center justify-center gap-2.5 bg-brand hover:bg-brand-light text-white font-semibold px-6 py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] shrink-0 text-sm"
              >
                <Phone size={15} />
                Text Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAYMENT METHODS ───────────────────────────────────── */}
      <section className="py-16 px-4 bg-surface-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <p className="text-brand text-[11px] font-semibold uppercase tracking-[0.22em] mb-2">
              Payment
            </p>
            <h2 className="font-display font-extrabold uppercase text-white leading-tight"
                style={{ fontSize: 'clamp(2rem, 9vw, 3rem)' }}>
              We Accept
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Cash', 'Venmo', 'Check', 'PayPal', 'Cash App', 'Apple Pay', 'Zelle'].map((method) => (
              <span
                key={method}
                className="bg-surface-2 border border-white/[0.07] text-gray-300 text-sm font-medium px-4 py-2 rounded-xl"
              >
                {method}
              </span>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-4">Payment is due at the time of service.</p>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-brand text-[11px] font-semibold uppercase tracking-[0.22em] mb-3">
            Ready?
          </p>
          <h2 className="font-display font-extrabold uppercase text-white leading-[0.9] mb-5"
              style={{ fontSize: 'clamp(2.8rem, 14vw, 5rem)' }}>
            Ready for a<br />Clean Ride?
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Book your appointment in under 2 minutes. We&apos;ll handle the rest.
          </p>
          <Link
            href="/book"
            className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-white font-semibold text-[15px] py-[18px] rounded-2xl transition-all duration-200 active:scale-[0.98]"
          >
            Book Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
