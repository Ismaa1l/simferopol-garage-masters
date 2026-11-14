import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { BRANDS, SERVICES, estimatePrice } from "./pricing";
import { nameSchema, phoneSchema } from "./contact";

const requestSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  brandId: z.string().refine((v) => BRANDS.some((b) => b.id === v), "Выберите марку"),
  serviceId: z.string().refine((v) => SERVICES.some((s) => s.id === v), "Выберите услугу"),
});

export const submitServiceRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => requestSchema.parse(input))
  .handler(async ({ data }) => {
    const price = estimatePrice(data.brandId, data.serviceId);
    const brand = BRANDS.find((b) => b.id === data.brandId)!;
    const service = SERVICES.find((s) => s.id === data.serviceId)!;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("service_requests").insert({
      name: data.name,
      phone: data.phone,
      car_brand: brand.name,
      service: service.name,
      price_from: price?.from ?? null,
      price_to: price?.to ?? null,
    });
    if (error) {
      console.error("service_requests insert failed", error);
      return { ok: false as const, error: "Не удалось отправить заявку. Попробуйте ещё раз." };
    }
    return { ok: true as const };
  });

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1500),
      }),
    )
    .min(1)
    .max(30),
});

export const askMaster = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => chatSchema.parse(input))
  .handler(async ({ data }) => {
    const { runMaster } = await import("./master.server");
    return runMaster(data.messages);
  });
