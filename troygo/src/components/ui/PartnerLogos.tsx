import Image from 'next/image'

// Official logos of the companies TROYGO is registered / approved with. Logo only, no links.
const PARTNER_LOGOS = [
  { name: 'Duffel', src: '/partners/duffel.png', width: 180, height: 55 },
  { name: 'Jetstar', src: '/partners/jetstar.png', width: 230, height: 75 },
  { name: 'Viking', src: '/partners/viking.png', width: 155, height: 90 },
] as const

export default function PartnerLogos({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-10' : 'h-14'
  return (
    <ul className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
      {PARTNER_LOGOS.map((l) => (
        <li
          key={l.name}
          className={`bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center ${size === 'sm' ? 'px-4 py-2' : 'px-8 py-5'}`}
        >
          <Image src={l.src} alt={l.name} width={l.width} height={l.height} className={`${h} w-auto object-contain`} />
        </li>
      ))}
    </ul>
  )
}
