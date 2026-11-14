// Примерные цены на работы (без запчастей). Итоговая цена — после диагностики.

export type BrandClass = "domestic" | "mass" | "premium";

export const BRAND_CLASS_LABEL: Record<BrandClass, string> = {
  domestic: "Отечественные",
  mass: "Иномарки",
  premium: "Премиум",
};

export const BRAND_CLASS_FACTOR: Record<BrandClass, number> = {
  domestic: 0.8,
  mass: 1,
  premium: 1.4,
};

export const BRANDS: { id: string; name: string; cls: BrandClass }[] = [
  { id: "lada", name: "Lada (ВАЗ)", cls: "domestic" },
  { id: "uaz", name: "УАЗ", cls: "domestic" },
  { id: "gaz", name: "ГАЗ", cls: "domestic" },
  { id: "toyota", name: "Toyota", cls: "mass" },
  { id: "kia", name: "Kia", cls: "mass" },
  { id: "hyundai", name: "Hyundai", cls: "mass" },
  { id: "volkswagen", name: "Volkswagen", cls: "mass" },
  { id: "skoda", name: "Skoda", cls: "mass" },
  { id: "renault", name: "Renault", cls: "mass" },
  { id: "nissan", name: "Nissan", cls: "mass" },
  { id: "mitsubishi", name: "Mitsubishi", cls: "mass" },
  { id: "ford", name: "Ford", cls: "mass" },
  { id: "chevrolet", name: "Chevrolet", cls: "mass" },
  { id: "chery", name: "Chery", cls: "mass" },
  { id: "haval", name: "Haval", cls: "mass" },
  { id: "geely", name: "Geely", cls: "mass" },
  { id: "bmw", name: "BMW", cls: "premium" },
  { id: "mercedes", name: "Mercedes-Benz", cls: "premium" },
  { id: "audi", name: "Audi", cls: "premium" },
  { id: "lexus", name: "Lexus", cls: "premium" },
  { id: "volvo", name: "Volvo", cls: "premium" },
  { id: "landrover", name: "Land Rover", cls: "premium" },
  { id: "other", name: "Другая марка", cls: "mass" },
];

export type ServiceId = "suspension" | "driveshaft" | "brakes" | "maintenance";

export const SERVICES: {
  id: ServiceId;
  name: string;
  short: string;
  base: [number, number];
  includes: string[];
}[] = [
  {
    id: "suspension",
    name: "Ремонт ходовой",
    short: "Рычаги, сайлентблоки, шаровые, стойки",
    base: [3500, 12000],
    includes: ["Диагностика подвески на подъёмнике", "Замена изношенных элементов", "Проверка после ремонта"],
  },
  {
    id: "driveshaft",
    name: "Ремонт кардана",
    short: "Крестовины, подвесной, балансировка",
    base: [4000, 15000],
    includes: ["Снятие и дефектовка вала", "Замена крестовин / подвесного", "Балансировка на стенде"],
  },
  {
    id: "brakes",
    name: "Замена тормозов",
    short: "Колодки, диски, суппорта, жидкость",
    base: [1800, 6000],
    includes: ["Замена колодок и дисков", "Обслуживание суппортов", "Прокачка тормозной системы"],
  },
  {
    id: "maintenance",
    name: "Плановое ТО",
    short: "Масло, фильтры, проверка узлов",
    base: [2500, 7000],
    includes: ["Замена масла и фильтров", "Осмотр по регламенту", "Рекомендации по ремонту"],
  },
];

const roundTo100 = (n: number) => Math.round(n / 100) * 100;

export function estimatePrice(brandId: string, serviceId: string) {
  const brand = BRANDS.find((b) => b.id === brandId);
  const service = SERVICES.find((s) => s.id === serviceId);
  if (!brand || !service) return null;
  const k = BRAND_CLASS_FACTOR[brand.cls];
  return { from: roundTo100(service.base[0] * k), to: roundTo100(service.base[1] * k) };
}

export const formatRub = (n: number) => `${n.toLocaleString("ru-RU").replace(/,/g, " ")} ₽`;

/** Текстовая таблица цен для онлайн-мастера. */
export function priceTableText() {
  const lines: string[] = [];
  for (const s of SERVICES) {
    const parts = (Object.keys(BRAND_CLASS_FACTOR) as BrandClass[]).map((cls) => {
      const k = BRAND_CLASS_FACTOR[cls];
      return `${BRAND_CLASS_LABEL[cls]}: ${formatRub(roundTo100(s.base[0] * k))}–${formatRub(roundTo100(s.base[1] * k))}`;
    });
    lines.push(`- ${s.name} (${s.short}): ${parts.join("; ")}`);
  }
  lines.push(
    `Классы марок: ${(Object.keys(BRAND_CLASS_LABEL) as BrandClass[])
      .map((cls) => `${BRAND_CLASS_LABEL[cls]} — ${BRANDS.filter((b) => b.cls === cls && b.id !== "other").map((b) => b.name).join(", ")}`)
      .join(". ")}. Прочие марки считаются как иномарки.`,
  );
  return lines.join("\n");
}
