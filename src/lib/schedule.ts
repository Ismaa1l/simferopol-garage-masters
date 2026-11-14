// График работы и свободные окна для записи. Время — Симферополь (UTC+3).

export const TZ_OFFSET_HOURS = 3;
export const WORK_DAYS = [1, 2, 3, 4, 5, 6]; // пн–сб
export const OPEN_HOUR = 9;
export const CLOSE_HOUR = 19; // последняя запись в 18:00

export const SCHEDULE_TEXT = [
  { days: "Понедельник – Суббота", hours: "09:00 – 19:00" },
  { days: "Воскресенье", hours: "выходной" },
];

const WEEKDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

/** Подпись слота в местном времени, напр. «пн, 16 ноября, 10:00». */
export function slotLabel(iso: string) {
  const local = new Date(new Date(iso).getTime() + TZ_OFFSET_HOURS * 3600_000);
  const hh = String(local.getUTCHours()).padStart(2, "0");
  return `${WEEKDAYS[local.getUTCDay()]}, ${local.getUTCDate()} ${MONTHS[local.getUTCMonth()]}, ${hh}:00`;
}

/** Все рабочие часовые слоты на ближайшие `days` дней, начиная не раньше чем через час. */
export function workingSlots(now: Date, days = 7): string[] {
  const nowLocal = new Date(now.getTime() + TZ_OFFSET_HOURS * 3600_000);
  const earliest = now.getTime() + 3600_000;
  const slots: string[] = [];
  for (let d = 0; d < days; d++) {
    const day = new Date(Date.UTC(nowLocal.getUTCFullYear(), nowLocal.getUTCMonth(), nowLocal.getUTCDate() + d));
    if (!WORK_DAYS.includes(day.getUTCDay())) continue;
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
      const t = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h - TZ_OFFSET_HOURS);
      if (t >= earliest) slots.push(new Date(t).toISOString());
    }
  }
  return slots;
}
