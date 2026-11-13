"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema } from "@/lib/validations";
import { Mail, Lock, LogIn } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "@/components/i18n/useTranslation";
import { createClientComponentClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setError("");
    setLoading(true);
    try {
      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (supabaseError) throw supabaseError;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("signIn")}</CardTitle>
          <CardDescription>{t("welcomeBack")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-100">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("loading") : <><LogIn className="w-4 h-4 mr-2" /> {t("signIn")}</>}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <Button asChild variant="outline" as={Link} href="/reset-password" className="w-full text-sm">
            {t("resetPassword")}
          </Button>
          <p className="text-sm text-gray-600">
            {t("dontHaveAccount")} <Link href="/register" className="font-medium">{t("signUp")}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
