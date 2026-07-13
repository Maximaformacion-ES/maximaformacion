'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users } from 'lucide-react';

const items = [{ href: '/admin/alumnos', label: 'Alumnos', icon: Users }];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 p-3 space-y-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? 'bg-mx-orange/10 text-mx-orange-dark font-medium'
                : 'text-mx-text-muted hover:bg-black/[0.04] hover:text-mx-text'
            }`}
          >
            <Icon size={16} className={active ? 'text-mx-orange' : 'text-mx-text-muted'} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
