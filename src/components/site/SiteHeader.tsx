import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ADDRESS } from "@/lib/contact";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary font-display text-sm font-extrabold text-primary-foreground">
            СТО
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Гараж</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#calculator" className="transition-colors hover:text-foreground">
            Калькулятор
          </a>
          <a href="#contacts" className="transition-colors hover:text-foreground">
            Контакты
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            {ADDRESS.replace("г. Симферополь, ", "")}
          </span>
        </nav>
        <Button asChild size="sm" className="font-semibold">
          <a href="#calculator">Записаться</a>
        </Button>
      </div>
    </header>
  );
}
