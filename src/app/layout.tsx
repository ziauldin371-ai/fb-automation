import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NexusPulse | Autonomous AI Facebook Architect Engine',
  description:
    'Enterprise autonomous content & Facebook automation engine by Zia-ul-din, Full Stack AI & Automation Architect. Autonomous 3-daily posting pipeline on Vercel.',
  keywords: [
    'AI Automation',
    'Facebook Automation',
    'Next.js 15',
    'Vercel Cron',
    'LLMs',
    'Python',
    'Full Stack AI',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
