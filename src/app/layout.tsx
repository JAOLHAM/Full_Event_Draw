import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Lucky Draw • Event Studio', description: 'Lucky Draw Event System' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body suppressHydrationWarning>{children}</body></html>;
}
