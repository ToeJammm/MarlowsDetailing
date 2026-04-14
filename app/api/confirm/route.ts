import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendConfirmationToClient, sendSMS } from '@/lib/twilio'
import { formatDate, formatTime } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const action = searchParams.get('action')
  const token = searchParams.get('token')

  if (!id || !action || !token) {
    return new NextResponse(errorPage('Missing parameters.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  if (action !== 'approve' && action !== 'deny') {
    return new NextResponse(errorPage('Invalid action.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const supabase = createAdminClient()

  // Fetch booking and verify token
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .eq('confirm_token', token)
    .single()

  if (error || !booking) {
    return new NextResponse(errorPage('Booking not found or invalid link.'), {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  if (booking.status !== 'pending') {
    return new NextResponse(
      infoPage(
        'Already Processed',
        `This booking was already ${booking.status}. No changes made.`
      ),
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  }

  const newStatus = action === 'approve' ? 'confirmed' : 'denied'

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', id)

  if (updateError) {
    return new NextResponse(errorPage('Failed to update booking. Please try again.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // If denied, free the slot back up
  if (newStatus === 'denied' && booking.slot_id) {
    await supabase
      .from('availability_slots')
      .update({ is_booked: false })
      .eq('id', booking.slot_id)
  }

  // Send SMS to client
  try {
    await sendConfirmationToClient(booking, newStatus === 'confirmed')
  } catch (smsErr) {
    console.error('Client SMS failed:', smsErr)
  }

  // Confirm back to owner
  try {
    const verb = newStatus === 'confirmed' ? 'Approved' : 'Denied'
    await sendSMS(
      process.env.OWNER_PHONE_NUMBER!,
      `${verb}: ${booking.client_name}'s booking on ${formatDate(booking.slot_date)} at ${formatTime(booking.slot_time)}.`
    )
  } catch (smsErr) {
    console.error('Owner confirmation SMS failed:', smsErr)
  }

  const approved = newStatus === 'confirmed'
  return new NextResponse(
    successPage(
      approved ? 'Booking Approved!' : 'Booking Denied',
      approved
        ? `You confirmed ${booking.client_name}'s appointment on ${formatDate(booking.slot_date)} at ${formatTime(booking.slot_time)}. They've been texted.`
        : `You denied ${booking.client_name}'s appointment. The slot has been freed up and they've been notified.`,
      approved
    ),
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  )
}

function baseHtml(title: string, content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Marlow's Detailing</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #f5f5f5; font-family: system-ui, sans-serif;
           min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #111; border: 1px solid #2a2a2a; border-radius: 16px;
             padding: 40px; max-width: 480px; width: 100%; text-align: center; }
    h1 { font-size: 1.6rem; font-weight: 800; margin-bottom: 12px; }
    p { color: #9ca3af; line-height: 1.6; }
    a { display: inline-block; margin-top: 24px; background: #527474; color: white;
        font-weight: 600; padding: 12px 28px; border-radius: 999px; text-decoration: none; }
    a:hover { background: #6a9090; }
  </style>
</head>
<body>
  <div class="card">${content}</div>
</body>
</html>`
}

function successPage(title: string, message: string, approved: boolean) {
  const icon = approved ? '✅' : '❌'
  return baseHtml(title, `<div style="font-size:3rem;margin-bottom:16px">${icon}</div>
    <h1 style="color:${approved ? '#6a9090' : '#f87171'}">${title}</h1>
    <p>${message}</p>
    <a href="/">Back to Site</a>`)
}

function errorPage(message: string) {
  return baseHtml('Error', `<div style="font-size:3rem;margin-bottom:16px">⚠️</div>
    <h1 style="color:#f87171">Something went wrong</h1>
    <p>${message}</p>
    <a href="/">Back to Site</a>`)
}

function infoPage(title: string, message: string) {
  return baseHtml(title, `<div style="font-size:3rem;margin-bottom:16px">ℹ️</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/">Back to Site</a>`)
}
