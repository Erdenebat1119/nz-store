"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Самбар", ready: true },
  { href: "/products", label: "Бараа", ready: true },
  { href: "#", label: "Захиалга", ready: false },
  { href: "#", label: "Карго", ready: false },
  { href: "#", label: "POS", ready: false },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 md:flex-col">
      {ITEMS.map((item) => {
        const active = item.ready && (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));
        if (!item.ready) {
          return (
            <span key={item.label} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted/60">
              {item.label}
              <span className="ml-2 hidden rounded-full bg-paper px-2 text-[11px] md:inline">удахгүй</span>
            </span>
          );
        }
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-accent-soft text-accent" : "text-muted hover:bg-paper hover:text-ink"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
