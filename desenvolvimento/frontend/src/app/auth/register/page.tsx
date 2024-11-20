"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/firebase/config";
import { useToast } from "@/components/ui/use-toast";
import { useAction } from "@/hooks/useAction";
import { collection, doc, setDoc } from "firebase/firestore";
import { useLoading } from "@/contexts/loading";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { toast } = useToast();
  const action = useAction();
  const { setLoading } = useLoading();

  const { t, i18n } = useTranslation();

  const formSchema = z.object({
    full_name: z.string().min(3),
    email: z.string().email(),
    password: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { full_name, email, password } = values;

    setLoading(true);
    await action(
      async () => {
        await createUserWithEmailAndPassword(auth, email, password);

        const userId = auth.currentUser?.uid;

        await setDoc(doc(firestore, "users", userId as string), {
          full_name,
          email,
          has_notice: false,
          plan: "free",
        });

        setLoading(false);

        router.push("/common/dashboard");
      },
      async () => {
        setLoading(false);
      }
    );
  };

  return (
    <div className="h-full flex flex-col gap-4 tablet:w-full">
      <div className="h-full flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-3xl font-bold flex gap-2 items-center text-neutral-100">
            studyflow
          </h3>
          <h2 className="text-sm text-neutral-300">{t("register.subtitle")}</h2>
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
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="!text-white">
                        {t("register.name")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("register.name-input")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="!text-white">
                        {t("register.email")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("register.email-input")}
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
                      <FormLabel className="!text-white">
                        {t("register.password")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("register.password-input")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-baseline justify-between mt-8 gap-2 tablet:!flex-col tablet:w-full">
                <Button variant="link" asChild>
                  <Link
                    href="/auth/login"
                    className="text-sm hover:underline tablet:!text-xs text-white tablet:w-full"
                  >
                    {t("register.login-question")}
                  </Link>
                </Button>

                <Button variant="default" size="lg" className="tablet:w-full">
                  {t("register.submit-button")}
                </Button>
              </div>
            </form>
          </div>
        </Form>
      </div>
    </div>
  );
}
