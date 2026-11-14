import { ArrowRight, MessageCircle, ShieldCheck, Star, Timer, Wrench } from "lucide-react";

import heroImage from "@/assets/garage-hero.jpg";
import { Button } from "@/components/ui/button";
import { RATING } from "@/lib/contact";
import { openMaster } from "./events";

const FACTS = [
  { icon: Wrench, title: "Ходовая и карданы", text: "Основная специализация сервиса" },
  { icon: Timer, title: "Диагностика на подъёмнике", text: "Причина неисправности — до ремонта" },
  { icon: ShieldCheck, title: "Цена до начала работ", text: "Согласуем смету заранее" },
];

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <img
        src={heroImage}
        alt="Автомобиль на подъёмнике в автосервисе «СТО Гараж»"
        width={1600}
        height={1008}
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 -z-10" style={{ backgroundImage: "var(--gradient-hero)" }} />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40" style={{ backgroundImage: "var(--gradient-fade)" }} />

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-graphite-deep/70 px-4 py-2 text-sm backdrop-blur">
            <span className="flex items-center gap-0.5 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-primary" : "fill-primary/40"}`} />
              ))}
            </span>
            <span className="font-medium">
              Рейтинг {RATING.value} на основе {RATING.reviews} реальных отзывов
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-bold leading-[1.12] sm:text-4xl md:text-5xl">
            Профессиональный ремонт <span className="text-primary">ходовой, карданных валов</span> и ТО
            в Симферополе
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Находим причину стука, вибрации и люфта, ремонтируем подвеску и карданы, меняем тормоза и
            проводим плановое обслуживание.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-7 text-base font-bold shadow-accent">
              <a href="#calculator">
                Записаться на диагностику
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-foreground/25 bg-transparent px-6 text-base hover:bg-foreground/10"
              onClick={() => openMaster()}
            >
              <MessageCircle className="h-5 w-5" />
              Спросить мастера
            </Button>
          </div>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-3 md:mt-20">
          {FACTS.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-lg border border-border/70 bg-card/70 p-4 backdrop-blur"
            >
              <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <div className="font-semibold">{f.title}</div>
                <div className="text-sm text-muted-foreground">{f.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
