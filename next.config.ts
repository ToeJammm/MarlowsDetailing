import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: [],
  },
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/auth-js', 'twilio'],
}

export default nextConfig
