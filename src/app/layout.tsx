import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '🚀 SI OPEN AI v15.0 - Ultimate Hybrid | 200+ Features',
  description: 'AI Chat | Image Gen | Code | Research | 100+ Languages | বাংলা + English',
  themeColor: '#a78bfa',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>" />
        <meta name="description" content="SI OPEN AI v15.0 - The Ultimate AI Platform" />
      </head>
      <body>{children}</body>
    </html>
  );
}
