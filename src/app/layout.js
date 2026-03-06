import './globals.css';
import { GlobalProvider } from './context/GlobalContext';
import { ClerkProvider } from '@clerk/nextjs';
import Providers from './providers';
import { clerkAppearance } from './lib/clerkAppearance';

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
            </ClerkProvider>
          </Providers>
        </GlobalProvider>
      </body>
    </html>
  );
}
