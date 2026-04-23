'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  Car,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  X,
} from 'lucide-react'
import { cn, formatDate, formatDateShort, formatTime, calculateTotal, slotsNeeded, getRequiredSlots } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  PRICING,
  ADDON_PRICING,
  ADDON_DESCRIPTIONS,
  type AvailabilitySlot,
  type BookingFormData,
  type ServiceType,
  type AddonType,
  type VehicleType,
} from '@/lib/types'
import { addDays, format, startOfDay, isSameDay, parseISO } from 'date-fns'

type Step = 'calendar' | 'form' | 'success'

const EMPTY_FORM: BookingFormData = {
  client_name: '',
  client_phone: '',
  client_address: '',
  car_make: '',
  car_model: '',
  car_year: '',
  vehicle_type: 'sedan_coupe',
  dirt_rating: 5,
  services: [],
  addons: [],
  has_water: null,
  has_power: null,
  message: '',
}

function getRequiredPhotos(services: ServiceType[]): string[] {
  const needsInterior = services.includes('Interior Detail') || services.includes('Both')
  const needsExterior = services.includes('Exterior Detail') || services.includes('Both')
  const required: string[] = []
  if (needsInterior) required.push('Front Seats', 'Back Seats', 'Trunk')
  if (needsExterior) required.push('Front of Vehicle', 'Rear of Vehicle', 'Side of Vehicle')
  return required
}

