"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/budgets", label: "Budgets" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/accounts", label: "Accounts" },
  { href: "/goals", label: "Goals" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col bg-gray-900 text-white">
      <div className="px-6 py-5 text-xl font-bold tracking-tight">
        AXM Fiscal
      </div>
      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-1">
          {navItems.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-6 py-4 text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Deven
      </div>
    </aside>
  );
}
