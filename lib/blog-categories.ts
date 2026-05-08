export type BlogCategoryStyle = {
  badgeBg: string;
  badgeText: string;
  accentBg: string;
  accentBorder: string;
  hoverBorder: string;
  hoverText: string;
  filterActiveBg: string;
  filterActiveText: string;
  dot: string;
};

const STYLES: Record<string, BlogCategoryStyle> = {
  'Data Science': {
    badgeBg: 'bg-mx-blue',
    badgeText: 'text-white',
    accentBg: 'bg-mx-blue',
    accentBorder: 'border-mx-blue/40',
    hoverBorder: 'group-hover:border-mx-blue/60',
    hoverText: 'group-hover:text-mx-blue',
    filterActiveBg: 'bg-mx-blue',
    filterActiveText: 'text-white',
    dot: 'bg-mx-blue',
  },
  'E-Learning': {
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-white',
    accentBg: 'bg-emerald-500',
    accentBorder: 'border-emerald-500/40',
    hoverBorder: 'group-hover:border-emerald-500/60',
    hoverText: 'group-hover:text-emerald-500',
    filterActiveBg: 'bg-emerald-500',
    filterActiveText: 'text-white',
    dot: 'bg-emerald-500',
  },
};

const DEFAULT_STYLE: BlogCategoryStyle = {
  badgeBg: 'bg-mx-orange',
  badgeText: 'text-white',
  accentBg: 'bg-mx-orange',
  accentBorder: 'border-mx-orange/40',
  hoverBorder: 'group-hover:border-mx-orange/50',
  hoverText: 'group-hover:text-mx-orange',
  filterActiveBg: 'bg-mx-orange',
  filterActiveText: 'text-white',
  dot: 'bg-mx-orange',
};

export function getCategoryStyle(category?: string | null): BlogCategoryStyle {
  if (!category) return DEFAULT_STYLE;
  return STYLES[category] ?? DEFAULT_STYLE;
}