export default function BookPage() {
  const [step, setStep] = useState<Step>('calendar')
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [form, setForm] = useState<BookingFormData>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreesDropoff, setAgreesDropoff] = useState(false)
  const [photos, setPhotos] = useState<Record<string, File>>({})

  const today = startOfDay(new Date())
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i))

  // Fetch available slots
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [step])

  useEffect(() => {
    async function load() {
      setLoadingSlots(true)
      try {
        const res = await fetch('/api/slots')
        const json = await res.json()
        setSlots(json.slots ?? [])
      } catch {
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }
    load()
  }, [])

  const slotsForDate = useCallback(
    (dateStr: string) => slots.filter((s) => s.slot_date === dateStr),
    [slots]
  )

  const availableDates = [...new Set(slots.map((s) => s.slot_date))]

  function toggleService(service: ServiceType) {
    setForm((f) => ({
      ...f,
      // Clicking the already-selected option deselects it; otherwise select only this one
      services: f.services.includes(service) ? [] : [service],
    }))
  }

  function toggleAddon(addon: AddonType) {
    setForm((f) => ({
      ...f,
      addons: f.addons.includes(addon)
        ? f.addons.filter((a) => a !== addon)
        : [...f.addons, addon],
    }))
  }

  const total = form.services.length
    ? calculateTotal(form.vehicle_type, form.services, form.addons)
    : 0

  // Multi-slot logic — recalculates whenever services/addons/selectedSlot change
  const neededCount = selectedSlot
    ? slotsNeeded(form.services, form.addons, selectedSlot.slot_time.substring(0, 5))
    : 1
  const { slots: requiredSlots, error: slotConflictError } =
    selectedSlot && form.services.length > 0
      ? getRequiredSlots(selectedSlot, slots, neededCount)
      : { slots: selectedSlot ? [selectedSlot] : [], error: null }
  const extraSlotIds = requiredSlots.slice(1).map((s) => s.id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSlot) return
    if (!form.services.length) {
      setError('Please select at least one service.')
      return
    }
    if (form.has_water === null || form.has_power === null) {
      setError('Please specify water and power access.')
      return
    }
    const needsDropoff = form.has_water === false || form.has_power === false
    if (needsDropoff && !agreesDropoff) {
      setError('Please confirm you agree to bring your vehicle to us.')
      return
    }
    if (slotConflictError) {
      setError(slotConflictError)
      return
    }

    // Validate photos — always required
    const requiredPhotos = getRequiredPhotos(form.services)
    const missing = requiredPhotos.filter((p) => !photos[p])
    if (missing.length > 0) {
      setError(`Please upload the following photo${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Upload photos to Supabase Storage
      let photoUrls: string[] = []
      if (Object.keys(photos).length > 0) {
        const supabase = createClient()
        const uploadId = crypto.randomUUID()

        for (const [label, file] of Object.entries(photos)) {
          const ext = file.name.split('.').pop() || 'jpg'
          const path = `${uploadId}/${label.toLowerCase().replace(/\s+/g, '-')}.${ext}`

          const { error: uploadError } = await supabase.storage
            .from('booking-photos')
            .upload(path, file)

          if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`)

          const { data: { publicUrl } } = supabase.storage
            .from('booking-photos')
            .getPublicUrl(path)

          photoUrls.push(publicUrl)
        }
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          slot_id: selectedSlot.id,
          slot_date: selectedSlot.slot_date,
          slot_time: selectedSlot.slot_time,
          extra_slot_ids: extraSlotIds.length ? extraSlotIds : null,
          photo_urls: photoUrls.length ? photoUrls : null,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Something went wrong. Please try again.')
        return
      }

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-brand/10 border border-brand/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-brand" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Request Received!</h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-2">
            Your booking request has been sent. You&apos;ll get a text once it&apos;s
            confirmed or denied — usually within a few hours.
          </p>
          {selectedSlot && (
            <p className="text-brand font-semibold text-sm mb-8">
              {formatDate(selectedSlot.slot_date)} at {formatTime(selectedSlot.slot_time)}
            </p>
          )}
          <button
            onClick={() => {
              setStep('calendar')
              setSelectedSlot(null)
              setSelectedDate(null)
              setForm(EMPTY_FORM)
            }}
            className="text-gray-400 hover:text-white text-sm underline transition-colors"
          >
            Book another appointment
          </button>
        </div>
      </div>
    )
  }

  // ── CALENDAR ─────────────────────────────────────────────────────────────
  if (step === 'calendar') {
    return (
      <div className="min-h-screen px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-white mb-2">Book Your Appointment</h1>
            <p className="text-gray-400">Pick an available date to get started.</p>
          </div>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-brand" />
            </div>
          ) : (
            <>
              {/* Scrollable 14-day strip */}
              <div className="overflow-x-auto scrollbar-thin-x pb-2 -mx-4 px-4 mb-8">
                <div className="flex gap-2.5" style={{ minWidth: 'max-content' }}>
                  {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const hasSlots = availableDates.includes(dateStr)
                    const isSelected = selectedDate === dateStr
                    const isToday = isSameDay(day, today)

                    return (
                      <button
                        key={dateStr}
                        onClick={() => {
                          if (!hasSlots) return
                          setSelectedDate(dateStr)
                          setSelectedSlot(null)
                        }}
                        disabled={!hasSlots}
                        className={cn(
                          'relative flex flex-col items-center py-3 rounded-2xl border transition-all w-[52px] shrink-0',
                          isSelected
                            ? 'bg-brand border-brand text-white shadow-elevation-md'
                            : hasSlots
                            ? 'bg-surface-2 border-white/[0.07] hover:border-brand/50 cursor-pointer'
                            : 'bg-surface-1 border-white/[0.04] cursor-not-allowed opacity-35'
                        )}
                      >
                        <span className={cn(
                          'text-[10px] uppercase tracking-wider mb-1',
                          isSelected ? 'text-white/80' : 'text-gray-500'
                        )}>
                          {format(day, 'EEE')}
                        </span>
                        <span className={cn(
                          'text-base font-bold leading-none',
                          isSelected ? 'text-white' : hasSlots ? 'text-white' : 'text-gray-600'
                        )}>
                          {format(day, 'd')}
                        </span>
                        <span className={cn(
                          'text-[9px] mt-1',
                          isSelected ? 'text-white/70' : 'text-gray-600'
                        )}>
                          {format(day, 'MMM')}
                        </span>
                        {isToday && !isSelected && (
                          <span className="absolute bottom-1.5 w-1 h-1 bg-brand rounded-full" />
                        )}
                        {hasSlots && !isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand rounded-full" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div>
                  <div className="mb-4">
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Available times</p>
                    <p className="text-white font-bold text-lg">{formatDateShort(selectedDate)}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                    {slotsForDate(selectedDate).map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            'py-3 px-4 rounded-2xl border text-sm font-semibold transition-all',
                            isSelected
                              ? 'bg-brand border-brand text-white'
                              : 'bg-surface-2 border-white/[0.07] text-gray-300 hover:border-brand/50 hover:text-white'
                          )}
                        >
                          {formatTime(slot.slot_time)}
                        </button>
                      )
                    })}
                  </div>

                  {selectedSlot && (
                    <button
                      onClick={() => setStep('form')}
                      className="w-full bg-brand hover:bg-brand-light text-white font-bold py-4 rounded-full transition-colors"
                    >
                      Continue with {formatDateShort(selectedDate)} at{' '}
                      {formatTime(selectedSlot.slot_time)}
                    </button>
                  )}
                </div>
              )}

              {availableDates.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No openings in the next two weeks.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // ── BOOKING FORM ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-4 pt-24 pb-16">
      <div className="max-w-2xl mx-auto">
        {/* Back button + slot summary */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setStep('calendar')}
            className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>
          {selectedSlot && (
            <div className="bg-brand/10 border border-brand/30 text-brand text-sm font-semibold px-4 py-1.5 rounded-full">
              {formatDateShort(selectedSlot.slot_date)} at{' '}
              {formatTime(selectedSlot.slot_time)}
            </div>
          )}
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-1">Your Details</h1>
        <p className="text-gray-400 text-sm mb-8">
          Fill out the form below and we&apos;ll be in touch to confirm.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact info */}
          <Section title="Contact Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                required
                value={form.client_name}
                onChange={(v) => setForm((f) => ({ ...f, client_name: v }))}
                placeholder="Jane Doe"
              />
              <Field
                label="Phone Number"
                required
                type="tel"
                value={form.client_phone}
                onChange={(v) => setForm((f) => ({ ...f, client_phone: v }))}
                placeholder="(832) 555-1234"
              />
            </div>
            <Field
              label="Service Address"
              required
              value={form.client_address}
              onChange={(v) => setForm((f) => ({ ...f, client_address: v }))}
              placeholder="123 Main St, Knoxville TN 37901"
            />
          </Section>

          {/* Vehicle info */}
          <Section title="Vehicle">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field
                label="Year"
                value={form.car_year}
                onChange={(v) => setForm((f) => ({ ...f, car_year: v }))}
                placeholder="2020"
                maxLength={4}
              />
              <Field
                label="Make"
                required
                value={form.car_make}
                onChange={(v) => setForm((f) => ({ ...f, car_make: v }))}
                placeholder="Toyota"
              />
              <Field
                label="Model"
                required
                value={form.car_model}
                onChange={(v) => setForm((f) => ({ ...f, car_model: v }))}
                placeholder="Camry"
              />
            </div>

            {/* Vehicle type */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">Vehicle Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {(['sedan_coupe', 'suv_truck'] as VehicleType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, vehicle_type: type }))}
                    className={cn(
                      'py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 justify-center',
                      form.vehicle_type === type
                        ? 'bg-brand border-brand text-white'
                        : 'bg-[#111] border-[#2a2a2a] text-gray-300 hover:border-brand/50'
                    )}
                  >
                    <Car size={16} />
                    {type === 'sedan_coupe' ? 'Sedan / Coupe' : 'SUV / Truck'}
                  </button>
                ))}
              </div>
            </div>

          </Section>

          {/* Photo uploads — required whenever services are selected */}
          {form.services.length > 0 && (
            <Section title="Vehicle Photos Required">
              <p className="text-gray-400 text-sm leading-relaxed">
                Please upload a clear photo for each angle below so we can prepare properly.
              </p>
              <div className="flex gap-2.5 bg-brand/5 border border-brand/20 rounded-2xl px-4 py-3">
                <span className="text-brand text-sm mt-0.5 shrink-0">*</span>
                <p className="text-gray-400 text-xs leading-relaxed">
                  <span className="text-white font-medium">Pricing disclaimer:</span> We reserve the right to adjust the final price if the car is in bad enough condition that it requires significantly more time and chemicals than expected.
                </p>
              </div>
              <div className="space-y-3">
                {getRequiredPhotos(form.services).map((label) => (
                  <PhotoUpload
                    key={label}
                    label={label}
                    file={photos[label] ?? null}
                    onChange={(file) =>
                      setPhotos((p) => {
                        if (!file) {
                          const next = { ...p }
                          delete next[label]
                          return next
                        }
                        return { ...p, [label]: file }
                      })
                    }
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Services */}
          <Section title="Services">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['Interior Detail', 'Exterior Detail', 'Both'] as ServiceType[]).map(
                (service) => {
                  const price = PRICING[form.vehicle_type][service]
                  const selected = form.services.includes(service)
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={cn(
                        'py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1',
                        selected
                          ? 'bg-brand border-brand text-white'
                          : 'bg-[#111] border-[#2a2a2a] text-gray-300 hover:border-brand/50'
                      )}
                    >
                      <span>{service}</span>
                      <span className={cn('text-xs font-normal', selected ? 'text-brand-muted' : 'text-gray-500')}>
                        ${price}
                      </span>
                    </button>
                  )
                }
              )}
            </div>

            {/* Add-ons */}
            <div>
              <p className="text-sm text-gray-400 mb-3">Add-Ons (optional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.entries(ADDON_PRICING) as [AddonType, number][]).map(
                  ([addon, price]) => {
                    const selected = form.addons.includes(addon)
                    return (
                      <button
                        key={addon}
                        type="button"
                        onClick={() => toggleAddon(addon)}
                        className={cn(
                          'py-3 px-4 rounded-xl border text-sm text-left transition-all',
                          selected
                            ? 'bg-brand/10 border-brand text-white'
                            : 'bg-[#111] border-[#2a2a2a] text-gray-300 hover:border-brand/50'
                        )}
                      >
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-semibold">{addon}</span>
                          <span className={cn('text-xs', selected ? 'text-brand' : 'text-gray-500')}>
                            +${price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{ADDON_DESCRIPTIONS[addon]}</p>
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {/* Multi-slot summary / conflict warning */}
            {form.services.length > 0 && selectedSlot && (
              slotConflictError ? (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{slotConflictError}</p>
                </div>
              ) : neededCount > 1 ? (
                <div className="flex items-start gap-3 bg-brand/5 border border-brand/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="text-brand shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">
                    This job will book{' '}
                    <span className="text-white font-semibold">{neededCount} time slots</span>
                    {' '}({requiredSlots.map((s) => formatTime(s.slot_time)).join(', ')}).
                  </p>
                </div>
              ) : null
            )}

            {/* Total estimate */}
            {total > 0 && (
              <div className="bg-brand/5 border border-brand/20 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Estimated Total</span>
                <span className="text-brand font-bold text-xl">${total}</span>
              </div>
            )}
          </Section>

          {/* Utilities */}
          <Section title="Water & Power Access">
            <p className="text-gray-400 text-sm mb-4">
              Let us know what&apos;s available at the service location.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToggleField
                label="Water Access"
                hint="Outdoor spigot or hose nearby"
                value={form.has_water}
                onChange={(v) => {
                  setForm((f) => ({ ...f, has_water: v }))
                  if (v && form.has_power !== false) setAgreesDropoff(false)
                }}
              />
              <ToggleField
                label="Power Access"
                hint="Outdoor outlet or extension cord"
                value={form.has_power}
                onChange={(v) => {
                  setForm((f) => ({ ...f, has_power: v }))
                  if (v && form.has_water !== false) setAgreesDropoff(false)
                }}
              />
            </div>

            {/* Drop-off acknowledgment — shown when water OR power is No */}
            {(form.has_water === false || form.has_power === false) && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
                <p className="text-amber-300 text-sm font-semibold">Mobile service requires water and power</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Since you don&apos;t have both available, you&apos;re welcome to bring your vehicle to us instead.
                  There is <span className="text-white font-medium">no indoor waiting area</span>, but we&apos;ll have a chair and water bottles ready for you outside in the garage while we work.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreesDropoff}
                    onChange={(e) => setAgreesDropoff(e.target.checked)}
                    className="mt-0.5 accent-brand w-4 h-4 shrink-0"
                  />
                  <span className="text-gray-300 text-sm">
                    I understand I need to bring my vehicle to Marlow&apos;s Detailing and that there is no indoor waiting area (a chair and water bottles will be provided outside).
                  </span>
                </label>
              </div>
            )}
          </Section>

          {/* Notes */}
          <Section title="Anything Else?">
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Gate code, parking instructions, specific concerns about the vehicle..."
              rows={4}
              className="w-full bg-[#111] border border-[#2a2a2a] hover:border-[#3a3a3a] focus:border-brand rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 resize-none outline-none transition-colors"
            />
          </Section>

          {/* Payment methods */}
          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 space-y-3">
            <p className="text-white font-bold text-base">Accepted Payment Methods</p>
            <p className="text-gray-500 text-sm">Payment is due at the time of service. Tips are always appreciated!</p>
            <div className="flex flex-wrap gap-2">
              {['Cash', 'Venmo', 'Check', 'PayPal', 'Cash App', 'Apple Pay', 'Zelle'].map((method) => (
                <span key={method} className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg">
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing disclaimer */}
          <p className="text-gray-600 text-xs leading-relaxed text-center px-2">
            We reserve the right to adjust the final price if the car is in bad enough condition that it requires significantly more time and chemicals than expected.
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* SMS opt-in notice */}
          <p className="text-center text-gray-500 text-xs leading-relaxed px-2">
            By submitting this request, you agree to receive SMS text messages from Marlow&apos;s Detailing regarding your booking confirmation, updates, and service status.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand hover:bg-brand-light disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full transition-colors flex items-center justify-center gap-2 text-base"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Submitting...
              </>
            ) : (
              'Submit Booking Request'
            )}
          </button>
          <p className="text-center text-gray-600 text-xs">
            You&apos;ll receive a text confirmation once your booking is approved.
          </p>
        </form>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 space-y-4">
      <h2 className="text-white font-bold text-base">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = 'text',
  maxLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
  type?: string
  maxLength?: number
}) {
  return (
    <div>
      <label className="text-sm text-gray-400 block mb-1.5">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] hover:border-[#3a3a3a] focus:border-brand rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors"
      />
    </div>
  )
}

