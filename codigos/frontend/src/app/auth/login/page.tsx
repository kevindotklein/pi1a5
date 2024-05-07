"use client";

import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Social } from "@/components/auth/social";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useToast } from "@/components/ui/use-toast";
import { useAction } from "@/hooks/useAction";
import { useLoading } from "@/contexts/loading";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { toast } = useToast();
  const { setLoading } = useLoading();
  const action = useAction();

  const { t, i18n } = useTranslation();

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const { email, password } = values;

    await action(
      async () => {
        await signInWithEmailAndPassword(auth, email, password);

        setLoading(false);
        router.push("/common/dashboard");
      },
      async () => {
        setLoading(false);
      }
    );
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="h-full flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-3xl font-bold flex gap-2 items-center text-neutral-100">
            studyflow
          </h3>
          <h2 className="text-sm text-secondary-200 text-neutral-300">
            {t("login.subtitle")}
          </h2>
        </div>
        <Form {...form}>
          <div className="h-full">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full h-full flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("login.email")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("login.email-input")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("login.password")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("login.password-input")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Social />

              <div className="flex items-baseline justify-between mt-8 gap-2 tablet:!flex-col">
                <Button variant="link" asChild>
                  <Link
                    href="/auth/register"
                    className="text-sm hover:underline tablet:!text-xs text-white"
                  >
                    {t("login.register-question")}
                  </Link>
                </Button>

                <Button variant="default" size="lg">
                  {t("login.submit-button")}
                </Button>
              </div>
            </form>
          </div>
        </Form>
      </div>
    </div>
  );
}
