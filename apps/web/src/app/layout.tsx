import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OmniCast Studio — Multimodal Graph RAG & Voice Broadcast',
  description: 'Autonomous research synthesis, interactive mind maps, dual-host podcasts, and full-duplex voice chat.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-zinc-950 text-zinc-100 flex flex-col h-screen">
        {children}
      </body>
    </html>
  );
}
