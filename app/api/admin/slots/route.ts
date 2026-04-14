import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('x-admin-password')
  return auth === process.env.ADMIN_PASSWORD
}

// GET — fetch all slots for admin calendar (2 weeks)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let query = supabase.from('availability_slots').select('*').order('slot_date').order('slot_time')
    if (from) query = query.gte('slot_date', from)
    if (to) query = query.lte('slot_date', to)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ slots: data })
  } catch (err) {
    console.error('GET /api/admin/slots error:', err)
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}

// POST — create a new availability slot
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { slot_date, slot_time } = body

    if (!slot_date || !slot_time) {
      return NextResponse.json({ error: 'slot_date and slot_time are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('availability_slots')
      .upsert({ slot_date, slot_time, is_available: true, is_booked: false }, {
        onConflict: 'slot_date,slot_time',
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ slot: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/slots error:', err)
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 })
  }
}

// DELETE — remove a slot by id (only if not booked)
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const supabase = createAdminClient()

    // Check if booked
    const { data: slot } = await supabase
      .from('availability_slots')
      .select('is_booked')
      .eq('id', id)
      .single()

    if (slot?.is_booked) {
      return NextResponse.json(
        { error: 'Cannot remove a slot that already has a booking' },
        { status: 409 }
      )
    }

    const { error } = await supabase.from('availability_slots').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/slots error:', err)
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 })
  }
}
