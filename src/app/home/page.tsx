// app/page.tsx
import type { Metadata } from 'next';
import Header from '@/components/site/Header';
import Hero from '@/components/site/Hero';
import Footer from '@/components/site/Footer';
import AgentPromo from '@/components/site/AgentPromo';
import StudentPromo from '@/components/site/StudentPromo';
import Brands from '@/components/site/Brands';
import CTA from '@/components/site/CTA';


export const metadata: Metadata = {
  title: 'Apply Tech | Study Abroad Application Platform',
  description: 'Apply to top universities worldwide with our streamlined study abroad application platform. Get expert guidance, visa assistance, and scholarship opportunities.',
  keywords: 'study abroad, university application, international students, education abroad, visa assistance',
  authors: [{ name: 'Apply Tech' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Study Abroad Application Platform',
    description: 'Your gateway to international education',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Abroad Application',
    description: 'Apply to universities worldwide',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://applytech.org",
            "@type": "WebPage",
            "name": "Study Abroad Application Landing Page",
            "description": "Comprehensive platform for study abroad applications",
            "url": "https://applytech.org",
            "mainEntity": {
              "@type": "Service",
              "serviceType": "Study Abroad Consultation",
              "provider": {
                "@type": "Organization",
                "name": "Apply Tech"
              }
            }
          }),
        }}
      />

      <html lang="en">
      <head>
        <link rel="canonical" href="https://yourdomain.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://applytech.org",
              "@type": "EducationalOrganization",
              "name": "Study Abroad Platform",
              "description": "Study abroad application service",
              "url": "https://applytech.org",
            }),
          }}
        />
      </head>

       <body>
        <main className="min-h-screen bg-white">
        <Header />
        <Hero />
        <Brands />
        <CTA />
        <StudentPromo />
        <AgentPromo />
        <Footer />
       
      </main>
      </body>
    </html>
    </>
  );
}