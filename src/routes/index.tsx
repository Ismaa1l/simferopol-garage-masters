import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import { PriceCalculator } from "@/components/site/PriceCalculator";
import { Contacts } from "@/components/site/Contacts";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MasterChat } from "@/components/site/MasterChat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "СТО Гараж — ремонт ходовой, карданов и ТО в Симферополе" },
      {
        name: "description",
        content:
          "Автосервис «СТО Гараж» на Элеваторном переулке, 3. Ремонт ходовой, карданных валов, тормозов и плановое ТО. Рейтинг 4.6 по 92 отзывам. Онлайн-расчёт цены и запись 24/7.",
      },
      { property: "og:title", content: "СТО Гараж — ремонт ходовой, карданов и ТО в Симферополе" },
      {
        property: "og:description",
        content: "Рассчитайте стоимость ремонта онлайн и запишитесь на диагностику в «СТО Гараж», Симферополь.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <PriceCalculator />
        <Contacts />
      </main>
      <SiteFooter />
      <MasterChat />
    </div>
  );
}
