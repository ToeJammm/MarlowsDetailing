import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { calculateTotal } from '@/lib/utils'
import type { Booking } from '@/lib/types'

export async function GET(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch all confirmed bookings from the last 8 weeks
  const eightWeeksAgo = new Date()
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)
  const fromDate = eightWeeksAgo.toISOString().split('T')[0]

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .gte('slot_date', fromDate)
    .order('slot_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }

  // Group by week (Sunday-based)
  const weekMap: Record<string, { revenue: number; jobs: number; label: string }> = {}

  for (const booking of (bookings ?? []) as Booking[]) {
    const date = new Date(booking.slot_date + 'T12:00:00')
    // Get the Sunday of this week
    const sunday = new Date(date)
    sunday.setDate(date.getDate() - date.getDay())
    const weekKey = sunday.toISOString().split('T')[0]
    const label = `${sunday.getMonth() + 1}/${sunday.getDate()}`

    if (!weekMap[weekKey]) {
      weekMap[weekKey] = { revenue: 0, jobs: 0, label }
    }

    const total = calculateTotal(
      booking.vehicle_type,
      booking.services,
      booking.addons ?? []
    )
    weekMap[weekKey].revenue += total
    weekMap[weekKey].jobs += 1
  }

  // Build last 8 weeks in order (fill in zeros for empty weeks)
  const weeks: { week: string; label: string; revenue: number; jobs: number }[] = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() - i * 7)
    const key = d.toISOString().split('T')[0]
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    weeks.push({
      week: key,
      label,
      revenue: weekMap[key]?.revenue ?? 0,
      jobs: weekMap[key]?.jobs ?? 0,
    })
  }

  return NextResponse.json({ weeks })
}
