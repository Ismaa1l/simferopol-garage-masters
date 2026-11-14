import { ADDRESS } from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-graphite-deep">
      <div className="hazard-stripes h-1.5" />
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <span className="font-display font-bold text-foreground">СТО Гараж</span> · {ADDRESS}
        </div>
        <div>© {new Date().getFullYear()} Ремонт ходовой, карданов и ТО</div>
      </div>
    </footer>
  );
}
