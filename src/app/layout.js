import './globals.css';
import { GlobalProvider } from './context/GlobalContext';
import { ClerkProvider } from '@clerk/nextjs';
import Providers from './providers';
import { clerkAppearance } from './lib/clerkAppearance';
import Script from 'next/script';

export const metadata = {
  title: 'Fluentor - Intelligent Tutoring Platform',
  icons: {
    icon: '/favicon.ico',
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
