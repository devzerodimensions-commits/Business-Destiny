import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Business Destiny | Business Astrology & Vastu',
  description:
    'Business and industrial astrology, factory Vastu, partnership analysis and consultation with Tejas Parikh.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
