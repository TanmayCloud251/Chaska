"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Map, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom navigation on shop/place detail pages to prevent overlap with sticky CTA
  if (pathname?.startsWith('/place/')) {
    return null;
  }

  const navItems = [
    { label: 'Feed', href: '/', icon: Compass },
    { label: 'Map', href: '/map', icon: Map },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-border/60 py-2 shadow-[0_-4px_20px_rgba(44,24,16,0.03)]">
      <div className="max-w-md mx-auto flex justify-around items-center px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 relative transition-all duration-200 ${
                isActive 
                  ? 'text-primary-container scale-[1.02]' 
                  : 'text-muted-text hover:text-foreground'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-primary-container' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-primary-container rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
