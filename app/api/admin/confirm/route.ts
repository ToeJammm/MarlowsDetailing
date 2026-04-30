import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, action } = await req.json()
  if (!id || (action !== 'approve' && action !== 'deny')) {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, status, slot_id, extra_slot_ids')
    .eq('id', id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (booking.status !== 'pending') {
    return NextResponse.json({ error: `Booking already ${booking.status}` }, { status: 409 })
  }

  const newStatus = action === 'approve' ? 'confirmed' : 'denied'

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }

  if (newStatus === 'denied') {
    const allSlotIds = [booking.slot_id, ...(booking.extra_slot_ids ?? [])].filter(Boolean)
    if (allSlotIds.length > 0) {
      await supabase
        .from('availability_slots')
        .update({ is_booked: false })
        .in('id', allSlotIds)
    }
  }

  return NextResponse.json({ success: true, status: newStatus })
}
