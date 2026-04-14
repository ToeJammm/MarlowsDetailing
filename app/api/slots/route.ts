import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addDays, format, startOfDay } from 'date-fns'

export async function GET() {
  try {
    const supabase = await createClient()
    const today = startOfDay(new Date())
    const twoWeeksOut = addDays(today, 14)

    const { data, error } = await supabase
      .from('availability_slots')
      .select('*')
      .gte('slot_date', format(today, 'yyyy-MM-dd'))
      .lte('slot_date', format(twoWeeksOut, 'yyyy-MM-dd'))
      .eq('is_available', true)
      .eq('is_booked', false)
      .order('slot_date', { ascending: true })
      .order('slot_time', { ascending: true })

    if (error) throw error

    return NextResponse.json({ slots: data })
  } catch (err) {
    console.error('GET /api/slots error:', err)
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}
