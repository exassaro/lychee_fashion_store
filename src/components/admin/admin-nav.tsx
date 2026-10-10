"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, FolderTree, LayoutDashboard, LogOut, Package, Settings } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function useActive() {
  const pathname = usePathname();
  return (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
}

export function AdminSidebar({ email }: { email: string }) {
  const isActive = useActive();
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-white lg:flex">
      <div className="flex h-16 items-center border-b px-5">
        <Logo href="/admin" className="h-9" />
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Admin">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-mist",
              isActive(href, exact) && "bg-brand-soft text-brand hover:bg-brand-soft",
            )}
          >
            <Icon className="size-5" /> {label}
          </Link>
        ))}
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-mist"
        >
          <ExternalLink className="size-5" /> View store
        </a>
      </nav>
      <div className="border-t p-3">
        <p className="truncate px-3 pb-2 text-xs text-ink/60" title={email}>{email}</p>
        <form action={signOut}>
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-mist">
            <LogOut className="size-5" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

export function AdminTopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 lg:hidden">
      <Logo href="/admin" className="h-8" />
      <div className="flex items-center gap-1">
        <a href="/" target="_blank" className="rounded-md p-2 text-ink/70 hover:bg-mist" aria-label="View store">
          <ExternalLink className="size-5" />
        </a>
        <form action={signOut}>
          <button className="rounded-md p-2 text-ink/70 hover:bg-mist" aria-label="Sign out">
            <LogOut className="size-5" />
          </button>
        </form>
      </div>
    </header>
  );
}

/** Thumb-friendly bottom tab bar for phones. */
export function AdminBottomNav() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Admin"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-white pb-safe lg:hidden"
    >
      {ITEMS.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-ink/60",
            isActive(href, exact) && "text-brand",
          )}
        >
          <Icon className="size-6" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
