'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { addDays, format, startOfDay } from 'date-fns'
import { Loader2, LogOut, Plus, Trash2, Lock } from 'lucide-react'
import { cn, formatTime } from '@/lib/utils'
import type { AvailabilitySlot } from '@/lib/types'

const WEEKDAY_SLOTS = ['17:00']
const WEEKEND_SLOTS = ['11:00', '13:00', '15:00', '17:00']

function getSlotsForDate(dateStr: string): string[] {
  const day = new Date(dateStr + 'T00:00:00').getDay() // 0=Sun, 6=Sat
  return day === 0 || day === 6 ? WEEKEND_SLOTS : WEEKDAY_SLOTS
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [savingSlot, setSavingSlot] = useState<string | null>(null)

  const today = startOfDay(new Date())
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i))

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
      setSlots(json.slots ?? [])
    } catch {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!password.trim()) return
    // We'll verify by making an authenticated request
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
        setSlots(json.slots ?? [])
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
        // Delete it
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
        // Create it
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
        setSlots((prev) => [...prev, json.slot])
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <Image
              src="/logo/logo-wo-text.jpeg"
              alt="Marlow's Detailing"
              width={64}
              height={64}
              className="rounded-lg mx-auto mb-4"
            />
            <h1 className="text-2xl font-extrabold text-white">Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your availability</p>
          </div>

          <form onSubmit={handleLogin} className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">
                <Lock size={12} className="inline mr-1.5" />Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] focus:border-brand rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors"
              />
            </div>
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-light text-white font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── ADMIN DASHBOARD ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-4 pt-20 pb-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Availability</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Tap a time slot to mark it open or closed. Green = available. Red = booked.
            </p>
          </div>
          <button
            onClick={() => { setAuthed(false); setPassword('') }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-brand" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500/70" /> Booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#1a1a1a] border border-[#2a2a2a]" /> Closed
          </span>
        </div>

        {/* Date pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const hasSlots = slots.some((s) => s.slot_date === dateStr)
            const isSelected = selectedDate === dateStr
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all',
                  isSelected
                    ? 'bg-brand border-brand text-white'
                    : hasSlots
                    ? 'bg-brand/10 border-brand/30 text-brand hover:border-brand/60'
                    : 'bg-[#111] border-[#2a2a2a] text-gray-500 hover:border-[#3a3a3a]'
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
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-semibold">
                {format(addDays(today, days.findIndex((d) => format(d, 'yyyy-MM-dd') === selectedDate)), 'EEEE, MMMM d')}
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
                    onClick={() => {
                      if (status === 'booked') return
                      toggleSlot(selectedDate, time)
                    }}
                    disabled={status === 'booked' || isSaving}
                    className={cn(
                      'relative py-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1',
                      status === 'available'
                        ? 'bg-brand/15 border-brand text-white'
                        : status === 'booked'
                        ? 'bg-red-500/10 border-red-500/50 text-red-400 cursor-not-allowed'
                        : 'bg-[#111] border-[#2a2a2a] text-gray-500 hover:border-brand/40 hover:text-gray-300'
                    )}
                  >
                    {isSaving ? (
                      <Loader2 size={14} className="animate-spin text-brand" />
                    ) : (
                      <>
                        <span>{formatTime(time)}</span>
                        <span className="text-[10px] opacity-60">
                          {status === 'available' ? 'Open' : status === 'booked' ? 'Booked' : 'Closed'}
                        </span>
                        {status === 'available' && (
                          <Trash2 size={10} className="absolute top-1.5 right-1.5 text-brand/40" />
                        )}
                        {status === 'empty' && (
                          <Plus size={10} className="absolute top-1.5 right-1.5 text-gray-600" />
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-600">
            <p>Select a date above to manage time slots.</p>
          </div>
        )}
      </div>
    </div>
  )
}
