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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SurveyStep({ setUserData, userData, setStep }: any) {
  const { toast } = useToast();
  const action = useAction();
  const { setLoading } = useLoading();

  const { t, i18n } = useTranslation();

  const formSchema = z.object({
    type_of_exam: z.string({
      message: t("register.valid-answer"),
    }),
    where_you_heard: z.string({
      message: t("register.valid-answer"),
    }),
    education_level: z.string({
      message: t("register.valid-answer"),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: userData,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { type_of_exam, where_you_heard, education_level } = values;

    await action(
      async () => {
        setUserData((prev: any) => ({
          ...prev,
          type_of_exam,
          where_you_heard,
          education_level,
        }));

        setStep(2);
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
              name="type_of_exam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!text-white">
                    {t("register.test-type")}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("register.select-option")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="enem">ENEM</SelectItem>
                        <SelectItem value="vestibular">{t("register.entrance-exam")}</SelectItem>
                        <SelectItem value="concurso">{t("register.civil-service")}</SelectItem>
                        <SelectItem value="prova-do-ensino-medio">
                          {t("register.high-school")}
                        </SelectItem>
                        <SelectItem value="outro">{t("register.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="education_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!text-white">
                    {t("register.education-level")}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("register.select-option")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ensino-fundamental">
                          {t("register.elementary-education")}
                        </SelectItem>
                        <SelectItem value="ensino-medio">
                          {t("register.high-school-level")}
                        </SelectItem>
                        <SelectItem value="ensino-superior">
                          {t("register.college")}
                        </SelectItem>
                        <SelectItem value="outro">{t("register.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="where_you_heard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!text-white">
                    {t("register.discover-plataform")}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("register.select-option")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="amigos">{t("register.friends")}</SelectItem>
                        <SelectItem value="outro">{t("register.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-baseline justify-between mt-8 gap-2 tablet:!flex-col tablet:w-full">
            <Button
              variant="link"
              type="button"
              onClick={() => setStep(0)}
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
