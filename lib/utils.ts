import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { PRICING, ADDON_PRICING, type VehicleType, type ServiceType, type AddonType, type AvailabilitySlot } from './types'

// ── Schedule helpers ──────────────────────────────────────────────────────────

const WEEKDAY_SLOTS = ['17:00']
const WEEKEND_SLOTS = ['11:00', '13:00', '15:00', '17:00']

export function getSlotsForDate(dateStr: string): string[] {
  const day = new Date(dateStr + 'T00:00:00').getDay() // 0 = Sun, 6 = Sat
  return day === 0 || day === 6 ? WEEKEND_SLOTS : WEEKDAY_SLOTS
}

export function slotsNeeded(
  services: ServiceType[],
  addons: AddonType[],
  slotTime: string // HH:MM
): number {
  if (slotTime === '17:00') return 1 // Last slot of the day — no overflow
  const hasBoth = services.includes('Both')
  const hasAddons = addons.length > 0
  if (hasBoth && hasAddons) return 3
  if (hasBoth || hasAddons) return 2
  return 1
}

export function getRequiredSlots(
  primarySlot: AvailabilitySlot,
  availableSlots: AvailabilitySlot[],
  count: number
): { slots: AvailabilitySlot[]; error: string | null } {
  if (count <= 1) return { slots: [primarySlot], error: null }

  const primaryTime = primarySlot.slot_time.substring(0, 5)
  const daySchedule = getSlotsForDate(primarySlot.slot_date)
  const startIdx = daySchedule.indexOf(primaryTime)

  if (startIdx === -1) return { slots: [primarySlot], error: null }

  const requiredTimes = daySchedule.slice(startIdx, startIdx + count)

  if (requiredTimes.length < count) {
    return {
      slots: [],
      error:
        "This job won't fit in the remaining slots for this day. Please choose an earlier time or a different day.",
    }
  }

  const result: AvailabilitySlot[] = []
  for (const time of requiredTimes) {
    const slot = availableSlots.find(
      (s) =>
        s.slot_date === primarySlot.slot_date && s.slot_time.substring(0, 5) === time
    )
    if (!slot) {
      return {
        slots: [],
        error: `This job will take too long for the slots available — the ${formatTime(time)} slot is already booked. Please choose a different time or day.`,
      }
    }
    result.push(slot)
  }

  return { slots: result, error: null }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateTotal(
  vehicleType: VehicleType,
  services: ServiceType[],
  addons: AddonType[]
): number {
  let total = 0

  if (services.includes('Both')) {
    total += PRICING[vehicleType]['Both']
  } else {
    services.forEach((service) => {
      total += PRICING[vehicleType][service]
    })
  }

  addons.forEach((addon) => {
    total += ADDON_PRICING[addon]
  })

  return total
}

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr + 'T00:00:00')
  return format(date, 'EEEE, MMMM d')
}

export function formatDateShort(dateStr: string): string {
  const date = parseISO(dateStr + 'T00:00:00')
  return format(date, 'EEE MMM d')
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`
  return phone
}
