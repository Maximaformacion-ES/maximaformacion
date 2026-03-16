'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { themeClasses } from './types';
import type { RangeFilterDropdownProps } from './types';

export function RangeFilterDropdown({
  id,
  icon,
  label,
  min,
  max,
  step,
  value,
  onChange,
  formatValue,
  isOpen,
  onToggle,
  variant = 'dark',
}: RangeFilterDropdownProps) {
  const tc = themeClasses[variant];
  const isActive = value[0] !== min || value[1] !== max;
  const activeLabel = isActive
    ? `${formatValue(value[0])} – ${formatValue(value[1])}`
    : label;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-body-sm transition-all ${
          isActive ? tc.btnActive : tc.btn
        }`}
      >
        {icon}
        <span className="whitespace-nowrap">{activeLabel}</span>
        <ChevronDown
          size={12}
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
            className={`absolute top-full left-0 mt-2 w-64 ${tc.dropdown} rounded-xl shadow-2xl p-4 z-50`}
          >
            {/* Range display */}
            <div className="flex items-center justify-between mb-4">
              <span className={`${tc.rangeValue} text-body-sm font-medium`}>{formatValue(value[0])}</span>
              <span className={`${tc.rangeDash} text-label-md`}>–</span>
              <span className={`${tc.rangeValue} text-body-sm font-medium`}>{formatValue(value[1])}</span>
            </div>

            {/* Min slider */}
            <div className="mb-3">
              <label className={`${tc.rangeLabel} text-label-md mb-1 block`}>Min</label>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[0]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onChange([Math.min(v, value[1]), value[1]]);
                }}
                className={`w-full accent-[${tc.accent}] h-1.5 ${tc.rangeTrack} rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[${tc.accent}]`}
              />
            </div>

            {/* Max slider */}
            <div className="mb-3">
              <label className={`${tc.rangeLabel} text-label-md mb-1 block`}>Max</label>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[1]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onChange([value[0], Math.max(v, value[0])]);
                }}
                className={`w-full accent-[${tc.accent}] h-1.5 ${tc.rangeTrack} rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[${tc.accent}]`}
              />
            </div>

            {/* Reset */}
            {isActive && (
              <button
                onClick={() => onChange([min, max])}
                className={`${tc.resetBtn} text-label-md hover:underline mt-1`}
              >
                Reset
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
