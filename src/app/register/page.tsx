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
import { registerSchema } from "@/lib/validations";
import { Mail, Lock, User, LogIn } from "lucide-react";
import { useTranslation } from "@/components/i18n/useTranslation";
import { createClientComponentClient } from "@/lib/supabase/client";
import { z } from "zod";
import { generateAccountId } from "@/lib/utils";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "", phone: "" },
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setError("");
    setLoading(true);
    try {
      const { data: authData, error: supabaseError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name, phone: data.phone },
        },
      });
      if (supabaseError) throw supabaseError;
      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.full_name,
            phone: data.phone || null,
            account_id: generateAccountId(),
            role: "user",
            subscription_status: "trial",
            trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
          });
        if (profileError) throw profileError;
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || t("accountExists"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("createAccount")}</CardTitle>
          <CardDescription>{t("appName")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t("fullName")}</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input id="full_name" placeholder="أحمد محمد علي" className="pl-9" {...form.register("full_name")} />
              </div>
              {form.formState.errors.full_name && (
                <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>
              )}
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input id="password" type="password" className="pl-9" {...form.register("password")} />
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" placeholder="+20 1xx xxx xxxx" {...form.register("phone")} />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-100">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("loading") : <>{t("signUp")}</>}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <p className="text-sm text-gray-600">
            {t("alreadyHaveAccount")} <Link href="/login" className="font-medium">{t("signIn")}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
