import LegalLayout from '@/components/legal/LegalLayout'

export const metadata = { title: 'Privacy Policy | TRoyGO™' }

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="1 September 2026">
      <p>
        TRoy Travel Agency™ (TRoyGO™), ABN 30 302 098 137 ("we," "us," "our"), respects your
        privacy. This policy explains what personal information we collect through
        troytravelagency.com, how we use it, and your rights under the Australian Privacy
        Principles (Privacy Act 1988, Cth).
      </p>

      <h2>What we collect</h2>
      <p>We collect only the information needed to provide our travel booking service:</p>
      <ul>
        <li>Contact details you give us — name, email address, phone number</li>
        <li>
          Travel booking details — traveler names, requested flights, hotels, car rentals,
          packages, cruises, and any special requests you provide when making a booking
        </li>
        <li>Communications — emails and enquiries you send us</li>
        <li>Newsletter subscription — your email address, if you sign up</li>
        <li>Partner applications — business details submitted through our partner form</li>
      </ul>
      <p>
        <strong>We do not currently process payment card data directly.</strong> No payment
        processor is integrated into troytravelagency.com at this time. If we add one in the
        future, this policy will be updated to describe exactly what payment data is collected
        and by whom.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To process and manage your booking enquiries and requests</li>
        <li>To communicate with you about your booking, by email</li>
        <li>To send newsletter updates, only if you've subscribed</li>
        <li>To evaluate partner applications</li>
        <li>To improve our services</li>
      </ul>

      <h2>Where it's stored</h2>
      <p>
        Your information is stored in our booking and contact database (hosted on Neon,
        a managed PostgreSQL provider) and our site runs on Vercel and Cloudflare
        infrastructure. Emails are sent via Google's Gmail service. We take reasonable steps to
        keep this information secure, but no online system can be guaranteed 100% secure.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We don't sell your personal information. We may share booking details with the
        specific airline, hotel, cruise line, or other travel supplier necessary to fulfil your
        booking. We may also share information with our real hosting/infrastructure providers
        (Vercel, Neon, Cloudflare, Google) strictly as needed to operate the service.
      </p>

      <h2>Cookies</h2>
      <p>
        See our <a href="/cookies">Cookie Policy</a> for details on the limited, functional
        cookies this site currently uses.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us what personal information we hold about you, request a correction, or
        ask us to delete it, by contacting us below. We'll respond within a reasonable time.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about this policy or your data: <a href="mailto:agency@troytravelagency.com">agency@troytravelagency.com</a> or
        +61 422 781 807.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy as our service changes — for example, if we add a payment
        processor or analytics tool. We'll update the "Last updated" date above when we do.
      </p>
    </LegalLayout>
  )
}
