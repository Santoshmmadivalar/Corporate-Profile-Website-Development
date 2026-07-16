import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AIChatbot } from '../components/ui/AIChatbot';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AI-Powered Enterprise Business Management Platform',
    template: '%s | Outpro.India'
  },
  description: 'AI-Powered Enterprise Business Management Platform by Outpro.India. Features client portals, interactive HR managers, schedule boards, dynamic analytics, and custom RAG AI document assistants.',
  keywords: ['enterprise business management', 'headless commerce', 'HR portal', 'B2B CRM software', 'RAG AI knowledge base', 'JWT security', 'Outpro India'],
  authors: [{ name: 'Outpro.India Team' }],
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'AI-Powered Enterprise Business Management Platform',
    description: 'Bespoke custom software and brand design engineered for high speed and scale.',
    url: 'https://outpro.in',
    siteName: 'Outpro.India',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Powered Enterprise Business Management Platform',
    description: 'Bespoke custom software and brand design engineered for high speed and scale.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`} style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-all duration-300">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-grow pt-20">
              {children}
            </main>
            <Footer />
            <AIChatbot />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
