"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Feed', href: '/', icon: Home },
    { label: 'Map', href: '/map', icon: Map },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border py-2 shadow-[0_-2px_10px_rgba(44,24,16,0.05)]">
      <div className="max-w-md mx-auto flex justify-around items-center px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-primary scale-105' 
                  : 'text-muted-text hover:text-foreground hover:scale-102'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 1.75} />
              <span className={`text-[11px] font-semibold tracking-wide ${isActive ? 'text-primary font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
