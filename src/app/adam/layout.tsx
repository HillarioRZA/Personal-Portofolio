import { Inter } from 'next/font/google';
import './adam.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-adam-sans',
  display: 'swap',
});

export default function AdamLayout({ children }: { children: React.ReactNode }) {
  return <div className={inter.variable}>{children}</div>;
}
