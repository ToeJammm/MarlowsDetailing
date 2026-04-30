'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { addDays, format, startOfDay } from 'date-fns'
import { Loader2, LogOut, Plus, Trash2, Lock, BarChart2, CalendarDays, Inbox, CheckCircle2, XCircle, Phone, MapPin, Droplets, Zap } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn, formatTime, getSlotsForDate, calculateTotal, formatDate } from '@/lib/utils'
import type { AvailabilitySlot, ServiceType, AddonType, VehicleType } from '@/lib/types'

// Postgres returns TIME as 'HH:MM:SS' — strip to 'HH:MM' for consistent comparisons
function normalizeSlot(slot: AvailabilitySlot): AvailabilitySlot {
  return { ...slot, slot_time: slot.slot_time.substring(0, 5) }
}

type WeekStat = { week: string; label: string; revenue: number; jobs: number }
type StatsRange = '2w' | '1m' | '3m' | '6m' | '1y'
type PendingBooking = {
  id: string
  slot_date: string
  slot_time: string
  client_name: string
  client_phone: string
  client_address: string
  car_year: string | null
  car_make: string
  car_model: string
  vehicle_type: VehicleType
  dirt_rating: number
  services: ServiceType[]
  addons: AddonType[] | null
  has_water: boolean
  has_power: boolean
  message: string | null
  photo_urls: string[] | null
  status: string
}

