import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Honest homepage section. TRoyGO does not have a public directory of local agents yet, so nobody is
// listed, rated or priced here. The section points to a real request form that reaches the agency inbox.
export default function FeaturedAgents() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-[#00B4D8] font-semibold text-sm uppercase tracking-widest mb-2">
              Expert Guidance
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#0A1628] leading-tight"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Local Experts, Introduced Personally
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl">
              We&apos;re building a network of local agents, tour operators and guides. Tell us where you&apos;re going
              and our team will reply personally.
            </p>
          </div>
          <Link
            href="/agents"
            className="self-start sm:self-auto flex items-center gap-2 text-[#0A1628] border-2 border-[#0A1628] hover:bg-[#0A1628] hover:text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Ask for an introduction
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div
          className="rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ background: 'linear-gradient(135deg, #0A1628 0%, #152D55 100%)' }}
        >
          <div>
            <h3
              className="text-xl font-bold text-white mb-1"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Are you a local agent, operator or guide?
            </h3>
            <p className="text-white/60 text-sm">Tell us about your business and we&apos;ll be in touch.</p>
          </div>
          <Link
            href="/partners#become-a-partner"
            className="flex items-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200] hover:from-[#FFE033] hover:to-[#FFD700] text-[#0A1628] font-bold px-7 py-3 rounded-xl whitespace-nowrap"
          >
            Partner with us
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
