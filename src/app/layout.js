import './globals.css';
import { GlobalProvider } from './context/GlobalContext';
import { ClerkProvider } from '@clerk/nextjs';
import Providers from './providers';
import { clerkAppearance } from './lib/clerkAppearance';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Fluentor - Speak English naturally and fluently',
  description:
    'Practice English pronunciation with AI-powered feedback. Improve your speaking fluency, accuracy, and confidence with Fluentor.',
  metadataBase: new URL('https://www.fluentor.app'),
  alternates: {
    canonical: 'https://www.fluentor.app',
  },
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Fluentor - Speak English naturally and fluently',
    description:
      'Practice English pronunciation with AI-powered feedback. Improve your speaking fluency, accuracy, and confidence with Fluentor.',
    url: 'https://www.fluentor.app',
    siteName: 'Fluentor',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'Fluentor' },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fluentor - Speak English naturally and fluently',
    description:
      'Practice English pronunciation with AI-powered feedback. Improve your speaking fluency, accuracy, and confidence with Fluentor.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GlobalProvider>
          <Providers>
            <ClerkProvider appearance={clerkAppearance}>
              {children}
              <Analytics />
              <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-KH0NX580QF"
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-KH0NX580QF');
                `}
              </Script>
            </ClerkProvider>
          </Providers>
        </GlobalProvider>
      </body>
    </html>
  );
}
