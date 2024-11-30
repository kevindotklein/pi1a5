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
      message: "Insira uma resposta válida",
    }),
    where_you_heard: z.string({
      message: "Insira uma resposta válida",
    }),
    education_level: z.string({
      message: "Insira uma resposta válida",
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
                    Para qual tipo de prova você está se preparando?
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="enem">ENEM</SelectItem>
                        <SelectItem value="vestibular">Vestibular</SelectItem>
                        <SelectItem value="concurso">Concurso</SelectItem>
                        <SelectItem value="prova-do-ensino-medio">
                          Prova do Ensino Médio
                        </SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
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
                    Qual o seu nível de escolaridade?
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ensino-fundamental">
                          Ensino Fundamental
                        </SelectItem>
                        <SelectItem value="ensino-medio">
                          Ensino Médio
                        </SelectItem>
                        <SelectItem value="ensino-superior">
                          Ensino Superior
                        </SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
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
                    Por onde você conheceu a plataforma?
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="amigos">Amigos</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
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