import Hero         from '../components/Hero/Hero';
import Features     from '../components/Features/Features';
import HowItWorks   from '../components/HowItWorks/HowItWorks';
import Testimonials from '../components/Testimonials/Testimonials';
import CTA          from '../components/CTA/CTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </>
  );
}
