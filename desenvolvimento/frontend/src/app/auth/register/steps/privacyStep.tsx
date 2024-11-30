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
      message: "Insira uma senha válida",
    }),
    repeat_password: z.string({
      message: "Repita a senha para confirmar",
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
        title: "Você precisa aceitar os termos de uso da plataforma!",
      });
    }

    if (password !== repeat_password) {
      return form.setError("repeat_password", {
        message: "As senhas não coincidem",
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
                  <FormLabel className="!text-white">Senha</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Digite aqui" {...field} />
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
                    Confirme sua senha
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      type="password"
                      placeholder="Digite aqui"
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
                      Aceito os termos e condições da plataforma
                    </span>
                    <p className="text-sm text-neutral-300 text-muted-foreground cursor-pointer">
                      Ver termos
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
              Voltar
            </Button>

            <Button variant="default" size="lg" className="tablet:w-full">
              Continuar
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
}
