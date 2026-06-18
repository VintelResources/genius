"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/courses", label: "Courses" },
  { href: "/play", label: "Play" },
  { href: "/wallet", label: "Wallet" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/daily", label: "Daily" }
] as const;

export default function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/courses" className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/20 bg-white/5 p-1 shadow-[0_0_30px_rgba(34,211,238,0.18)]">
            <Image
              src="/genius-logo.png"
              alt="Genius Web logo"
              width={64}
              height={64}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">
              Genius Web
            </div>
            <div className="text-sm font-semibold text-white">
              Learn. Earn. Become a Genius.
            </div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.18)]"
                    : "border-white/10 bg-white/5 text-white/75 hover:border-fuchsia-300/20 hover:bg-fuchsia-400/10 hover:text-white"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                <span
                  className={`absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-300/10 to-fuchsia-400/0 transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

