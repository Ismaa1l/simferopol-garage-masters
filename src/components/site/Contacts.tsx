import { Clock, MapPin, MessageCircle, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ADDRESS } from "@/lib/contact";
import { SCHEDULE_TEXT } from "@/lib/schedule";
import { openMaster } from "./events";

const MAP_QUERY = encodeURIComponent("Симферополь, Элеваторный переулок, 3");

export function Contacts() {
  return (
    <section id="contacts" className="section-light scroll-mt-16 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Контакты</div>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl">Как нас найти</h2>

          <div className="mt-8 space-y-6">
            <div className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-graphite-deep text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm text-muted-foreground">Адрес</div>
                <div className="mt-0.5 text-lg font-semibold">{ADDRESS}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-graphite-deep text-primary">
                <Clock className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">График работы</div>
                <dl className="mt-1 divide-y divide-border">
                  {SCHEDULE_TEXT.map((r) => (
                    <div key={r.days} className="flex justify-between gap-4 py-2">
                      <dt>{r.days}</dt>
                      <dd className="font-semibold">{r.hours}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-sm text-muted-foreground">Онлайн-мастер в чате отвечает круглосуточно.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 font-bold">
              <a href={`https://yandex.ru/maps/?rtext=~${MAP_QUERY}`} target="_blank" rel="noreferrer">
                <Navigation className="h-4 w-4" />
                Построить маршрут
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-foreground/20 bg-transparent"
              onClick={() => openMaster("Хочу записаться на ближайшее свободное время")}
            >
              <MessageCircle className="h-4 w-4" />
              Записаться в чате
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          <iframe
            title="СТО Гараж на карте"
            src={`https://yandex.ru/map-widget/v1/?text=${MAP_QUERY}&z=16`}
            className="h-[360px] w-full md:h-full md:min-h-[440px]"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
