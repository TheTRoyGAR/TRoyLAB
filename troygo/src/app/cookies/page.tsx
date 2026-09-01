import LegalLayout from '@/components/legal/LegalLayout'

export const metadata = { title: 'Cookie Policy | TRoyGO™' }

export default function CookiePolicyPage() {
  return (
    <LegalLayout title="Cookie Policy" updated="1 September 2026">
      <p>
        This policy explains how troytravelagency.com (TRoy Travel Agency™ / TRoyGO™) uses
        cookies.
      </p>

      <h2>What we actually use, honestly</h2>
      <p>
        At present, this site uses only <strong>essential/functional cookies</strong> — for
        example, to keep you signed in to the dashboard, if you have an account. We do not
        currently use third-party advertising, tracking, or analytics cookies.
      </p>

      <h2>If that changes</h2>
      <p>
        If we add analytics (e.g. to understand how visitors use the site) or advertising
        cookies in the future, we'll update this policy first and, where required by law,
        ask for your consent.
      </p>

      <h2>Managing cookies</h2>
      <p>
        You can control or delete cookies through your browser settings at any time. Blocking
        essential cookies may affect your ability to stay signed in to parts of the site.
      </p>

      <h2>Contact us</h2>
      <p>
        <a href="mailto:agency@troytravelagency.com">agency@troytravelagency.com</a>
      </p>
    </LegalLayout>
  )
}
