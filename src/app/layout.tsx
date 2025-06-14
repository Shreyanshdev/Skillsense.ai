import { Providers } from '../redux/provider';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'SkillSense.AI',
  description: 'AI-powered career path assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" suppressHydrationWarning className={poppins.variable}>
        <body className="font-sans">
          <Providers>
            {children}
            <Toaster position="top-center" reverseOrder={false} />
          </Providers>
        </body>
      </html>

  );
}