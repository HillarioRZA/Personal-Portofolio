import type { Metadata } from 'next';
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const description =
  'AI Systems Engineer based in Indonesia specializing in native multi-agent architectures, resilient backend web services, and data-layer engineering across PostgreSQL, MongoDB, and MySQL.';

export const metadata: Metadata = {
  title: 'Reza Pratama — AI Systems Engineer',
  description,
  metadataBase: new URL('https://rezapratamatandjung.my.id'),
  openGraph: {
    title: 'Reza Pratama — AI Systems Engineer',
    description,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Reza Pratama — AI Systems Engineer',
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} antialiased`}
      style={{ backgroundColor: '#05060A' }}
    >
      <body className="relative">{children}</body>
    </html>
  );
}
