import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('id, slot_date, slot_time, client_name, car_year, car_make, car_model, vehicle_type, services, addons, final_price, status')
    .eq('status', 'confirmed')
    .order('slot_date', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }

  return NextResponse.json({ jobs: data ?? [] })
}

export async function PATCH(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, final_price } = await req.json()
  if (!id || final_price === undefined) {
    return NextResponse.json({ error: 'Missing id or final_price' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('bookings')
    .update({ final_price: final_price === '' ? null : Number(final_price) })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update price' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
