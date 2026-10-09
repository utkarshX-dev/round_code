import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';

export const metadata = {
  title: 'ROUNDCode — Round Table DTU Coding & Skill Development Platform',
  description:
    'ROUNDCode is the private competitive coding and skill-development platform for Round Table Delhi Technological University (DTU) members. Weekly Problem of the Week (POTW), difficulty scoring, ratings, and developer profiles.',
  keywords: 'Round Table DTU, DTU, coding, POTW, LeetCode, Codeforces, developer platform',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
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
