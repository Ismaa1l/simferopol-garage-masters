import { GatewayError, generateResponse } from "@lovable.dev/ai-gateway";
import { z } from "zod";

import { ADDRESS } from "./contact";
import { nameSchema, phoneSchema } from "./contact";
import { priceTableText } from "./pricing";
import { SCHEDULE_TEXT, slotLabel, workingSlots } from "./schedule";

const MODEL = "openai/gpt-6-astra" as const;
type Payload = Parameters<typeof generateResponse<typeof MODEL>>[0];
type InputItems = Exclude<NonNullable<Payload["input"]>, string>;

function instructions() {
  const now = new Date();
  return `Ты — онлайн-мастер автосервиса «СТО Гараж» в Симферополе. Работаешь 24/7 в чате на сайте.
Отвечай по-русски, коротко, вежливо и по делу, как опытный мастер-приёмщик. Обращайся на «вы».

Адрес: ${ADDRESS}.
График: ${SCHEDULE_TEXT.map((s) => `${s.days}: ${s.hours}`).join("; ")}.
Сейчас: ${slotLabel(now.toISOString()).replace(/, \d\d:00$/, "")} (время Симферополя UTC+3).

Услуги и примерная стоимость работ (без запчастей):
${priceTableText()}

Правила:
- Называй цены только из таблицы выше, как диапазон «от … до …». Подчёркивай, что точная цена — после диагностики на подъёмнике.
- По другим работам не выдумывай цену: предложи записаться на диагностику.
- Чтобы записать клиента: узнай услугу, марку/модель авто, вызови get_free_slots и предложи 3–5 ближайших подходящих окон. Затем узнай имя и телефон. Перед записью кратко повтори детали и попроси подтвердить. После подтверждения вызови book_slot с точным значением slot из get_free_slots.
- Никогда не говори, что клиент записан, пока book_slot не вернул ok: true.
- Если вопрос не про автомобиль или сервис — вежливо верни разговор к теме.
- Не используй таблицы в ответах, только короткие абзацы и списки.`;
}

const tools: NonNullable<Payload["tools"]> = [
  {
    type: "function",
    name: "get_free_slots",
    description: "Свободные окна для записи в автосервис на ближайшие 7 дней (по часу).",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        date: {
          type: ["string", "null"],
          description: "Желаемая дата в формате YYYY-MM-DD (местное время) или null для ближайших дней",
        },
      },
      required: ["date"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "book_slot",
    description: "Записать клиента на выбранное свободное время. Вызывать только после подтверждения клиентом.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        slot: { type: "string", description: "Значение slot из get_free_slots (ISO)" },
        name: { type: "string", description: "Имя клиента" },
        phone: { type: "string", description: "Телефон клиента" },
        car: { type: "string", description: "Марка и модель автомобиля" },
        service: { type: "string", description: "Услуга, например «Ремонт кардана»" },
      },
      required: ["slot", "name", "phone", "car", "service"],
      additionalProperties: false,
    },
  },
];

async function freeSlots(date: string | null) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const all = workingSlots(new Date(), 7);
  if (all.length === 0) return [];
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("slot_at")
    .gte("slot_at", all[0])
    .lte("slot_at", all[all.length - 1]);
  if (error) throw error;
  const taken = new Set((data ?? []).map((r) => new Date(r.slot_at).toISOString()));
  let free = all.filter((s) => !taken.has(s));
  if (date) {
    const filtered = free.filter((s) => new Date(new Date(s).getTime() + 3 * 3600_000).toISOString().startsWith(date));
    if (filtered.length) free = filtered;
  }
  return free.slice(0, 20).map((slot) => ({ slot, label: slotLabel(slot) }));
}

const bookSchema = z.object({
  slot: z.string(),
  name: nameSchema,
  phone: phoneSchema,
  car: z.string().trim().min(1).max(120),
  service: z.string().trim().min(1).max(120),
});

async function bookSlot(raw: unknown) {
  const parsed = bookSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const { slot, name, phone, car, service } = parsed.data;
  const iso = new Date(slot).toISOString();
  if (!workingSlots(new Date(), 7).includes(iso)) {
    return { ok: false, error: "Это время недоступно. Запроси свежий список get_free_slots." };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("bookings")
    .insert({ slot_at: iso, name, phone, car, service, source: "chat" });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Это время только что заняли. Предложи другое." };
    console.error("bookings insert failed", error);
    return { ok: false, error: "Техническая ошибка записи" };
  }
  return { ok: true, slot: slotLabel(iso) };
}

async function runTool(name: string, args: string) {
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(args || "{}");
  } catch {
    return { error: "Некорректные аргументы" };
  }
  if (name === "get_free_slots") return { slots: await freeSlots((parsed.date as string | null) ?? null) };
  if (name === "book_slot") return bookSlot(parsed);
  return { error: "Неизвестный инструмент" };
}

export async function runMaster(
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<{ reply: string; booked: boolean; error?: string }> {
  const input: InputItems = messages.map((m) => ({ role: m.role, content: m.content }));
  let booked = false;
  try {
    for (let step = 0; step < 6; step++) {
      const res = await generateResponse({
        model: MODEL,
        instructions: instructions(),
        input,
        tools,
        include: ["reasoning.encrypted_content"],
        reasoning: { effort: "low" },
      });
      const calls = res.output.filter((o) => o.type === "function_call");
      if (calls.length === 0) {
        const text = res.output
          .flatMap((o) => (o.type === "message" ? o.content : []))
          .map((c) => (c.type === "output_text" ? c.text : ""))
          .join("")
          .trim();
        return { reply: text || "Уточните, пожалуйста, ваш вопрос.", booked };
      }
      input.push(...(res.output as unknown as InputItems));
      for (const call of calls) {
        if (call.type !== "function_call") continue;
        const result = await runTool(call.name, call.arguments);
        if (call.name === "book_slot" && (result as { ok?: boolean }).ok) booked = true;
        input.push({ type: "function_call_output", call_id: call.call_id, output: JSON.stringify(result) });
      }
    }
    return { reply: "Давайте уточним детали — напишите, пожалуйста, ещё раз, что нужно сделать.", booked };
  } catch (e) {
    if (e instanceof GatewayError) console.error("master gateway error", e.code, e.httpStatus, e.ids);
    else console.error("master error", e);
    return {
      reply: "",
      booked,
      error: "Мастер сейчас не может ответить. Попробуйте через минуту или оставьте заявку в калькуляторе.",
    };
  }
}
