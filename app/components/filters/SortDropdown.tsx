'use client';

import React from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { themeClasses } from './types';
import type { SortDropdownProps } from './types';

export function SortDropdown<T extends string = string>({
  options,
  value,
  onChange,
  isOpen,
  onToggle,
  sortLabel,
  variant = 'dark',
}: SortDropdownProps<T>) {
  const tc = themeClasses[variant];
  const activeLabel = options.find((o) => o.value === value)?.label ?? '';

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${tc.btn} transition-all`}
      >
        <ArrowUpDown size={13} />
        {sortLabel && (
          <span className="hidden sm:inline whitespace-nowrap">
            {sortLabel}:
          </span>
        )}
        <span className={`${tc.sortLabel} whitespace-nowrap`}>{activeLabel}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full right-0 mt-2 min-w-[220px] ${tc.dropdown} rounded-xl shadow-2xl overflow-hidden z-50`}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  option.value === value
                    ? tc.dropdownItemActive
                    : tc.dropdownItem
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
