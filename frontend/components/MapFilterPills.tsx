"use client";

import React from 'react';

interface MapFilterPillsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function MapFilterPills({ activeFilter, onFilterChange }: MapFilterPillsProps) {
  const filters = ['All', 'Chai', 'Snacks', 'Café', 'Open Now'];

  return (
    <div 
      className="flex gap-2 p-3 overflow-x-auto no-scrollbar absolute top-0 left-0 right-0 z-[1000] w-full"
      style={{
        background: 'linear-gradient(to bottom, rgba(255,251,245,0.95) 70%, transparent)',
      }}
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className="px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all shadow-sm"
            style={{
              backgroundColor: isActive ? '#F47C2B' : '#FFFFFF',
              color: isActive ? '#FFFFFF' : '#2C1810',
              borderColor: isActive ? '#F47C2B' : '#E8E0D5',
            }}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
