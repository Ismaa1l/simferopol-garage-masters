import { describe, expect, it } from "vitest";

import { estimatePrice } from "@/lib/pricing";
import { workingSlots } from "@/lib/schedule";

describe("Калькулятор цены", () => {
  it("для иномарки ремонт кардана стоит 4 000–15 000 ₽", () => {
    expect(estimatePrice("toyota", "driveshaft")).toEqual({ from: 4000, to: 15000 });
  });
  it("для премиум-марки цена выше в 1.4 раза", () => {
    expect(estimatePrice("bmw", "driveshaft")).toEqual({ from: 5600, to: 21000 });
  });
  it("неизвестная услуга не считается", () => {
    expect(estimatePrice("toyota", "paint")).toBeNull();
  });
});

describe("Окна для записи", () => {
  // Суббота 14.11.2026, 17:45 по Симферополю (14:45 UTC)
  const now = new Date("2026-11-14T14:45:00Z");
  const slots = workingSlots(now, 7);
  const localHour = (iso: string) => (new Date(iso).getUTCHours() + 3) % 24;
  const localDay = (iso: string) => new Date(new Date(iso).getTime() + 3 * 3600_000).getUTCDay();

  it("не предлагает воскресенье", () => {
    expect(slots.some((s) => localDay(s) === 0)).toBe(false);
  });
  it("записывает только с 9:00 до 18:00 по местному времени", () => {
    expect(slots.every((s) => localHour(s) >= 9 && localHour(s) <= 18)).toBe(true);
  });
  it("не предлагает время раньше, чем через час", () => {
    expect(slots[0]).toBe("2026-11-14T15:00:00.000Z"); // сб 18:00 местного
  });
});
