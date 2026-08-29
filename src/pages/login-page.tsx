import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/main/logo";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  loginSchema,
  type LoginValues,
} from "@/features/auth/validations/auth";
import { siteConfig } from "@/lib/site";

export function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(() => {
    navigate("/dashboard");
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo showName size="lg" />
        <p className="text-sm text-muted-foreground">{siteConfig.description}</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="phone">شماره موبایل</FieldLabel>
            <Input
              id="phone"
              type="tel"
              dir="ltr"
              placeholder="09123456789"
              aria-invalid={Boolean(errors.phone)}
              {...register("phone")}
            />
            {errors.phone ? (
              <FieldError>{errors.phone.message}</FieldError>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="password">رمز عبور</FieldLabel>
            <Input
              id="password"
              type="password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password ? (
              <FieldError>{errors.password.message}</FieldError>
            ) : null}
          </Field>
        </FieldGroup>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          ورود به پنل
        </Button>
      </form>
    </div>
  );
}
