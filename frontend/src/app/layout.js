import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://roundcode.vercel.app'),
  title: {
    default: 'RoundCode — Round Table DTU',
    template: '%s | RoundCode',
  },
  description:
    'RoundCode is the private competitive coding and skill-development platform for Round Table Delhi Technological University (DTU) members. Weekly Problem of the Week (POTW), difficulty scoring, ratings, and developer profiles.',
  keywords: [
    'Round Table DTU',
    'competitive programming',
    'coding challenges',
    'weekly coding challenge',
    'POTW',
    'LeetCode',
    'Codeforces',
    'developer portfolio',
  ],
  applicationName: 'RoundCode',
  authors: [{ name: 'Round Table DTU' }],
  creator: 'Round Table DTU',
  publisher: 'Round Table DTU',
  alternates: {
    canonical: '/',
  },
  category: 'education',
  openGraph: {
    type: 'website',
    siteName: 'RoundCode by Round Table DTU',
    title: 'RoundCode — Weekly Coding Challenges for Round Table DTU',
    description:
      'Solve weekly algorithmic challenges, receive verified code reviews, and build your competitive programming profile with Round Table DTU.',
    url: '/',
    images: [
      {
        url: '/roundtable-icon.png',
        width: 690,
        height: 650,
        alt: 'Round Table DTU logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'RoundCode — Round Table DTU',
    description: 'Weekly coding challenges, verified reviews, and transparent ratings for Round Table DTU members.',
    images: ['/roundtable-icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/roundtable-icon.png',
    shortcut: '/roundtable-icon.png',
    apple: '/roundtable-icon.png',
  },
};

export const viewport = {
  themeColor: '#090a0f',
  colorScheme: 'dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0c10] text-zinc-100 antialiased selection:bg-[#a3ff20] selection:text-black">
        <AuthProvider>
          <Suspense fallback={<div className="min-h-screen bg-[#0b0c10]" />}>
            <AppLayout>{children}</AppLayout>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
