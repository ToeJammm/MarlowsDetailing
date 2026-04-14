import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendBookingNotification } from '@/lib/twilio'
import { toE164 } from '@/lib/utils'
import type { BookingFormData } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body: BookingFormData & {
      slot_id: string
      slot_date: string
      slot_time: string
      extra_slot_ids?: string[] | null
    } = await req.json()

    // Basic validation
    const required = [
      'slot_id', 'slot_date', 'slot_time',
      'client_name', 'client_phone', 'client_address',
      'car_make', 'car_model', 'vehicle_type',
      'dirt_rating', 'services',
    ]
    for (const field of required) {
      if (!body[field as keyof typeof body]) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 })
      }
    }

    if (body.has_water === null || body.has_power === null) {
      return NextResponse.json({ error: 'Water and power access must be specified' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const allSlotIds = [body.slot_id, ...(body.extra_slot_ids ?? [])]

    // Verify ALL required slots are still available
    const { data: availableSlots, error: slotError } = await supabase
      .from('availability_slots')
      .select('id')
      .in('id', allSlotIds)
      .eq('is_available', true)
      .eq('is_booked', false)

    if (slotError || !availableSlots || availableSlots.length !== allSlotIds.length) {
      return NextResponse.json(
        { error: 'One or more time slots are no longer available. Please go back and choose again.' },
        { status: 409 }
      )
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        slot_id: body.slot_id,
        slot_date: body.slot_date,
        slot_time: body.slot_time,
        extra_slot_ids: body.extra_slot_ids?.length ? body.extra_slot_ids : null,
        client_name: body.client_name.trim(),
        client_phone: toE164(body.client_phone),
        client_address: body.client_address.trim(),
        car_make: body.car_make.trim(),
        car_model: body.car_model.trim(),
        car_year: body.car_year?.trim() || null,
        vehicle_type: body.vehicle_type,
        dirt_rating: body.dirt_rating,
        services: body.services,
        addons: body.addons?.length ? body.addons : null,
        has_water: body.has_water,
        has_power: body.has_power,
        message: body.message?.trim() || null,
        status: 'pending',
      })
      .select()
      .single()

    if (bookingError || !booking) {
      console.error('Booking insert error:', bookingError)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // Mark ALL slots as booked
    await supabase
      .from('availability_slots')
      .update({ is_booked: true })
      .in('id', allSlotIds)

    // Send SMS notification to owner
    try {
      await sendBookingNotification(booking)
    } catch (smsErr) {
      console.error('SMS notification failed (booking still created):', smsErr)
    }

    return NextResponse.json({ success: true, bookingId: booking.id }, { status: 201 })
  } catch (err) {
    console.error('POST /api/bookings error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
