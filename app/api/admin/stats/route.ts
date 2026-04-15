import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { calculateTotal } from '@/lib/utils'
import type { Booking } from '@/lib/types'

type BookingWithFinalPrice = Booking & { final_price: number | null }

// Weeks to look back for each range
const RANGE_WEEKS: Record<string, number> = {
  '2w':  2,
  '1m':  4,
  '3m': 13,
  '6m': 26,
  '1y': 52,
}

export async function GET(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const range = req.nextUrl.searchParams.get('range') ?? '2w'
  const weeksBack = RANGE_WEEKS[range] ?? 2
  const useMonthly = range === '6m' || range === '1y'

  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - weeksBack * 7)
  const fromStr = fromDate.toISOString().split('T')[0]

  const supabase = createAdminClient()
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .gte('slot_date', fromStr)
    .order('slot_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }

  const effectivePrice = (b: BookingWithFinalPrice) =>
    b.final_price ?? calculateTotal(b.vehicle_type, b.services, b.addons ?? [])

  if (useMonthly) {
    const monthCount = range === '1y' ? 12 : 6
    const monthMap: Record<string, { revenue: number; jobs: number; label: string }> = {}

    for (const booking of (bookings ?? []) as BookingWithFinalPrice[]) {
      const date = new Date(booking.slot_date + 'T12:00:00')
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleString('default', { month: 'short' })
      if (!monthMap[key]) monthMap[key] = { revenue: 0, jobs: 0, label }
      monthMap[key].revenue += effectivePrice(booking)
      monthMap[key].jobs += 1
    }

    const weeks = []
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(1)
      d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('default', { month: 'short' })
      weeks.push({ week: key, label, revenue: monthMap[key]?.revenue ?? 0, jobs: monthMap[key]?.jobs ?? 0 })
    }

    return NextResponse.json({ weeks })
  }

  // Weekly grouping
  const weekMap: Record<string, { revenue: number; jobs: number; label: string }> = {}

  for (const booking of (bookings ?? []) as BookingWithFinalPrice[]) {
    const date = new Date(booking.slot_date + 'T12:00:00')
    const sunday = new Date(date)
    sunday.setDate(date.getDate() - date.getDay())
    const key = sunday.toISOString().split('T')[0]
    const label = `${sunday.getMonth() + 1}/${sunday.getDate()}`
    if (!weekMap[key]) weekMap[key] = { revenue: 0, jobs: 0, label }
    weekMap[key].revenue += effectivePrice(booking as BookingWithFinalPrice)
    weekMap[key].jobs += 1
  }

  const weeks = []
  for (let i = weeksBack - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() - i * 7)
    const key = d.toISOString().split('T')[0]
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    weeks.push({ week: key, label, revenue: weekMap[key]?.revenue ?? 0, jobs: weekMap[key]?.jobs ?? 0 })
  }

  return NextResponse.json({ weeks })
}
