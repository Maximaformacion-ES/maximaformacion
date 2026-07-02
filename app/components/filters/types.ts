import type { ReactNode } from 'react';

// ─── Variant ────────────────────────────────────────────────────────

export type FilterVariant = 'dark' | 'light';

// ─── Theme class map ────────────────────────────────────────────────

export const themeClasses = {
  dark: {
    btn: 'bg-white/5 border border-white/10 text-white/70 hover:border-white/20 hover:text-white',
    btnActive: 'bg-[#527be7]/20 border border-[#527be7]/40 text-white',
    dropdown: 'bg-[#0b1018] border border-white/10',
    dropdownItem: 'text-white/60 hover:bg-white/5 hover:text-white',
    dropdownItemActive: 'bg-[#527be7]/20 text-white',
    accent: '#527be7',
    rangeLabel: 'text-white/40',
    rangeValue: 'text-white',
    rangeDash: 'text-white/30',
    rangeTrack: 'bg-white/10',
    resetBtn: 'text-[#527be7]',
    search: 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#527be7]/50',
    searchIcon: 'text-white/40',
    sortLabel: 'text-white',
    paginationBtn: 'border border-white/10 text-white/50 hover:border-white/20 hover:text-white',
    paginationText: 'text-white/60',
    paginationActive: 'bg-[#527be7] text-white',
    resultsText: 'text-white/40',
    divider: 'border-white/5',
  },
  light: {
    btn: 'bg-mx-card border border-mx-border text-mx-text-muted hover:border-mx-blue/50 hover:text-mx-text',
    btnActive: 'bg-mx-blue/10 border border-mx-blue/40 text-mx-text',
    dropdown: 'bg-mx-card border border-mx-border',
    dropdownItem: 'text-mx-text-muted hover:bg-mx-blue/5 hover:text-mx-text',
    dropdownItemActive: 'bg-mx-blue/10 text-mx-text',
    accent: '#527be7',
    rangeLabel: 'text-mx-text-muted',
    rangeValue: 'text-mx-text',
    rangeDash: 'text-mx-text-muted/30',
    rangeTrack: 'bg-mx-border',
    resetBtn: 'text-mx-blue',
    search: 'bg-mx-card border border-mx-border text-mx-text placeholder:text-mx-text-muted/50 focus:border-mx-blue',
    searchIcon: 'text-mx-text-muted',
    sortLabel: 'text-mx-text',
    paginationBtn: 'border border-mx-border text-mx-text-muted hover:border-mx-blue/50 hover:text-mx-text',
    paginationText: 'text-mx-text-muted',
    paginationActive: 'bg-mx-blue text-white',
    resultsText: 'text-mx-text-muted',
    divider: 'border-mx-border',
  },
} as const;

// ─── Component props ────────────────────────────────────────────────

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  id: string;
  icon: ReactNode;
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  variant?: FilterVariant;
}

export interface RangeFilterDropdownProps {
  id: string;
  icon: ReactNode;
  label: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue: (v: number) => string;
  isOpen: boolean;
  onToggle: () => void;
  variant?: FilterVariant;
}

export interface SortOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SortDropdownProps<T extends string = string> {
  options: SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
  isOpen: boolean;
  onToggle: () => void;
  sortLabel?: string;
  variant?: FilterVariant;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: FilterVariant;
}

export interface FilterBarProps {
  variant?: FilterVariant;
  /** When false, the "Filtros" toggle button and its expandable panel are not rendered. Defaults to true. */
  showFilterToggle?: boolean;
  filtersExpanded?: boolean;
  onToggleFilters?: () => void;
  hasActiveFilters?: boolean;
  filtersLabel?: string;
  /** Optional content at the start of the toolbar's left group (e.g. a type selector). */
  leadingSlot?: ReactNode;
  sortSlot: ReactNode;
  paginationSlot: ReactNode;
  searchSlot: ReactNode;
  /** Optional full-width row rendered below the toolbar, above the divider (e.g. category chips). */
  secondaryRow?: ReactNode;
  resultsCount: number;
  resultsLabel?: string;
  children?: ReactNode;
}
