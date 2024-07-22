/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { auth, firestore, storage } from "@/firebase/config";
import {
  addDoc,
  collection,
  query,
  setDoc,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionOnce } from "react-firebase-hooks/firestore";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Loading from "@/components/common/loading";

import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { useAction } from "@/hooks/useAction";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/user";
import { useFunctions } from "@/hooks/useFunctions";
import { Textarea } from "../ui/textarea";
import { useLoading } from "@/contexts/loading";
import { useTranslation } from "react-i18next";

export default function TaskGeneration({
  notice,
  setHasTasks,
  refresh,
}: {
  notice: any;
  setHasTasks: (hasNotice: boolean) => void;
  refresh: () => void;
}) {
  const action = useAction();
  const { toast } = useToast();

  const { generateTasks } = useFunctions();
  const { loading, setLoading } = useLoading();

  const [user] = useAuthState(auth);

  const { t, i18n } = useTranslation();

  const formSchema = z.object({
    hours: z
      .number({
        message: "Horas inválidas",
      })
      .min(1, {
        message: "Insira pelo menos 1 hora de estudo.",
      })
      .or(
        z.string().refine((value) => value !== "" && Number(value) > 1, {
          message: "Insira pelo menos 1 hora de estudo.",
        })
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { hours } = values;

    if (!hours) {
      return toast({
        variant: "destructive",
        title: "Horas inválidas",
        description: "Adicione quantas horas você deseja estudar.",
      });
    }

    await action(
      async () => {
        setLoading("Começando a gerar suas tarefas...");

        await startTaskGeneration({
          hours: hours as number,
          notice,
        });
      },
      async () => {
        setLoading(false);

        toast({
          title: "error!",
          description:
            "an error occurred while uploading the file! please try again later.",
        });
      }
    );
  };

  const startTaskGeneration = async ({
    hours,
    notice,
  }: {
    hours: number;
    notice: any;
  }) => {
    const { tasks, error } = await generateTasks({
      hours,
      notice_content: notice,
    });

    if (error) {
      setLoading(false);
      return;
    }

    console.log(tasks);

    setLoading("Guardando suas tarefas...");

    for (const task of tasks) {
      const notice_id = notice.id;

      console.log({
        notice_id,
        ...task,
        created_at: new Date().toISOString(),
      });

      await addDoc(collection(firestore, "tasks"), {
        notice_id,
        ...task,
        created_at: new Date().toISOString(),
      });
    }

    refresh();

    toast({
      title: "Sucesso!",
      description: "Suas tarefas foram geradas com sucesso!",
    });

    setLoading(false);

    setHasTasks(true);
  };

  return (
    <main className="flex flex-col items-center gap-5 justify-between p-24 text-black">
      <h1 className="text-xl font-bold text-black">
        Parece que você ainda não tem tarefas para este edital. Vamos gerar suas{" "}
        <strong className="text-blue-800 cursor-pointer">tarefas</strong> ?
      </h1>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            style={{
              backgroundColor: "#0D4290",
              color: "white",
              borderRadius: "10px",
            }}
          >
            Criar Tarefas
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Geração de Tarefas</DialogTitle>
            <DialogDescription>
              Preencha o formulário abaixo para gerar suas tarefas dessa semana.
            </DialogDescription>

            <Form {...form}>
              <div className="h-full">
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full h-full flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-5">
                    <FormField
                      control={form.control}
                      name="hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horas de Estudo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                "Quantas horas você deseja estudar essa semana?"
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <DialogClose asChild>
                      <Button
                        variant="secondary"
                        style={{
                          borderRadius: "10px",
                        }}
                      >
                        {t("notice-upload.modal.cancel-button")}
                      </Button>
                    </DialogClose>

                    <Button
                      // disabled={loading}
                      type="submit"
                      style={{
                        backgroundColor: "#0D4290",
                        color: "white",
                        borderRadius: "10px",
                      }}
                    >
                      Gerar
                    </Button>
                  </div>
                </form>
              </div>
            </Form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
}
