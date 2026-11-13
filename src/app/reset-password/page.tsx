"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPasswordSchema } from "@/lib/validations";
import { Mail, LogIn } from "lucide-react";
import { useTranslation } from "@/components/i18n/useTranslation";
import { createClientComponentClient } from "@/lib/supabase/client";
import { z } from "zod";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    setError("");
    setLoading(true);
    try {
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (supabaseError) throw supabaseError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || t("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl">{t("resetPasswordTitle")}</CardTitle>
            <CardDescription>تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من بريدك واتباع التعليمات.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.href="/login"} className="w-full">
              {t("signIn")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("resetPassword")}</CardTitle>
          <CardDescription>{t("resetInstructions")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input id="email" type="email" placeholder="name@example.com" className="pl-9" {...form.register("email")} />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-100">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("loading") : <>{t("sendResetLink")}</>}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <p className="text-sm text-gray-600">
            {t("alreadyHaveAccount")} <a href="/login" className="font-medium">{t("signIn")}</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
