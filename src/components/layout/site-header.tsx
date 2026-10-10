"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { WhatsAppIcon } from "@/components/icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { GENERAL_QUERY_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0];
  if (path === "/") return pathname === "/";
  if (href.includes("?")) return false;
  return pathname.startsWith(path);
}

export function SiteHeader({ whatsappNumber, tagline }: { whatsappNumber: string; tagline: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    setSearchOpen(false);
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container flex h-16 items-center gap-2 md:h-20">
        <button
          type="button"
          className="-ml-2 rounded-md p-2 text-ink hover:bg-mist lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </button>

        <Logo priority className="h-10 md:h-12" />

        <nav aria-label="Main" className="ml-8 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-md px-3 py-2 text-[15px] font-medium text-ink/80 transition-colors hover:text-brand",
                isActive(pathname, link.href) &&
                  "text-brand after:absolute after:inset-x-3 after:-bottom-[1px] after:h-0.5 after:rounded-full after:bg-brand",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="rounded-full p-2.5 text-ink transition-colors hover:bg-mist hover:text-brand"
            aria-label="Search products"
          >
            <Search className="size-5" />
          </button>
          {whatsappNumber && (
            <a
              href={whatsappLink(whatsappNumber, GENERAL_QUERY_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2.5 text-[#128C4A] transition-colors hover:bg-leaf-soft"
              aria-label="Chat with us on WhatsApp"
            >
              <WhatsAppIcon className="size-5" />
            </a>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="gap-0 p-0">
          <div className="border-b px-5 py-4">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">Site navigation</SheetDescription>
            <div className="h-10" onClick={() => setMenuOpen(false)}>
              <Logo className="h-10" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>
          </div>
          <nav aria-label="Mobile" className="flex flex-col p-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-md px-3 py-3 text-base font-medium text-ink hover:bg-mist",
                  isActive(pathname, link.href) && "bg-brand-soft text-brand",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {whatsappNumber && (
            <div className="mt-auto border-t p-4">
              <Button asChild variant="whatsapp" size="lg" className="w-full">
                <a href={whatsappLink(whatsappNumber, GENERAL_QUERY_MESSAGE)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="size-5" /> Chat on WhatsApp
                </a>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Search */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="top-[15%] translate-y-0 sm:max-w-xl">
          <DialogTitle className="text-lg">Search products</DialogTitle>
          <form onSubmit={submitSearch} className="flex gap-2" role="search">
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name or code, e.g. kurti or LY-K-0012"
              aria-label="Search by name or product code"
              className="h-12"
            />
            <Button type="submit" size="lg" aria-label="Search">
              <Search />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
