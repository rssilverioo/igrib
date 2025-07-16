import './globals.css';
import { Inter } from 'next/font/google';
import SplashScreen from '@/components/SplashScreen';
import { Toaster } from "sonner"

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <SplashScreen />
      <Toaster richColors position="top-right"/>

        {children}
      </body>
    </html>
  );
}