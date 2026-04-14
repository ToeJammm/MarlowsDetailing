import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { PRICING, ADDON_PRICING, type VehicleType, type ServiceType, type AddonType } from './types'

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
