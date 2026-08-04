import HeroSection from '@/components/home/HeroSection';
import FeaturedDestinations from '@/components/home/FeaturedDestinations';
import FeaturedPackages from '@/components/home/FeaturedPackages';
import AIPlannerPromo from '@/components/home/AIPlannerPromo';
import FeaturedAgents from '@/components/home/FeaturedAgents';
import Testimonials from '@/components/home/Testimonials';

export default function Home() {
  return (
    <main className="flex flex-col flex-1 w-full overflow-x-hidden">
      {/* Hero with embedded search widget */}
      <HeroSection />

      {/* Top destinations grid */}
      <FeaturedDestinations />

      {/* Handpicked packages horizontal scroll */}
      <FeaturedPackages />

      {/* AI trip planner promo split-layout */}
      <AIPlannerPromo />

      {/* Travel expert agents */}
      <FeaturedAgents />

      {/* Customer testimonials carousel */}
      <Testimonials />
    </main>
  );
}
