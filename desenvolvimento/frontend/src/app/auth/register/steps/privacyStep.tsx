"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

import {
  Form,
  FormControl,
  FormDescription,
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
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useLoading } from "@/contexts/loading";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/ui/password";

export default function PrivacyStep({ userData, setStep, submit }: any) {
  const { toast } = useToast();
  const action = useAction();
  const { setLoading } = useLoading();

  const { t, i18n } = useTranslation();

  const formSchema = z.object({
    password: z.string({
      message: t("register.valid-password"),
    }),
    repeat_password: z.string({
      message: t("register.repeat-password"),
    }),
    terms: z.boolean().default(false).optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: userData,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { password, repeat_password, terms } = values;

    if (!terms) {
      return toast({
        variant: "destructive",
        title: t("register.accept-terms"),
      });
    }

    if (password !== repeat_password) {
      return form.setError("repeat_password", {
        message: t("register.password-not-match"),
      });
    }

    setLoading(true);

    await action(
      async () => {
        setLoading(false);

        const dataToSend = {
          ...userData,
          password,
        };

        submit(dataToSend);
      },
      async () => {
        setLoading(false);
      }
    );
  };

  return (
    <Form {...form}>
      <div className="h-full">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full h-full flex flex-col justify-between gap-4"
        >
          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!text-white">{t("register.password")}</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder={t("register.type-here")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repeat_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!text-white">
                    {t("register.confirm-password")}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      type="password"
                      placeholder={t("register.type-here")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <span className="text-sm text-white">
                      {t("register.plataform-terms")}
                    </span>
                    <p className="text-sm text-neutral-300 text-muted-foreground cursor-pointer">
                      {t("register.see-terms")}
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-baseline justify-between mt-8 gap-2 tablet:!flex-col tablet:w-full">
            <Button
              variant="link"
              type="button"
              onClick={() => setStep(1)}
              className="text-white"
            >
              {t("register.back-button")}
            </Button>

            <Button variant="default" size="lg" className="tablet:w-full">
              {t("register.continue-button")}
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
}
