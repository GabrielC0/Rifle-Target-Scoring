"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Trophy, BarChart3, Settings } from "lucide-react";

const navigation = [
  {
    name: "Accueil",
    href: "/",
    icon: Home,
  },
  {
    name: "Classement",
    href: "/classement",
    icon: BarChart3,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-sm">
      <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl px-1 sm:px-2 py-2">
        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 min-w-[60px] sm:min-w-auto",
                  isActive
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <item.icon className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-sm leading-none sm:leading-normal">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
