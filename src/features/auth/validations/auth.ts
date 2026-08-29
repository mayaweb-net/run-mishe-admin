import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^09\d{9}$/, {
    error: "شماره موبایل معتبر نیست (مثال: 09123456789)",
  });

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z
    .string()
    .min(6, { error: "رمز عبور باید حداقل ۶ کاراکتر باشد" }),
});

export type LoginValues = z.infer<typeof loginSchema>;
