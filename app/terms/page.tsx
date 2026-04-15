import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Terms of Service | Marlow's Detailing",
  description: "Terms of service for Marlow's Detailing mobile auto detailing services.",
}

export default function TermsPage() {
  return (
    <section className="py-24 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <p className="text-brand text-sm font-semibold uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: April 14, 2026</p>

        <div className="space-y-10 text-gray-400 text-sm leading-relaxed">

          <div>
            <h2 className="text-white font-bold text-lg mb-3">1. Agreement to Terms</h2>
            <p>
              By using the Marlow&apos;s Detailing website (marlowsdetailing.com) or booking our
              services, you agree to these Terms of Service. If you do not agree, please do not
              use our website or services.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">2. Our Services</h2>
            <p>
              Marlow&apos;s Detailing provides mobile auto detailing services in the Knoxville, TN area.
              Services include interior detailing, exterior detailing, and add-on services as
              described on our website. All services are subject to availability and must be
              confirmed by us before they are considered scheduled.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">3. Booking & Confirmation</h2>
            <p className="mb-3">
              Submitting a booking request through our website does not guarantee an appointment.
              Your booking is not confirmed until you receive an approval notification via SMS.
              We reserve the right to deny any booking request.
            </p>
            <p>
              You are responsible for ensuring the accuracy of all information provided at the
              time of booking, including your address, vehicle details, and contact information.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">4. SMS Communications</h2>
            <p className="mb-3">
              By submitting a booking request, you consent to receive SMS text messages from
              Marlow&apos;s Detailing at the phone number provided. These messages may include
              appointment confirmations, denials, and service-related follow-ups.
            </p>
            <p>
              Message frequency varies. Standard message and data rates may apply. Reply{' '}
              <strong className="text-white">STOP</strong> to opt out at any time. Reply{' '}
              <strong className="text-white">HELP</strong> for assistance.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">5. Customer Responsibilities</h2>
            <p className="mb-3">
              For mobile service at your location, you must provide access to:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>A functioning outdoor water source (spigot or hose)</li>
              <li>A working electrical power outlet</li>
              <li>Safe, accessible parking near the vehicle</li>
            </ul>
            <p className="mt-3">
              If these requirements cannot be met, you may arrange to bring your vehicle to us.
              Please note this in your booking. Failure to provide required access at the scheduled
              time may result in cancellation without refund of any deposit.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">6. Cancellations & Rescheduling</h2>
            <p>
              If you need to cancel or reschedule, please contact us as soon as possible at
              (832) 449-2025 or{' '}
              <a href="mailto:marlowdetails@gmail.com" className="text-brand hover:text-brand-light">
                marlowdetails@gmail.com
              </a>
              . We ask for at least 24 hours&apos; notice when possible. We reserve the right to
              cancel appointments due to weather, equipment issues, or other circumstances outside
              our control, and will make every effort to reschedule at your convenience.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">7. Pricing</h2>
            <p>
              Prices listed on our website are estimates and may vary based on vehicle condition,
              size, or additional services requested on-site. Final pricing will be communicated
              before services begin. We reserve the right to update our pricing at any time.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">8. Liability</h2>
            <p className="mb-3">
              Marlow&apos;s Detailing takes great care with every vehicle. However, we are not
              responsible for pre-existing damage, wear, or conditions present prior to service.
              We recommend documenting any existing damage before your appointment.
            </p>
            <p>
              To the fullest extent permitted by law, our total liability for any claim arising
              from our services shall not exceed the amount paid for the specific service in
              question.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">9. Intellectual Property</h2>
            <p>
              All content on this website, including text, images, and branding, is owned by
              Marlow&apos;s Detailing and may not be reproduced without written permission.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">10. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Tennessee. Any disputes arising
              from these Terms or our services shall be resolved in the courts of Knox County,
              Tennessee.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">11. Changes to These Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Changes will be posted on
              this page with an updated date. Continued use of our website or services after
              changes are posted constitutes acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">12. Contact Us</h2>
            <p>Questions about these Terms? Reach out:</p>
            <div className="mt-3 space-y-1">
              <p>
                <strong className="text-white">Marlow&apos;s Detailing</strong>
              </p>
              <p>Knoxville, TN</p>
              <p>
                Email:{' '}
                <a href="mailto:marlowdetails@gmail.com" className="text-brand hover:text-brand-light">
                  marlowdetails@gmail.com
                </a>
              </p>
              <p>Phone/Text: (832) 449-2025</p>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-[#2a2a2a] flex gap-6 text-sm">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors">
            ← Back to Home
          </Link>
          <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </section>
  )
}
