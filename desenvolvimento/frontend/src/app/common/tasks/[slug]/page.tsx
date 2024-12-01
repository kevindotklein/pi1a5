"use client";

import NoticeList from "@/components/common/noticeList";
import NoticeUpload from "@/components/common/noticeUpload";
import { useAuth } from "@/contexts/user";
import { auth, firestore } from "@/firebase/config";
import {
  Check,
  CheckSquare,
  Link2,
  Pencil,
  Plus,
  SquarePen,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import "../../../../locales/i18n";
import { t } from "i18next";

import {
  collection,
  doc,
  DocumentData,
  FirestoreError,
  getDoc,
  getDocs,
  orderBy,
  query,
  QuerySnapshot,
  setDoc,
  where,
} from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { useLoading } from "@/contexts/loading";
import moment from "moment";
import TaskGeneration from "@/components/common/taskGeneration";
import Task from "@/components/common/task";
import Layer from "@/components/common/layer";
import {
  useCollection,
  useCollectionData,
} from "react-firebase-hooks/firestore";
import DropArea from "@/components/common/dropArea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import Subject from "@/components/common/subject";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import * as z from "zod";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/useAction";
import { Textarea } from "@/components/ui/textarea";
import { useFunctions } from "@/hooks/useFunctions";
import { info } from "console";

export default function Tasks({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { setLoading } = useLoading();

  const triggerRef = useRef(null) as any;
  const contentModalTriggerRef = useRef(null) as any;
  const infosModalTriggerRef = useRef(null) as any;

  const action = useAction();

  const { extractInfos } = useFunctions();

  const { userData, logout } = useAuth() as any;
  const taskRef = collection(firestore, "tasks");
  const taskQuery = query(
    taskRef,
    where("notice_id", "==", params?.slug as string),
    where("hidden", "==", false),
    orderBy("is_finished", "asc"),
    orderBy("prio")
  );
  const [taskSnap, loading, error] = useCollection(taskQuery, {});

  const [user] = useAuthState(auth) as any;

  const [notice, setNotice] = useState(null) as any;
  const [tasks, setTasks] = useState([]) as any;
  const [days, setDays] = useState([
    t("tasks.monday"),
    t("tasks.tuesday"),
    t("tasks.wednesday"),
    t("tasks.thursday"),
    t("tasks.friday"),
    t("tasks.saturday"),
    t("tasks.sunday"),
  ]) as any;

  const [activeCard, setActiveCard] = useState(null) as any;
  const [hightlighted, setHightlighted] = useState(null) as any;

  const [noticeOpen, setNoticeOpen] = useState(false) as any;

  const [modalView, setModalView] = useState("form") as any;

  const [manualNoticeContent, setManualNoticeContent] = useState("");

  const [noticeInfos, setNoticeInfos] = useState(null) as any;
  const [editingField, setEditingField] = useState(null) as any;

  const showError = () => {
    toast({
      variant: "destructive",
      title: "Erro!",
      description: t("tasks.not-found"),
    });
  };

  useEffect(() => {
    const taskData = taskSnap?.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (taskData) setTasks(taskData);
  }, [taskSnap]);

  useEffect(() => {
    if (!params || !params.slug) {
      showError();
      return;
    }
    getNotice();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNotice = async () => {
    if (!user) return;

    setLoading(t("tasks.set-loading"));

    const docRef = doc(firestore, "notices", params?.slug as string);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let notice = docSnap.data();

      const id = params?.slug as string;

      const subjectRef = collection(firestore, "subjects");
      const subjectQuery = query(subjectRef, where("notice_id", "==", id));
      const subjectSnap = await getDocs(subjectQuery);

      const subjects = subjectSnap.docs.map((doc: any) => doc.data());

      await setNotice({ id, ...notice, subjects });

      if (notice?.infos) {
        setNoticeInfos(notice.infos);
      }

      setLoading(false);
    } else {
      setLoading(false);
      showError();

      router.push("/common/dashboard");
    }
  };

  const onDrop = async (day: number, prio: number) => {
    if (!activeCard) return;

    const taskRef = collection(firestore, "tasks");
    const taskQuery = query(
      taskRef,
      where("notice_id", "==", params?.slug as string),
      where("day", "==", day),
      where("prio", ">=", prio),
      orderBy("prio", "asc"),
      orderBy("is_finished", "asc")
    );
    const taskDocs = await getDocs(taskQuery);

    let prioCounter: number = prio;
    for (const task of taskDocs.docs) {
      const taskDocRef = doc(firestore, "tasks", task.id as string);

      prioCounter = prioCounter + 1;

      setDoc(
        taskDocRef,
        {
          prio: prioCounter,
        },
        { merge: true }
      );
    }

    const taskDocRef = doc(firestore, "tasks", activeCard as string);

    setDoc(
      taskDocRef,
      {
        day,
        prio,
      },
      { merge: true }
    );
  };

  const date_validator = z
    .string({
      message: "Campo obrigatório",
    })
    .min(3, {
      message: t("tasks.invalid-local"),
    })
    .optional()
    .nullable();

  const formSchema = z.object({
    subscription_start: date_validator,
    subscription_deadline: date_validator,
    date: date_validator,
    local: z
      .string({
        message: "Campo obrigatório",
      })
      .min(3, {
        message: t("tasks.invalid-local"),
      })
      .optional()
      .nullable(),
    text: z
      .string({
        message: "Campo obrigatório",
      })
      .min(3, {
        message: t("tasks.invalid-local"),
      })
      .optional()
      .nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { setValue } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { date, subscription_start, subscription_deadline, local } = values;

    if (!date) {
      return toast({
        variant: "destructive",
        title: t("tasks.invalid-local"),
        description: t("tasks.add-date"),
      });
    }

    await action(
      async () => {
        setLoading(t("tasks.set-loading"));

        const docRef = doc(firestore, "notices", noticeOpen?.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const notice = docSnap.data();

          await setDoc(docRef, {
            ...notice,
            date,
            subscription_start,
            subscription_deadline,
            local,
          });
        }

        setLoading(false);
      },
      async () => {
        setLoading(false);
      }
    );
  };

  const onContentSubmit = async () => {
    if (!manualNoticeContent) {
      return toast({
        variant: "destructive",
        title: "Erro!",
        description: "Insira as informações",
      });
    }

    await action(
      async () => {
        setLoading("Extraindo informações...");

        const { infos, error } = await extractInfos({
          text: manualNoticeContent,
        });

        if (error) {
          setLoading(false);

          toast({
            variant: "destructive",
            title: "Erro!",
            description: error,
          });

          return;
        }

        const hasNoInfo = Object.keys(infos).length === 0;

        if (hasNoInfo) {
          setLoading(false);

          toast({
            variant: "destructive",
            title: "Erro!",
            description:
              "Não identificamos nenhuma informação relevante para sua prova. Por favor, verifique seu texto e tente novamente.",
          });

          return;
        }

        toast({
          title: "Sucesso!",
          description:
            "Extração de informações realizada com sucesso. As informações foram adicionadas à prova.",
        });

        const docRef = doc(firestore, "notices", noticeOpen?.id as string);

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const notice = docSnap.data();
          await setDoc(docRef, {
            ...notice,
            infos,
          });
        }

        setNoticeInfos(infos);

        setLoading(false);
      },
      async () => {
        setLoading(false);
      }
    );
  };

  const confirmEdit = async () => {
    if (!notice) return;

    await action(async () => {
      const docRef = doc(firestore, "notices", notice.id);

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const notice = docSnap.data();
        await setDoc(docRef, {
          ...notice,
          infos: noticeInfos,
        });
      }

      setEditingField(null);
    });
  };

  return (
    <div className="flex flex-col gap-5 text-neutral-50 w-full px-10 h-[calc(100vh-112px)] pb-4 tablet:px-3 select-none">
      {notice ? (
        <>
          <div className="flex flex-col gap-2 w-full">
            <h1 className="text-2xl font-bold text-blue-800">{notice.name}</h1>

            <span className="text-sm text-neutral-400">
              {t("notice-list.uploaded-at")}{" "}
              {moment(notice.created_at).format("DD/MM/YYYY HH:mm")}
            </span>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              style={{
                backgroundColor: "#0D4290",
                color: "white",
                borderRadius: "10px",
                width: "fit-content",
              }}
              onClick={() => {
                setNoticeOpen(notice);
                infosModalTriggerRef.current?.click();

                setValue(
                  "date",
                  moment(notice.date).format("YYYY-MM-DD HH:mm")
                );

                setValue(
                  "subscription_start",
                  moment(notice.subscription_start).format("YYYY-MM-DD HH:mm")
                );

                setValue(
                  "subscription_deadline",
                  moment(notice.deadline).format("YYYY-MM-DD HH:mm")
                );

                setValue("local", notice.local);
              }}
            >
              Adicionar informações da Prova
            </Button>
            <Button
              variant="outline"
              style={{
                backgroundColor: "white",
                color: "#0D4290",
                borderRadius: "10px",
                width: "fit-content",
              }}
              onClick={() => {
                setNoticeOpen(notice);
                contentModalTriggerRef.current?.click();
              }}
            >
              Ver Matérias
            </Button>
          </div>

          <div className="flex gap-3 text-neutral-50 w-full items-center">
            <h2 className="text-xl font-bold text-black">
              {t("tasks.your-tasks")}
            </h2>

            <Plus
              size={20}
              color="black"
              className="cursor-pointer"
              onClick={() => triggerRef.current.click()}
            />
          </div>

          <TaskGeneration
            notice={notice}
            refresh={getNotice}
            triggerRef={triggerRef}
            shouldShow={!tasks.length}
          />

          {tasks.length ? (
            <div className="h-full grid gap-[30px] grid-cols-[repeat(7,minmax(240px,1fr))] overflow-auto">
              {days.map((day: string, i: number) => {
                return (
                  <Layer
                    key={day}
                    day={day}
                    count={tasks.filter((t: any) => t.day == i).length}
                  >
                    {!tasks.filter((t: any) => t.day == i).length ? (
                      <DropArea
                        onDrop={onDrop}
                        day={i}
                        prio={0}
                        isEmpty={true}
                      />
                    ) : null}
                    {tasks
                      .filter((t: any) => t.day == i)
                      .map((task: any, index: number) => {
                        return (
                          <React.Fragment key={task.title}>
                            <DropArea
                              onDrop={onDrop}
                              day={i}
                              prio={task.prio}
                              isEmpty={false}
                            />
                            <Task
                              key={task.title}
                              id={task.id}
                              index={task.id}
                              hightlighted={hightlighted}
                              setHightlighted={setHightlighted}
                              setActiveCard={setActiveCard}
                              hours={task.hours}
                              title={task.title as string}
                              subject={task.subject as string}
                              description={task.description as string}
                              is_finished={task.is_finished as boolean}
                              commentary={task.commentary}
                              prio={task.prio}
                            />
                            {index ==
                            tasks.filter((t: any) => t.day == i).length - 1 ? (
                              <DropArea
                                onDrop={onDrop}
                                day={i}
                                prio={task.prio + 1}
                                isEmpty={false}
                              />
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                  </Layer>
                );
              })}
            </div>
          ) : null}
        </>
      ) : (
        <span>{t("tasks.loading")}</span>
      )}

      <Dialog>
        <DialogTrigger ref={contentModalTriggerRef} />

        <DialogContent className="max-w-[40vw] overflow-auto tablet:max-w-[100vw] tablet:overflow-auto">
          <DialogHeader>
            <DialogTitle>{noticeOpen?.name}</DialogTitle>
            <DialogDescription>
              {noticeOpen?.file_name} - {t("notice-list.uploaded-at")}{" "}
              <strong>
                {moment(noticeOpen?.created_at).format("DD/MM/YYYY HH:mm")}
              </strong>
            </DialogDescription>
          </DialogHeader>

          <p>{t("notice-list.subj-and-contents")}</p>

          <div className="flex gap-4 flex-col w-full h-full max-h-[600px] overflow-auto">
            <div className="flex flex-col gap-4 w-full">
              {noticeOpen?.subjects?.map((subject: any) => (
                <Subject key={subject.id} subject={subject} />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger ref={infosModalTriggerRef} />

        <DialogContent className="max-w-[40vw] overflow-auto tablet:max-w-[100vw] tablet:overflow-auto">
          <DialogHeader>
            <DialogTitle>{noticeOpen?.name}</DialogTitle>
            <DialogDescription>Informações sobre a prova</DialogDescription>
          </DialogHeader>

          {modalView == "form" && !noticeInfos ? (
            <Form {...form}>
              <div className="h-full">
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full h-full flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="subscription_start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Início das inscrições</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Início das inscrições"
                                type="datetime-local"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subscription_deadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Final das inscrições</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Final das inscrições"
                                type="datetime-local"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data da Prova</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Data da Prova"
                              type="datetime-local"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="local"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Local da Prova</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Local da Prova"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <span>
                    Você pode inserir manualmente as informações e datas da
                    prova, ou então, clicar no botão abaixo para importar as
                    informações da prova.
                  </span>

                  <div className="flex items-center justify-between w-full">
                    <Button
                      // disabled={loading}
                      type="button"
                      style={{
                        borderColor: "#0D4290",
                        borderWidth: "1px",
                        color: "#0D4290",
                        borderRadius: "10px",
                        backgroundColor: "white",
                      }}
                      onClick={() => {
                        setModalView("import");
                      }}
                    >
                      Importar
                    </Button>
                    <Button
                      // disabled={loading}
                      type="submit"
                      style={{
                        backgroundColor: "#0D4290",
                        color: "white",
                        borderRadius: "10px",
                      }}
                    >
                      Atualizar
                    </Button>
                  </div>
                </form>
              </div>
            </Form>
          ) : (
            <>
              {!noticeInfos ? (
                <Form {...form}>
                  <div className="h-full">
                    <form
                      onSubmit={form.handleSubmit(onContentSubmit)}
                      className="w-full h-full flex flex-col justify-between gap-4"
                    >
                      <span>
                        Copie do edital ou do site do concurso informações sobre
                        a prova, como prazos, locais e taxas, e deixe que a
                        gente faça o resto.
                      </span>
                      <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texto:</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={"Insira aqui"}
                                className="resize-none min-h-[200px]"
                                value={manualNoticeContent}
                                onChange={(e: any) =>
                                  setManualNoticeContent(e.target.value)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between w-full">
                        <Button
                          // disabled={loading}
                          type="button"
                          style={{
                            borderColor: "#0D4290",
                            borderWidth: "1px",
                            color: "#0D4290",
                            borderRadius: "10px",
                            backgroundColor: "white",
                          }}
                          onClick={() => {
                            setModalView("form");
                          }}
                        >
                          Voltar
                        </Button>
                        <Button
                          // disabled={loading}
                          type="submit"
                          style={{
                            backgroundColor: "#0D4290",
                            color: "white",
                            borderRadius: "10px",
                          }}
                        >
                          Confirmar
                        </Button>
                      </div>
                    </form>
                  </div>
                </Form>
              ) : (
                <div className="flex flex-col gap-4 w-full">
                  <span>Confira as informações que coletamos abaixo:</span>
                  <div className="flex flex-col gap-3">
                    {Object.keys(noticeInfos).map((key: string) => (
                      <div key={key} className="flex flex-col gap-1">
                        <span className="font-bold">
                          {noticeInfos[key]?.label}
                        </span>
                        {editingField !== key ? (
                          <div className="flex items-center gap-2">
                            <span>{noticeInfos[key]?.value}</span>
                            <SquarePen
                              size={14}
                              color="black"
                              className="cursor-pointer"
                              onClick={() => setEditingField(key)}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-5">
                            <Input
                              name={key}
                              value={noticeInfos[key]?.value}
                              onChange={(e: any) =>
                                setNoticeInfos({
                                  ...noticeInfos,
                                  [key]: {
                                    ...noticeInfos[key],
                                    value: e.target.value,
                                  },
                                })
                              }
                            />
                            <CheckSquare
                              size={20}
                              color="black"
                              className="cursor-pointer"
                              onClick={() => {
                                confirmEdit();
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
