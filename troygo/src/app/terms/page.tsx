import LegalLayout from '@/components/legal/LegalLayout'

export const metadata = { title: 'Terms of Service | TRoyGO™' }

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="1 September 2026">
      <p>
        These Terms of Service ("Terms") govern your use of troytravelagency.com, operated by
        TRoy Travel Agency™ (TRoyGO™), ABN 30 302 098 137 ("we," "us," "our"). By using this
        site or submitting a booking enquiry, you agree to these Terms.
      </p>

      <h2>Our service</h2>
      <p>
        TRoyGO™ helps you find and enquire about flights, hotels, car rentals, vacation
        packages, and cruises. Submitting a booking request through our site is an enquiry —
        we confirm real availability and pricing with you directly before any booking is
        finalised. A booking is not confirmed until we send you written confirmation.
      </p>

      <h2>Accuracy of information</h2>
      <p>
        We do our best to keep pricing, availability, and package details accurate and
        up to date, but travel pricing changes constantly and depends on real, live supplier
        data. We'll confirm final pricing and availability with you before finalising any
        booking.
      </p>

      <h2>Payments</h2>
      <p>
        No payment processor is currently integrated into this site. Any payment
        arrangements will be confirmed directly with you as part of finalising a real booking,
        and this section will be updated once online payment is available.
      </p>

      <h2>Cancellations &amp; changes</h2>
      <p>
        Cancellation, change, and refund terms depend on the specific airline, hotel, cruise
        line, or other supplier for your booking, and will be provided to you at the time of
        booking confirmation.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>Provide accurate traveler information (names must match travel documents)</li>
        <li>Ensure you hold valid passports, visas, and any required travel documents</li>
        <li>Review booking confirmations carefully and raise any issues promptly</li>
      </ul>

      <h2>Limitation of liability</h2>
      <p>
        We act as a booking intermediary between you and travel suppliers (airlines, hotels,
        cruise lines, etc.). To the extent permitted by Australian Consumer Law, we are not
        liable for the acts, errors, omissions, or service failures of these third-party
        suppliers. Nothing in these Terms excludes any consumer guarantee you're entitled to
        under Australian Consumer Law that cannot lawfully be excluded.
      </p>

      <h2>Governing law</h2>
      <p>These Terms are governed by the laws of the Northern Territory, Australia.</p>

      <h2>Contact us</h2>
      <p>
        <a href="mailto:agency@troytravelagency.com">agency@troytravelagency.com</a> or
        +61 422 781 807.
      </p>
    </LegalLayout>
  )
}
