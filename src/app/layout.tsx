import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import SplashScreen from '@/components/SplashScreen';
import { Toaster } from 'sonner';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'iGrib - Marketplace Agricola',
  description: 'Conectando produtores e compradores',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <Providers>
          <SplashScreen />
          <Toaster richColors position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
