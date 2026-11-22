import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Prajaakeeya — Citizen Services Portal',
  description: 'AI-powered public services portal. Discover benefits, apply for services, and track your applications — all in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-gray-200 bg-white mt-16">
          <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold text-base">🏛 Prajaakeeya</span>
              <span>— Citizen Services Portal</span>
            </div>
            <div className="flex gap-6">
              <a href="/service-discovery" className="hover:text-blue-600 transition-colors">Services</a>
              <a href="/apply" className="hover:text-blue-600 transition-colors">Apply</a>
              <a href="/status" className="hover:text-blue-600 transition-colors">Track</a>
              <a href="/chat" className="hover:text-blue-600 transition-colors">AI Assistant</a>
            </div>
            <p>Powered by IBM watsonx</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
