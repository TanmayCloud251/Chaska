"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { MapPin } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { user, setLoginSheetOpen } = useAuth();

  // Conditionally render only on the Feed Screen (/) and Map Screen (/map)
  const showHeader = pathname === '/' || pathname === '/map';
  if (!showHeader) return null;

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-border/25">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-1.5 text-primary">
        <span className="font-heading text-xl font-extrabold tracking-wide text-primary">Chaska</span>
      </Link>

      {/* Location Pill */}
      <div className="flex items-center gap-1 bg-surface-container-low border border-border/30 px-3.5 py-1.5 rounded-full text-xs font-bold select-none shadow-sm">
        <MapPin size={12} className="text-primary" />
        <span className="text-black">Rajnandgaon</span>
      </div>

      {/* Avatar / Profile Trigger */}
      {user ? (
        <Link 
          href="/profile" 
          className="w-9 h-9 rounded-full overflow-hidden border border-border shadow-sm hover:scale-105 transition-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
            alt={user.name || 'User'} 
            className="w-full h-full object-cover"
          />
        </Link>
      ) : (
        <button
          onClick={() => setLoginSheetOpen(true)}
          className="text-xs font-bold bg-primary text-white px-3.5 py-1.5 rounded-btn shadow-sm hover:bg-orange-600 transition-colors"
        >
          Log In
        </button>
      )}
    </header>
  );
}
