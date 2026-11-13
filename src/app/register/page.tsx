"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/components/i18n/useTranslation";
import { createClientComponentClient } from "@/lib/supabase/client";
import { generateAccountId } from "@/lib/utils";

const registerSchema = z.object({
  full_name: z.string().min(2, "الاسم الكامل مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  phone: z.string().optional(),
});

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
            trial_ends_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
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
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-bg-deep px-4 py-12">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-electric-purple-600/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-neon-blue-600/15 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      <Card className="w-full max-w-md glass-card animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 flex items-center justify-center text-white mx-auto mb-4 shadow-glow-purple">
            <User className="w-5 h-5" />
          </div>
          <CardTitle className="text-2xl font-bold">{t("createAccount")}</CardTitle>
          <CardDescription>{t("startFreeTrialShort")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="full_name">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <Input id="full_name" placeholder="أحمد محمد علي" className="pl-10" {...form.register("full_name")} />
              </div>
              {form.formState.errors.full_name && (
                <p className="text-sm text-red-400">{form.formState.errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <Input id="email" type="email" placeholder="name@example.com" className="pl-10" {...form.register("email")} />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <Input id="password" type="password" className="pl-10" {...form.register("password")} />
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-400">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
              <Input id="phone" placeholder="+20 1xx xxx xxxx" {...form.register("phone")} />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3 shadow-glow-purple hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} <ArrowRight className="w-4 h-4 ml-2" /> {t("signUp")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 text-center">
          <p className="text-sm text-text-muted">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-neon-blue-400 hover:text-neon-blue-300 font-medium">
                          {t("signIn")}
                        </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}