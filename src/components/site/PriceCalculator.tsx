import { useMemo, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, CircleDot, Cog, Disc3, Droplets, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { nameSchema, phoneSchema } from "@/lib/contact";
import { submitServiceRequest } from "@/lib/garage.functions";
import {
  BRAND_CLASS_LABEL,
  BRANDS,
  SERVICES,
  estimatePrice,
  formatRub,
  type BrandClass,
  type ServiceId,
} from "@/lib/pricing";

const SERVICE_ICONS: Record<ServiceId, typeof Cog> = {
  suspension: CircleDot,
  driveshaft: Cog,
  brakes: Disc3,
  maintenance: Droplets,
};

const GROUPS: BrandClass[] = ["domestic", "mass", "premium"];

export function PriceCalculator() {
  const [brandId, setBrandId] = useState<string>("");
  const [serviceId, setServiceId] = useState<ServiceId | "">("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string | undefined; phone?: string | undefined }>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = useServerFn(submitServiceRequest);

  const price = useMemo(
    () => (brandId && serviceId ? estimatePrice(brandId, serviceId) : null),
    [brandId, serviceId],
  );
  const service = SERVICES.find((s) => s.id === serviceId);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!brandId || !serviceId) {
      toast.error("Выберите марку автомобиля и услугу");
      return;
    }
    const n = nameSchema.safeParse(name);
    const p = phoneSchema.safeParse(phone);
    const next = {
      name: n.success ? undefined : n.error.issues[0]?.message,
      phone: p.success ? undefined : p.error.issues[0]?.message,
    };
    setErrors(next);
    if (next.name || next.phone) return;

    setSending(true);
    try {
      const res = await submit({ data: { name, phone, brandId, serviceId } });
      if (res.ok) {
        setSent(true);
        toast.success("Заявка отправлена", { description: "Мастер перезвонит вам для подтверждения времени." });
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Не удалось отправить заявку. Проверьте данные и попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="calculator" className="scroll-mt-16 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Калькулятор</div>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl">Сколько будет стоить ремонт</h2>
          <p className="mt-3 text-muted-foreground">
            Выберите марку и услугу — покажем примерную стоимость работ сразу. Оставьте телефон, и мы
            запишем вас на удобное время.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          {/* Шаги выбора */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-7">
            <StepTitle n={1} title="Марка автомобиля" />
            <Select value={brandId} onValueChange={setBrandId}>
              <SelectTrigger className="mt-3 h-12 text-base" aria-label="Марка автомобиля">
                <SelectValue placeholder="Выберите марку" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {GROUPS.map((g) => (
                  <SelectGroup key={g}>
                    <SelectLabel>{BRAND_CLASS_LABEL[g]}</SelectLabel>
                    {BRANDS.filter((b) => b.cls === g && b.id !== "other").map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
                <SelectGroup>
                  <SelectLabel>Другое</SelectLabel>
                  <SelectItem value="other">Другая марка</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="mt-8">
              <StepTitle n={2} title="Услуга" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Услуга">
                {SERVICES.map((s) => {
                  const Icon = SERVICE_ICONS[s.id];
                  const active = serviceId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setServiceId(s.id)}
                      className={cn(
                        "group flex items-start gap-3 rounded-lg border p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border bg-background/40 hover:border-foreground/30",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-10 w-10 shrink-0 place-items-center rounded-md transition-colors",
                          active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-semibold">{s.name}</span>
                        <span className="block text-sm text-muted-foreground">{s.short}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Результат и форма */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-graphite-deep shadow-panel">
            <div className="hazard-stripes h-2" />
            <div className="flex flex-1 flex-col p-5 sm:p-7">
              <div className="text-sm text-muted-foreground">Примерная стоимость работ</div>
              <div className="mt-2 min-h-[3.5rem] font-display text-3xl font-bold leading-tight sm:text-4xl" aria-live="polite">
                {price ? (
                  <span>
                    <span className="text-lg font-semibold text-muted-foreground">от </span>
                    <span className="text-primary">{formatRub(price.from)}</span>
                    <span className="block text-lg font-semibold text-muted-foreground">
                      до {formatRub(price.to)}
                    </span>
                  </span>
                ) : (
                  <span className="text-xl text-muted-foreground">Выберите марку и услугу</span>
                )}
              </div>

              {service && (
                <ul className="mt-5 space-y-2 text-sm">
                  {service.includes.map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {i}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                Цена без учёта запчастей. Точная стоимость — после диагностики.
              </p>

              <div className="my-6 h-px bg-border" />

              {sent ? (
                <div className="rounded-lg border border-primary/40 bg-primary/10 p-4">
                  <div className="font-semibold">Спасибо, {name.trim()}!</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Заявка принята. Мастер перезвонит на {phone.trim()} и подберёт время.
                  </p>
                  <Button
                    variant="link"
                    className="mt-1 h-auto px-0"
                    onClick={() => {
                      setSent(false);
                      setName("");
                      setPhone("");
                    }}
                  >
                    Отправить ещё одну заявку
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4" noValidate>
                  <div>
                    <Label htmlFor="calc-name">Имя</Label>
                    <Input
                      id="calc-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Как к вам обращаться"
                      maxLength={80}
                      autoComplete="name"
                      className="mt-1.5 h-11"
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="calc-phone">Телефон</Label>
                    <Input
                      id="calc-phone"
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (978) 000-00-00"
                      maxLength={20}
                      autoComplete="tel"
                      className="mt-1.5 h-11"
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                  </div>
                  <Button type="submit" size="lg" className="h-12 w-full text-base font-bold" disabled={sending}>
                    {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Записаться на диагностику
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepTitle({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground">
        {n}
      </span>
      <span className="font-semibold">{title}</span>
    </div>
  );
}
