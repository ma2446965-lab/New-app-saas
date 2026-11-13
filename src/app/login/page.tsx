"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/components/i18n/useTranslation";
import { createClientComponentClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export default function LoginPage() {
  const { t, lang } = useTranslation();
  const isAr = lang === "ar";
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message || t("loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-bg-deep px-4 py-12">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-electric-purple-600/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-neon-blue-600/15 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      <Card className="w-full max-w-md glass-card animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 flex items-center justify-center text-white mx-auto mb-4 shadow-glow-purple">
            <Lock className="w-5 h-5" />
          </div>
          <CardTitle className="text-2xl font-bold">{t("welcomeBack")}</CardTitle>
          <CardDescription>{t("signInToAccount")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-text-muted hover:bg-transparent"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-400">{form.formState.errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} {t("signIn")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 text-center">
          <p className="text-sm text-text-muted">
            لا تملك حساب بعد؟{" "}
            <Link href="/register" className="text-neon-blue-400 hover:text-neon-blue-300 font-medium">
                          {t("createAccount")}
                        </Link>
          </p>
          <Link href="/reset-password" className="text-sm text-text-muted hover:text-neon-blue-400">
            {t("forgotPassword")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}