'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { addDays, format, startOfDay } from 'date-fns'
import { Loader2, LogOut, Plus, Trash2, Lock, BarChart2, CalendarDays } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn, formatTime, getSlotsForDate } from '@/lib/utils'
import type { AvailabilitySlot } from '@/lib/types'

// Postgres returns TIME as 'HH:MM:SS' — strip to 'HH:MM' for consistent comparisons
function normalizeSlot(slot: AvailabilitySlot): AvailabilitySlot {
  return { ...slot, slot_time: slot.slot_time.substring(0, 5) }
}

type WeekStat = { week: string; label: string; revenue: number; jobs: number }

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [savingSlot, setSavingSlot] = useState<string | null>(null)
  const [tab, setTab] = useState<'schedule' | 'dashboard'>('schedule')
  const [stats, setStats] = useState<WeekStat[] | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

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
      setSlots((json.slots ?? []).map(normalizeSlot))
    } catch {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = useCallback(async (pw: string) => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/admin/stats', {
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

  useEffect(() => {
    if (authed && tab === 'dashboard' && stats === null) {
      fetchStats(password)
    }
  }, [authed, tab, stats, password, fetchStats])

  function handleLogin(e: React.FormEvent) {
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

  // ── ADMIN PORTAL ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-4 pt-20 pb-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Admin Portal</h1>
            <p className="text-gray-500 text-sm mt-0.5">Marlow&apos;s Detailing</p>
          </div>
          <button
            onClick={() => { setAuthed(false); setPassword('') }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111] border border-[#2a2a2a] rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setTab('schedule')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === 'schedule'
                ? 'bg-brand text-white shadow'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <CalendarDays size={15} /> Schedule
          </button>
          <button
            onClick={() => setTab('dashboard')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === 'dashboard'
                ? 'bg-brand text-white shadow'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <BarChart2 size={15} /> Dashboard
          </button>
        </div>

        {/* ── SCHEDULE TAB ─────────────────────────────────────────────────── */}
        {tab === 'schedule' && (
          <>
            <p className="text-gray-500 text-sm mb-6">
              Tap a time slot to mark it open or closed.
            </p>

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
                <p className="text-white font-semibold mb-4">
                  {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
                </p>
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
          </>
        )}

        {/* ── DASHBOARD TAB ────────────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <>
            {statsLoading || stats === null ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={24} className="animate-spin text-brand" />
              </div>
            ) : (
              <div className="space-y-10">
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">
                      8-Week Revenue
                    </p>
                    <p className="text-3xl font-extrabold text-white">
                      ${stats.reduce((s, w) => s + w.revenue, 0)}
                    </p>
                  </div>
                  <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">
                      8-Week Jobs
                    </p>
                    <p className="text-3xl font-extrabold text-white">
                      {stats.reduce((s, w) => s + w.jobs, 0)}
                    </p>
                  </div>
                </div>

                {/* Weekly Revenue Chart */}
                <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-6">
                  <p className="text-white font-bold mb-6">Weekly Revenue</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }}
                        labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                        itemStyle={{ color: '#527474' }}
                        formatter={(value: number) => [`$${value}`, 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="#527474" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Weekly Jobs Chart */}
                <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-6">
                  <p className="text-white font-bold mb-6">Weekly Jobs</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }}
                        labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                        itemStyle={{ color: '#527474' }}
                        formatter={(value: number) => [value, 'Jobs']}
                      />
                      <Bar dataKey="jobs" fill="#527474" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