type RecentJob = {
  id: string
  slot_date: string
  slot_time: string
  client_name: string
  car_year: string | null
  car_make: string
  car_model: string
  vehicle_type: VehicleType
  services: ServiceType[]
  addons: AddonType[] | null
  final_price: number | null
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [savingSlot, setSavingSlot] = useState<string | null>(null)
  const [tab, setTab] = useState<'requests' | 'schedule' | 'dashboard'>('requests')
  const [stats, setStats] = useState<WeekStat[] | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsRange, setStatsRange] = useState<StatsRange>('2w')
  const [recentJobs, setRecentJobs] = useState<RecentJob[] | null>(null)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({})
  const [upcomingJobs, setUpcomingJobs] = useState<(RecentJob & { client_phone: string; message: string | null; status: string })[] | null>(null)
  const [upcomingLoading, setUpcomingLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[] | null>(null)
  const [pendingLoading, setPendingLoading] = useState(false)
  const [confirmingBooking, setConfirmingBooking] = useState<string | null>(null)
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null)

  const today = startOfDay(new Date())
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i))

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchSlots = useCallback(async (pw: string) => {
    setLoading(true)
    try {
      const from = format(today, 'yyyy-MM-dd')
      const to = format(addDays(today, 14), 'yyyy-MM-dd')
      const res = await fetch(`/api/admin/slots?from=${from}&to=${to}`, {
        headers: { 'x-admin-password': pw },
      })
      if (!res.ok) throw new Error('Unauthorized')
      const json = await res.json()
      setSlots((json.slots ?? []).map(normalizeSlot))
    } catch {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = useCallback(async (pw: string, range: StatsRange) => {
    setStatsLoading(true)
    try {
      const res = await fetch(`/api/admin/stats?range=${range}`, {
        headers: { 'x-admin-password': pw },
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setStats(json.weeks ?? [])
    } catch {
      setStats([])
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchJobs = useCallback(async (pw: string) => {
    setJobsLoading(true)
    try {
      const res = await fetch('/api/admin/jobs', {
        headers: { 'x-admin-password': pw },
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setRecentJobs(json.jobs ?? [])
    } catch {
      setRecentJobs([])
    } finally {
      setJobsLoading(false)
    }
  }, [])

  const fetchPending = useCallback(async (pw: string) => {
    setPendingLoading(true)
    try {
      const res = await fetch('/api/admin/jobs?pending=true', {
        headers: { 'x-admin-password': pw },
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setPendingBookings(json.bookings ?? [])
    } catch {
      setPendingBookings([])
    } finally {
      setPendingLoading(false)
    }
  }, [])

  const fetchUpcoming = useCallback(async (pw: string) => {
    setUpcomingLoading(true)
    try {
      const res = await fetch('/api/admin/jobs?upcoming=true', {
        headers: { 'x-admin-password': pw },
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setUpcomingJobs(json.jobs ?? [])
    } catch {
      setUpcomingJobs([])
    } finally {
      setUpcomingLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed && tab === 'dashboard') {
      fetchStats(password, statsRange)
    }
  }, [authed, tab, statsRange, password, fetchStats])

  useEffect(() => {
    if (authed && tab === 'dashboard' && recentJobs === null) {
      fetchJobs(password)
    }
  }, [authed, tab, recentJobs, password, fetchJobs])

  useEffect(() => {
    if (authed && upcomingJobs === null) {
      fetchUpcoming(password)
    }
  }, [authed, upcomingJobs, password, fetchUpcoming])

  useEffect(() => {
    if (authed && pendingBookings === null) {
      fetchPending(password)
    }
  }, [authed, pendingBookings, password, fetchPending])

  async function savePrice(jobId: string) {
    const raw = editingPrice[jobId]
    const res = await fetch('/api/admin/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: jobId, final_price: raw === '' ? null : raw }),
    })
    if (res.ok) {
      const newPrice = raw === '' ? null : Number(raw)
      setRecentJobs((prev) =>
        prev?.map((j) => j.id === jobId ? { ...j, final_price: newPrice } : j) ?? null
      )
      setUpcomingJobs((prev) =>
        prev?.map((j) => j.id === jobId ? { ...j, final_price: newPrice } : j) ?? null
      )
      setEditingPrice((prev) => { const next = { ...prev }; delete next[jobId]; return next })
      fetchStats(password, statsRange)
    }
  }

  async function handleBookingAction(bookingId: string, action: 'approve' | 'deny') {
    setConfirmingBooking(bookingId)
    try {
      const res = await fetch('/api/admin/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ id: bookingId, action }),
      })
      if (res.ok) {
        setPendingBookings((prev) => prev?.filter((b) => b.id !== bookingId) ?? null)
        if (action === 'approve') fetchUpcoming(password)
      }
    } finally {
      setConfirmingBooking(null)
    }
  }

  async function deleteJob(jobId: string) {
    setDeleting(jobId)
    const res = await fetch('/api/admin/jobs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: jobId }),
    })
    if (res.ok) {
      setUpcomingJobs((prev) => prev?.filter((j) => j.id !== jobId) ?? null)
      // Refresh slots so the calendar reflects the freed slot
      const from = format(today, 'yyyy-MM-dd')
      const to = format(addDays(today, 14), 'yyyy-MM-dd')
      const slotsRes = await fetch(`/api/admin/slots?from=${from}&to=${to}`, {
        headers: { 'x-admin-password': password },
      })
      if (slotsRes.ok) {
        const json = await slotsRes.json()
        setSlots((json.slots ?? []).map(normalizeSlot))
      }
    }
    setDeleting(null)
    setConfirmDelete(null)
  }

  function handleLogin(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    fetch(`/api/admin/slots?from=${format(today, 'yyyy-MM-dd')}&to=${format(addDays(today, 14), 'yyyy-MM-dd')}`, {
      headers: { 'x-admin-password': password },
    })
      .then(async (res) => {
        if (!res.ok) {
          setAuthError('Incorrect password.')
          setLoading(false)
          return
        }
        const json = await res.json()
        setSlots((json.slots ?? []).map(normalizeSlot))
        setAuthed(true)
        setAuthError('')
        setLoading(false)
      })
      .catch(() => {
        setAuthError('Something went wrong. Try again.')
        setLoading(false)
      })
  }

  async function toggleSlot(date: string, time: string) {
    const key = `${date}_${time}`
    setSavingSlot(key)

    const existing = slots.find((s) => s.slot_date === date && s.slot_time === time)

    try {
      if (existing) {
        const res = await fetch('/api/admin/slots', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': password,
          },
          body: JSON.stringify({ id: existing.id }),
        })
        const json = await res.json()
        if (!res.ok) {
          alert(json.error || 'Failed to remove slot.')
          return
        }
        setSlots((prev) => prev.filter((s) => s.id !== existing.id))
      } else {
        const res = await fetch('/api/admin/slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': password,
          },
          body: JSON.stringify({ slot_date: date, slot_time: time }),
        })
        const json = await res.json()
        if (!res.ok) {
          alert(json.error || 'Failed to create slot.')
          return
        }
        setSlots((prev) => [...prev, normalizeSlot(json.slot)])
      }
    } finally {
      setSavingSlot(null)
    }
  }

  const slotStatus = (date: string, time: string) => {
    const slot = slots.find((s) => s.slot_date === date && s.slot_time === time)
    if (!slot) return 'empty'
    if (slot.is_booked) return 'booked'
    return 'available'
  }

  // ── LOGIN ────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
        {/* Ambient glow */}
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-brand/8 blur-[80px] pointer-events-none" />

        <div className="relative max-w-sm w-full">
          <div className="text-center mb-8">
            <Image
              src="/logo/detailing_logo_dark_no_bg.png"
              alt="Marlow's Detailing"
              width={160}
              height={160}
              className="mx-auto mb-5 drop-shadow-[0_4px_24px_rgba(82,116,116,0.4)]"
            />
            <h1 className="font-display font-extrabold uppercase text-white text-4xl leading-none mb-1">
              Admin
            </h1>
            <p className="text-gray-500 text-sm">Manage your availability</p>
          </div>

          <form onSubmit={handleLogin} className="bg-surface-2 border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                <Lock size={11} /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                className="w-full bg-surface-1 border border-white/[0.07] hover:border-white/[0.12] focus:border-brand rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-colors"
              />
            </div>
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-light text-white font-semibold py-[15px] rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── ADMIN PORTAL ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-4 pt-20 pb-16">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold uppercase text-white text-3xl leading-none">
              Admin Portal
            </h1>
          </div>
          <button
            onClick={() => { setAuthed(false); setPassword('') }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-2 border border-white/[0.07] rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setTab('requests')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === 'requests' ? 'bg-brand text-white' : 'text-gray-400 hover:text-white'
            )}
          >
            <Inbox size={15} />
            Requests
            {pendingBookings && pendingBookings.length > 0 && (
              <span className={cn(
                'text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center',
                tab === 'requests' ? 'bg-white text-brand' : 'bg-brand text-white'
              )}>
                {pendingBookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('schedule')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === 'schedule' ? 'bg-brand text-white' : 'text-gray-400 hover:text-white'
            )}
          >
            <CalendarDays size={15} /> Schedule
          </button>
          <button
            onClick={() => setTab('dashboard')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === 'dashboard' ? 'bg-brand text-white' : 'text-gray-400 hover:text-white'
            )}
          >
            <BarChart2 size={15} /> Dashboard
          </button>
        </div>

        {/* ── REQUESTS TAB ─────────────────────────────────────────────────── */}
        {tab === 'requests' && (
          <>
            {pendingLoading || pendingBookings === null ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={24} className="animate-spin text-brand" />
              </div>
            ) : pendingBookings.length === 0 ? (
              <div className="text-center py-24">
                <Inbox size={32} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No pending booking requests.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingBookings.map((booking) => {
                  const isActing = confirmingBooking === booking.id
                  const estimatedTotal = calculateTotal(booking.vehicle_type, booking.services, booking.addons ?? [])
                  return (
                    <div key={booking.id} className="bg-surface-2 border border-white/[0.07] rounded-2xl overflow-hidden">
                      {/* Header */}
                      <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white font-bold text-base">{booking.client_name}</p>
                          <p className="text-brand text-sm font-medium mt-0.5">
                            {formatDate(booking.slot_date)} · {formatTime(booking.slot_time)}
                          </p>
                        </div>
                        <span className="bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0">
                          Pending
                        </span>
                      </div>

                      <div className="px-5 py-4 space-y-4">
                        {/* Contact */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <a
                            href={`tel:${booking.client_phone}`}
                            className="flex items-center gap-2 bg-surface-1 border border-white/[0.06] rounded-xl px-3 py-2.5 hover:border-brand/40 transition-colors group"
                          >
                            <Phone size={14} className="text-brand shrink-0" />
                            <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{booking.client_phone}</span>
                          </a>
                          <div className="flex items-center gap-2 bg-surface-1 border border-white/[0.06] rounded-xl px-3 py-2.5">
                            <MapPin size={14} className="text-brand shrink-0" />
                            <span className="text-gray-300 text-sm truncate">{booking.client_address}</span>
                          </div>
                        </div>

                        {/* Vehicle + services */}
                        <div className="bg-surface-1 border border-white/[0.06] rounded-xl px-4 py-3 space-y-1.5">
                          <p className="text-white text-sm font-semibold">
                            {[booking.car_year, booking.car_make, booking.car_model].filter(Boolean).join(' ')}
                            <span className="text-gray-500 font-normal ml-1.5 text-xs">
                              ({booking.vehicle_type === 'sedan_coupe' ? 'Sedan / Coupe' : 'SUV / Truck'})
                            </span>
                          </p>
                          <p className="text-gray-400 text-xs">{booking.services.join(', ')}{booking.addons?.length ? ` + ${booking.addons.join(', ')}` : ''}</p>
                          <p className="text-brand text-xs font-semibold">Est. ${estimatedTotal}</p>
                        </div>

                        {/* Dirt rating + utilities */}
                        <div className="flex flex-wrap gap-2">
                          <span className="flex items-center gap-1.5 bg-surface-1 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-gray-400">
                            Dirt level: <span className="text-white font-semibold ml-1">{booking.dirt_rating}/10</span>
                          </span>
                          <span className={cn(
                            'flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-xs',
                            booking.has_water ? 'bg-brand/5 border-brand/20 text-brand' : 'bg-red-500/5 border-red-500/20 text-red-400'
                          )}>
                            <Droplets size={11} /> Water: {booking.has_water ? 'Yes' : 'No'}
                          </span>
                          <span className={cn(
                            'flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-xs',
                            booking.has_power ? 'bg-brand/5 border-brand/20 text-brand' : 'bg-red-500/5 border-red-500/20 text-red-400'
                          )}>
                            <Zap size={11} /> Power: {booking.has_power ? 'Yes' : 'No'}
                          </span>
                        </div>

                        {/* Message */}
                        {booking.message && (
                          <div className="bg-surface-1 border border-white/[0.06] rounded-xl px-4 py-3">
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Note</p>
                            <p className="text-gray-300 text-sm leading-relaxed">&ldquo;{booking.message}&rdquo;</p>
                          </div>
                        )}

                        {/* Photos */}
                        {booking.photo_urls && booking.photo_urls.length > 0 && (
                          <div>
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Photos</p>
                            <div className="grid grid-cols-3 gap-2">
                              {booking.photo_urls.map((url, i) => (
                                <button
                                  key={i}
                                  onClick={() => setExpandedPhoto(url)}
                                  className="aspect-square rounded-xl overflow-hidden border border-white/[0.07] hover:border-brand/40 transition-colors"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                          <button
                            onClick={() => handleBookingAction(booking.id, 'approve')}
                            disabled={isActing}
                            className="flex-1 flex items-center justify-center gap-2 bg-brand/10 hover:bg-brand/20 border border-brand/30 hover:border-brand/50 text-brand font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50"
                          >
                            {isActing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
                            Confirm
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'deny')}
                            disabled={isActing}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50"
                          >
                            {isActing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={15} />}
                            Deny
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Expanded photo lightbox */}
            {expandedPhoto && (
              <div
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                onClick={() => setExpandedPhoto(null)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={expandedPhoto} alt="Vehicle photo" className="max-w-full max-h-full rounded-2xl object-contain" />
              </div>
            )}
          </>
        )}

        {/* ── SCHEDULE TAB ─────────────────────────────────────────────────── */}
        {tab === 'schedule' && (
          <>
            <p className="text-gray-500 text-sm mb-6">
              Tap a time slot to mark it open or closed.
            </p>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-brand" /> Open
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/60" /> Partial
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-500/70" /> Fully Booked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-surface-3 border border-white/[0.07]" /> Closed
              </span>
            </div>

            {/* Date pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-thin-x pb-2 mb-6">
              {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const daySlots = slots.filter((s) => s.slot_date === dateStr)
                const hasSlots = daySlots.length > 0
                const bookedCount = daySlots.filter((s) => s.is_booked).length
                const isFullyBooked = hasSlots && bookedCount === daySlots.length
                const isPartiallyBooked = hasSlots && bookedCount > 0 && bookedCount < daySlots.length
                const isSelected = selectedDate === dateStr
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={cn(
                      'shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all',
                      isSelected
                        ? 'bg-brand border-brand text-white'
                        : isFullyBooked
                        ? 'bg-red-500/15 border-red-500/40 text-red-400 hover:border-red-500/60'
                        : isPartiallyBooked
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:border-amber-500/50'
                        : hasSlots
                        ? 'bg-brand/10 border-brand/30 text-brand hover:border-brand/60'
                        : 'bg-surface-2 border-white/[0.07] text-gray-500 hover:border-white/[0.15]'
                    )}
                  >
                    {format(day, 'EEE d')}
                  </button>
                )
              })}
            </div>

            {/* Time grid for selected date */}
            {selectedDate ? (
              <div>
                <div className="mb-4">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-0.5">Slots for</p>
                  <p className="text-white font-bold text-lg">
                    {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {getSlotsForDate(selectedDate).map((time) => {
                    const status = slotStatus(selectedDate, time)
                    const key = `${selectedDate}_${time}`
                    const isSaving = savingSlot === key
                    return (
                      <button
                        key={time}
                        onClick={() => { if (status !== 'booked') toggleSlot(selectedDate, time) }}
                        disabled={status === 'booked' || isSaving}
                        className={cn(
                          'relative py-4 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1',
                          status === 'available'
                            ? 'bg-brand/15 border-brand text-white'
                            : status === 'booked'
                            ? 'bg-red-500/10 border-red-500/40 text-red-400 cursor-not-allowed'
                            : 'bg-surface-2 border-white/[0.07] text-gray-500 hover:border-brand/40 hover:text-gray-300'
                        )}
                      >
                        {isSaving ? (
                          <Loader2 size={14} className="animate-spin text-brand" />
                        ) : (
                          <>
                            <span>{formatTime(time)}</span>
                            <span className="text-[10px] opacity-50 font-normal">
                              {status === 'available' ? 'Open' : status === 'booked' ? 'Booked' : 'Closed'}
                            </span>
                            {status === 'available' && (
                              <Trash2 size={10} className="absolute top-2 right-2 text-brand/40" />
                            )}
                            {status === 'empty' && (
                              <Plus size={10} className="absolute top-2 right-2 text-gray-600" />
                            )}
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-600 text-sm">
                Select a date above to manage time slots.
              </div>
            )}

            {/* Upcoming jobs */}
            <div className="mt-8 bg-surface-2 border border-white/[0.07] rounded-2xl p-6">
              <p className="font-display font-bold uppercase text-white text-lg mb-5">Upcoming Jobs</p>
              {upcomingLoading || upcomingJobs === null ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-brand" />
                </div>
              ) : upcomingJobs.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-6">No upcoming jobs.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingJobs.map((job) => {
                    const price = job.final_price ?? calculateTotal(job.vehicle_type, job.services, job.addons ?? [])
                    return (
                      <div key={job.id} className="bg-surface-1 border border-white/[0.06] rounded-xl px-4 py-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white font-semibold text-sm">{job.client_name}</p>
                              <span className={cn(
                                'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                                job.status === 'confirmed'
                                  ? 'bg-brand/15 text-brand'
                                  : 'bg-amber-500/15 text-amber-400'
                              )}>
                                {job.status}
                              </span>
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {formatDate(job.slot_date)} · {formatTime(job.slot_time)}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <span className="font-display font-bold text-white text-lg">$</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={editingPrice[job.id] ?? String(price)}
                              onFocus={() => setEditingPrice((prev) => ({ ...prev, [job.id]: String(price) }))}
                              onChange={(e) => setEditingPrice((prev) => ({ ...prev, [job.id]: e.target.value }))}
                              onBlur={() => { if (job.id in editingPrice) savePrice(job.id) }}
                              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                              className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-brand/60 outline-none font-display font-bold text-white text-lg text-right w-20 cursor-text transition-colors"
                            />
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs">
                          {[job.car_year, job.car_make, job.car_model].filter(Boolean).join(' ')} · {job.services.join(', ')}
                        </p>
                        {job.message && (
                          <p className="text-gray-600 text-xs italic">&ldquo;{job.message}&rdquo;</p>
                        )}
                        {/* Delete / confirm row */}
                        {confirmDelete === job.id ? (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-gray-500 text-xs">Cancel this job?</span>
                            <button
                              onClick={() => deleteJob(job.id)}
                              disabled={deleting === job.id}
                              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                            >
                              {deleting === job.id ? 'Deleting…' : 'Yes, delete'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                            >
                              Keep it
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(job.id)}
                            className="flex items-center gap-1 text-gray-700 hover:text-red-400 text-xs transition-colors pt-1"
                          >
                            <Trash2 size={11} />
                            Cancel job
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── DASHBOARD TAB ────────────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {/* Range selector */}
            <div className="flex gap-1 bg-surface-2 border border-white/[0.07] rounded-xl p-1 w-fit">
              {(['2w', '1m', '3m', '6m', '1y'] as StatsRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setStatsRange(r)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all',
                    statsRange === r ? 'bg-brand text-white' : 'text-gray-400 hover:text-white'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            {statsLoading || stats === null ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={24} className="animate-spin text-brand" />
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-2 border border-white/[0.07] rounded-2xl p-5">
                    <p className="text-brand text-[11px] font-semibold uppercase tracking-[0.18em] mb-2">
                      Revenue
                    </p>
                    <p className="font-display font-extrabold uppercase text-white text-4xl leading-none">
                      ${stats.reduce((s, w) => s + w.revenue, 0)}
                    </p>
                  </div>
                  <div className="bg-surface-2 border border-white/[0.07] rounded-2xl p-5">
                    <p className="text-brand text-[11px] font-semibold uppercase tracking-[0.18em] mb-2">
                      Jobs
                    </p>
                    <p className="font-display font-extrabold uppercase text-white text-4xl leading-none">
                      {stats.reduce((s, w) => s + w.jobs, 0)}
                    </p>
                  </div>
                </div>

                {/* Revenue chart */}
                <div className="bg-surface-2 border border-white/[0.07] rounded-2xl p-6">
                  <p className="font-display font-bold uppercase text-white text-lg mb-6">Revenue</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f25" />
                      <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}
                        labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                        itemStyle={{ color: '#527474' }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="#527474" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Jobs chart */}
                <div className="bg-surface-2 border border-white/[0.07] rounded-2xl p-6">
                  <p className="font-display font-bold uppercase text-white text-lg mb-6">Jobs</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f25" />
                      <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}
                        labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                        itemStyle={{ color: '#527474' }}
                        formatter={(value) => [value, 'Jobs']}
                      />
                      <Bar dataKey="jobs" fill="#527474" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Recent jobs */}
            <div className="bg-surface-2 border border-white/[0.07] rounded-2xl p-6">
              <p className="font-display font-bold uppercase text-white text-lg mb-5">Recent Jobs</p>
              {jobsLoading || recentJobs === null ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="animate-spin text-brand" />
                </div>
              ) : recentJobs.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-8">No recent jobs yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentJobs.map((job) => {
                    const base = calculateTotal(job.vehicle_type, job.services, job.addons ?? [])
                    const displayed = job.final_price ?? base
                    return (
                      <div key={job.id} className="bg-surface-1 border border-white/[0.06] rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-white font-semibold text-sm truncate">{job.client_name}</p>
                            <span className="text-gray-600 text-xs shrink-0">{formatDate(job.slot_date)}</span>
                          </div>
                          <p className="text-gray-500 text-xs truncate">
                            {[job.car_year, job.car_make, job.car_model].filter(Boolean).join(' ')} · {job.services.join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <span className="font-display font-bold text-white text-lg">$</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={editingPrice[job.id] ?? String(displayed)}
                            onFocus={() => setEditingPrice((prev) => ({ ...prev, [job.id]: String(displayed) }))}
                            onChange={(e) => setEditingPrice((prev) => ({ ...prev, [job.id]: e.target.value }))}
                            onBlur={() => { if (job.id in editingPrice) savePrice(job.id) }}
                            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                            className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-brand/60 outline-none font-display font-bold text-white text-lg text-right w-20 cursor-text transition-colors"
                          />
                          {job.final_price !== null && job.final_price !== base && (
                            <span className="text-gray-600 text-xs ml-1.5 line-through">${base}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
