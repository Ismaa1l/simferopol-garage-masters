import { z } from "zod";

export const ADDRESS = "г. Симферополь, Элеваторный переулок, 3";
export const RATING = { value: "4.6", reviews: 92 };

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+\d\s()-]{7,20}$/, "Введите корректный номер телефона")
  .refine((v) => v.replace(/\D/g, "").length >= 10, "Введите корректный номер телефона");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Укажите имя")
  .max(80, "Слишком длинное имя");
