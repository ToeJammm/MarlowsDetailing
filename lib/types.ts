export type VehicleType = 'sedan_coupe' | 'suv_truck'
export type ServiceType = 'Interior Detail' | 'Exterior Detail' | 'Both'
export type AddonType = 'Decontamination' | 'Steam Cleaning' | 'Ceramic Coating' | 'Extractor Cleaning'
export type BookingStatus = 'pending' | 'confirmed' | 'denied'

export interface AvailabilitySlot {
  id: string
  slot_date: string
  slot_time: string
  is_available: boolean
  is_booked: boolean
  created_at: string
}

export interface Booking {
  id: string
  slot_id: string
  slot_date: string
  slot_time: string
  confirm_token: string
  client_name: string
  client_phone: string
  client_address: string
  car_make: string
  car_model: string
  car_year: string | null
  vehicle_type: VehicleType
  dirt_rating: number
  services: ServiceType[]
  addons: AddonType[] | null
  has_water: boolean
  has_power: boolean
  message: string | null
  extra_slot_ids: string[] | null
  photo_urls: string[] | null
  status: BookingStatus
  created_at: string
}

export interface BookingFormData {
  client_name: string
  client_phone: string
  client_address: string
  car_make: string
  car_model: string
  car_year: string
  vehicle_type: VehicleType
  dirt_rating: number
  services: ServiceType[]
  addons: AddonType[]
  has_water: boolean | null
  has_power: boolean | null
  message: string
}

export const PRICING: Record<VehicleType, Record<ServiceType, number>> = {
  sedan_coupe: {
    'Interior Detail': 50,
    'Exterior Detail': 45,
    'Both': 90,
  },
  suv_truck: {
    'Interior Detail': 60,
    'Exterior Detail': 55,
    'Both': 110,
  },
}

export const ADDON_PRICING: Record<AddonType, number> = {
  'Decontamination': 10,
  'Steam Cleaning': 10,
  'Ceramic Coating': 15,
  'Extractor Cleaning': 15,
}

export const ADDON_DESCRIPTIONS: Record<AddonType, string> = {
  'Decontamination': 'Iron remover and clay towel treatment',
  'Steam Cleaning': 'Deep steam clean for tough grime',
  'Ceramic Coating': 'Paint protection up to 6 months',
  'Extractor Cleaning': 'Deep carpet & upholstery extraction',
}
