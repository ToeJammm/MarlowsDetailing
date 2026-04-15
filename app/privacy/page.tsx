import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Privacy Policy | Marlow's Detailing",
  description: "Privacy policy for Marlow's Detailing mobile auto detailing services.",
}

export default function PrivacyPage() {
  return (
    <section className="py-24 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <p className="text-brand text-sm font-semibold uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: April 14, 2026</p>

        <div className="space-y-10 text-gray-400 text-sm leading-relaxed">

          <div>
            <h2 className="text-white font-bold text-lg mb-3">1. Who We Are</h2>
            <p>
              Marlow&apos;s Detailing (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a mobile auto detailing business
              operating in the Knoxville, TN area. We can be reached at{' '}
              <a href="mailto:marlowdetails@gmail.com" className="text-brand hover:text-brand-light">
                marlowdetails@gmail.com
              </a>{' '}
              or by phone/text at (832) 449-2025.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">2. Information We Collect</h2>
            <p className="mb-3">When you book an appointment through our website, we collect:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Your name</li>
              <li>Your phone number</li>
              <li>Your service address</li>
              <li>Vehicle information (make, model, year, type)</li>
              <li>Service selections and preferences</li>
              <li>Photos of your vehicle (if submitted)</li>
              <li>Any notes you choose to include</li>
            </ul>
            <p className="mt-3">
              We do not collect payment information through our website. We do not use cookies for
              tracking or advertising.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use the information you provide solely to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Schedule and confirm your detailing appointment</li>
              <li>
                Send you SMS text messages regarding your booking (confirmation, approval, or denial)
              </li>
              <li>Contact you if there are questions about your appointment</li>
              <li>Improve our services</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">4. SMS / Text Messaging</h2>
            <p className="mb-3">
              By submitting a booking request, you consent to receive SMS text messages from
              Marlow&apos;s Detailing at the phone number you provide. These messages will include:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Appointment confirmation or denial notifications</li>
              <li>Follow-up communications related to your service</li>
            </ul>
            <p className="mt-3">
              Message frequency varies. Standard message and data rates may apply. You may opt out
              at any time by replying <strong className="text-white">STOP</strong> to any message or
              by contacting us directly.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">5. Sharing Your Information</h2>
            <p>
              We do not sell, rent, or share your personal information with third parties for
              marketing purposes. Your data may be processed by the following service providers
              solely to operate our booking system:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 mt-3">
              <li>
                <strong className="text-white">Supabase</strong> — secure database storage for
                booking records
              </li>
              <li>
                <strong className="text-white">Twilio</strong> — SMS delivery for appointment
                notifications
              </li>
            </ul>
            <p className="mt-3">
              These providers are bound by their own privacy policies and are not permitted to use
              your data for any other purpose.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">6. Data Retention</h2>
            <p>
              We retain booking records for up to 2 years for business records purposes. You may
              request deletion of your data at any time by contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Opt out of SMS communications at any time</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:marlowdetails@gmail.com" className="text-brand hover:text-brand-light">
                marlowdetails@gmail.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">8. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under 18 years of age. We do not
              knowingly collect personal information from children.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with an updated date. Continued use of our website or services after changes
              constitutes acceptance of the updated policy.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-3">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
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
          <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">
            Terms of Service →
          </Link>
        </div>
      </div>
    </section>
  )
}