function ToggleField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: boolean | null
  onChange: (v: boolean) => void
}) {
  return (
    <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-4">
      <p className="text-white text-sm font-semibold mb-0.5">{label}</p>
      <p className="text-gray-500 text-xs mb-3">{hint}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-semibold transition-all border',
            value === true
              ? 'bg-brand border-brand text-white'
              : 'bg-[#111] border-[#2a2a2a] text-gray-400 hover:border-brand/50'
          )}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-semibold transition-all border',
            value === false
              ? 'bg-[#2a1a1a] border-red-500/50 text-red-400'
              : 'bg-[#111] border-[#2a2a2a] text-gray-400 hover:border-red-500/30'
          )}
        >
          No
        </button>
      </div>
    </div>
  )
}

function PhotoUpload({
  label,
  file,
  onChange,
}: {
  label: string
  file: File | null
  onChange: (file: File | null) => void
}) {
  const preview = file ? URL.createObjectURL(file) : null

  return (
    <div>
      <label className="text-sm text-gray-400 block mb-1.5">
        {label} <span className="text-brand">*</span>
      </label>
      {file ? (
        <div className="flex items-center gap-3 bg-brand/5 border border-brand/30 rounded-xl p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview!} alt={label} className="w-14 h-14 object-cover rounded-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{file.name}</p>
            <p className="text-gray-500 text-xs mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-gray-500 hover:text-white transition-colors p-1"
            aria-label="Remove photo"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-3 bg-[#0a0a0a] border border-[#2a2a2a] hover:border-brand/40 rounded-xl p-3 cursor-pointer transition-colors">
          <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center shrink-0">
            <Camera size={18} className="text-brand" />
          </div>
          <span className="text-gray-400 text-sm">Tap to upload photo</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onChange(f)
            }}
          />
        </label>
      )}
    </div>
  )
}
