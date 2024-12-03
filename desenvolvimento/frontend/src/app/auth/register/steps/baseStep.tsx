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
import { useEffect, useState } from "react";
import { cpfCnpjMask } from "@/helpers/format";

export default function BaseStep({ setUserData, userData, setStep }: any) {
  const { toast } = useToast();
  const action = useAction();
  const { setLoading } = useLoading();

  const { t, i18n } = useTranslation();

  const formSchema = z.object({
    full_name: z
      .string({
        message: t("register.valid-name"),
      })
      .min(3),
    email: z
      .string({
        message: t("register.valid-email"),
      })
      .email({
        message: t("register.valid-email"),
      }),
    document: z
      .string({
        message: t("register.vaild-cpf"),
      })
      .min(11),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: userData,
  });

  useEffect(() => {
    form.setValue("document", cpfCnpjMask(form.watch("document")));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("document")]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { full_name, email, document } = values;

    setLoading(true);

    await action(
      async () => {
        // search if there is any user with the same document or email
        const usersRef = collection(firestore, "users");
        const sameDocumentUsersQuery = query(
          usersRef,
          where("document", "==", document)
        );
        const sameDocumentUsersSnap = await getDocs(sameDocumentUsersQuery);

        if (sameDocumentUsersSnap.docs.length > 0) {
          toast({
            title: t("register.attention"),
            description: t("register.user-exists"),
            variant: "destructive",
          });

          return setLoading(false);
        }

        const sameEmailUsersQuery = query(
          usersRef,
          where("email", "==", email)
        );
        const sameEmailUsersSnap = await getDocs(sameEmailUsersQuery);

        if (sameEmailUsersSnap.docs.length > 0) {
          toast({
            title: t("register.attention"),
            description: t("register.email-exists"),
            variant: "destructive",
          });

          return setLoading(false);
        }

        setLoading(false);

        setUserData((prev: any) => ({
          ...prev,
          full_name,
          email,
          document,
        }));

        setStep(1);
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
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!text-white">
                    {t("register.name")}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("register.name-input")} {...field} />
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
                    <Input placeholder={t("register.email-input")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!text-white">CPF</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="CPF" {...field} />
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
              {t("register.continue-button")}
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
}
