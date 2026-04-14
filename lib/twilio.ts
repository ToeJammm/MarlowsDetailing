import twilio from 'twilio'
import { formatDate, formatTime, calculateTotal, formatPhone } from './utils'
import type { Booking } from './types'

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )
}

export async function sendSMS(to: string, body: string) {
  const client = getClient()
  return client.messages.create({
    body,
    to,
    from: process.env.TWILIO_PHONE_NUMBER!,
  })
}

export async function sendBookingNotification(booking: Booking) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://marlowsdetailing.com'
  const approveUrl = `${baseUrl}/api/confirm?id=${booking.id}&action=approve&token=${booking.confirm_token}`
  const denyUrl = `${baseUrl}/api/confirm?id=${booking.id}&action=deny&token=${booking.confirm_token}`

  const total = calculateTotal(
    booking.vehicle_type,
    booking.services,
    booking.addons ?? []
  )

  const vehicleLabel = booking.vehicle_type === 'sedan_coupe' ? 'Sedan/Coupe' : 'SUV/Truck'
  const yearPrefix = booking.car_year ? `${booking.car_year} ` : ''
  const addonLine = booking.addons?.length ? `\nAdd-ons: ${booking.addons.join(', ')}` : ''
  const notesLine = booking.message ? `\nNotes: "${booking.message}"` : ''

  const message = [
    `NEW BOOKING - MARLOW'S DETAILING`,
    ``,
    `Name: ${booking.client_name}`,
    `Phone: ${formatPhone(booking.client_phone)}`,
    `Address: ${booking.client_address}`,
    `Date: ${formatDate(booking.slot_date)} at ${formatTime(booking.slot_time)}`,
    `Vehicle: ${yearPrefix}${booking.car_make} ${booking.car_model} (${vehicleLabel})`,
    `Dirtiness: ${booking.dirt_rating}/10`,
    `Services: ${booking.services.join(', ')}${addonLine}`,
    `Water: ${booking.has_water ? 'Yes' : 'No'} | Power: ${booking.has_power ? 'Yes' : 'No'}${notesLine}`,
    `Est. Total: $${total}`,
    ``,
    `APPROVE: ${approveUrl}`,
    ``,
    `DENY: ${denyUrl}`,
  ].join('\n')

  return sendSMS(process.env.OWNER_PHONE_NUMBER!, message)
}

export async function sendConfirmationToClient(booking: Booking, approved: boolean) {
  const message = approved
    ? `Hi ${booking.client_name}! Your detail appointment on ${formatDate(booking.slot_date)} at ${formatTime(booking.slot_time)} is CONFIRMED. We'll see you then! Questions? Call/text (832) 449-2025. - Marlow's Detailing`
    : `Hi ${booking.client_name}, unfortunately we're unable to take your appointment on ${formatDate(booking.slot_date)} at ${formatTime(booking.slot_time)}. Please visit marlowsdetailing.com to pick another time. - Marlow's Detailing`

  return sendSMS(booking.client_phone, message)
}
