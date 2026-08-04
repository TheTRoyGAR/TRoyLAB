import Link from 'next/link'
import { Star, MapPin, Globe, ShieldCheck, MessageSquare } from 'lucide-react'

interface AgentCardProps {
  id: number
  name: string
  agency?: string
  specialty: string[]
  regions?: string[]
  location: { city: string; country: string }
  rating: number
  reviewCount: number
  yearsExperience: number
  toursOffered?: number
  languages: string[]
  avatar: string
  verified: boolean
  bio: string
  featuredTours?: { name: string; price: number; duration: string }[]
  type: 'agent' | 'guide'
}

const AVATAR_COLORS = [
  'from-violet-500 to-purple-700',
  'from-teal-500 to-cyan-600',
  'from-orange-400 to-red-500',
  'from-green-500 to-emerald-700',
  'from-blue-500 to-indigo-700',
  'from-pink-500 to-rose-600',
]

export default function AgentCard({
  id, name, agency, specialty, location, rating, reviewCount,
  yearsExperience, toursOffered, languages, avatar, verified,
  bio, featuredTours, type,
}: AgentCardProps) {
  const colorClass = AVATAR_COLORS[id % AVATAR_COLORS.length]

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden group">
      {/* Header — the whole content block links to the profile; the two
          footer actions below stay as their own distinct links. */}
      <Link href={`/agents/${id}`} className="block p-5 pb-4">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-xl font-black text-white shrink-0`}>
            {avatar}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="font-bold text-[#0A1628] text-base leading-snug truncate group-hover:text-[#00B4D8] transition-colors">
                {name}
              </h3>
              {verified && (
                <span title="Verified by TRoyGO™">
                  <ShieldCheck className="h-4 w-4 text-[#00B4D8] shrink-0" />
                </span>
              )}
            </div>
            {agency && <p className="text-xs text-gray-500 mb-1 truncate">{agency}</p>}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="h-3 w-3 text-[#00B4D8]" />
              {location.city}, {location.country}
            </div>
          </div>

          {/* Rating */}
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <Star className="h-3.5 w-3.5 fill-[#FFD700] text-[#FFD700]" />
              <span className="font-bold text-[#0A1628] text-sm">{rating}</span>
            </div>
            <p className="text-xs text-gray-400">{reviewCount} reviews</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{bio}</p>

        {/* Specialty tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {specialty.slice(0, 3).map((s) => (
            <span key={s} className="text-xs bg-[#0A1628]/5 text-[#0A1628] font-medium px-2.5 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <span className="font-bold text-[#0A1628]">{yearsExperience}</span> yrs exp
          </span>
          {toursOffered && (
            <span className="flex items-center gap-1">
              <span className="font-bold text-[#0A1628]">{toursOffered}</span> tours
            </span>
          )}
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3 text-[#00B4D8]" />
            {languages.slice(0, 2).join(', ')}
          </span>
        </div>

        {/* Featured tours */}
        {featuredTours && featuredTours.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {featuredTours.slice(0, 2).map((tour, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-[#0A1628] leading-snug">{tour.name}</p>
                  <p className="text-xs text-gray-400">{tour.duration}</p>
                </div>
                <span className="text-xs font-bold text-[#00B4D8]">from ${tour.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </Link>

      {/* Footer actions */}
      <div className="px-5 pb-5 flex gap-2">
        <Link
          href={`/agents/${id}`}
          className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: '#00B4D8' }}
        >
          View Profile
        </Link>
        <Link
          href={`/agents/${id}?contact=1`}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-[#00B4D8] text-[#00B4D8] hover:bg-[#00B4D8]/5 transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Contact
        </Link>
      </div>
    </div>
  )
}
