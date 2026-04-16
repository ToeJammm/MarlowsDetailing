import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const upcoming = req.nextUrl.searchParams.get('upcoming') === 'true'
  const supabase = createAdminClient()

  if (upcoming) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('bookings')
      .select('id, slot_date, slot_time, client_name, client_phone, car_year, car_make, car_model, vehicle_type, services, addons, final_price, status, message')
      .in('status', ['confirmed', 'pending'])
      .gte('slot_date', today)
      .order('slot_date', { ascending: true })
      .order('slot_time', { ascending: true })

    if (error) return NextResponse.json({ error: 'Failed to fetch upcoming jobs' }, { status: 500 })
    return NextResponse.json({ jobs: data ?? [] })
  }

  // Recent confirmed jobs (dashboard)
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

export async function DELETE(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = createAdminClient()

  // Grab the slot_date and slot_time before deleting
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('slot_date, slot_time')
    .eq('id', id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Delete the booking
  const { error: deleteError } = await supabase.from('bookings').delete().eq('id', id)
  if (deleteError) return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })

  // Free the slot back up
  await supabase
    .from('availability_slots')
    .update({ is_booked: false, is_available: true })
    .eq('slot_date', booking.slot_date)
    .eq('slot_time', booking.slot_time)

  return NextResponse.json({ success: true })
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
