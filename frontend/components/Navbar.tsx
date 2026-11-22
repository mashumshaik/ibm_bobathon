'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const links = [
  { href: '/service-discovery', label: 'Find Services' },
  { href: '/apply', label: 'Apply' },
  { href: '/status', label: 'Track Application' },
  { href: '/chat', label: '✨ AI Assistant' },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-700 text-lg">
          🏛 Prajaakeeya
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              {label}
            </Link>
          ))}
        </div>
        <Link href="/chat" className="btn-primary text-xs">
          Get Help Now
        </Link>
      </div>
    </nav>
  );
}
