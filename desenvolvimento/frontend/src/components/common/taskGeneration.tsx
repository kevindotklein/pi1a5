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
  getDocs,
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
import DayCheckbox from "./dayCheckbox";

export default function TaskGeneration({
  notice,
  refresh,
  triggerRef,
  shouldShow,
}: {
  notice: any;
  refresh: () => void;
  triggerRef: any;
  shouldShow: boolean;
}) {
  const closeRef = useRef(null) as any;
  const action = useAction();
  const { toast } = useToast();

  const { generateTasks } = useFunctions();
  const { loading, setLoading } = useLoading();

  const [user] = useAuthState(auth);

  const { t, i18n } = useTranslation();
  const daysLabel: string[] = [
    t("task-generation.monday"),
    t("task-generation.tuesday"),
    t("task-generation.wednesday"),
    t("task-generation.thursday"),
    t("task-generation.friday"),
    t("task-generation.saturday"),
    t("task-generation.sunday"),
  ];

  const [days, setDays] = useState<number[]>([]);

  const formSchema = z.object({
    hours: z
      .number({
        message: t("task-generation.invalid-hours"),
      })
      .min(1, {
        message: t("task-generation.one-hour"),
      })
      .or(
        z.string().refine((value) => value !== "" && Number(value) > 1, {
          message: t("task-generation.one-hour"),
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
        title: t("task-generation.invalid-hours"),
        description: t("task-generation.add-hours"),
      });
    }

    await action(
      async () => {
        setLoading(t("task-generation.generate-tasks"));

        await startTaskGeneration({
          hours: hours as number,
          notice,
        });
      },
      async () => {
        setLoading(false);

        toast({
          title: t("task-generation.error"),
          description:
            t("task-generation.upload-error"),
        });
      }
    );
  };

  const chunkDays = (index: number): void => {
    days.includes(index)
      ? setDays(days.filter((d) => d !== index))
      : setDays([...days, index]);
  };

  const startTaskGeneration = async ({
    hours,
    notice,
  }: {
    hours: number;
    notice: any;
  }) => {
    console.log(notice);
    const { subjects } = notice;

    const taskRef = collection(firestore, "tasks");
    const taskQuery = query(
      taskRef,
      where("notice_id", "==", notice?.id as string)
    );
    const taskDocs = await getDocs(taskQuery);

    const doneSubjects = taskDocs.docs.map((doc) => doc.data().content);
    console.log(doneSubjects);

    for (let subject of subjects) {
      const filteredContents = subject?.contents.filter(
        (content: any) => !doneSubjects.includes(content)
      );

      console.log(subject?.name, filteredContents);
      subject.contents = filteredContents;
    }

    const total_previous_hours = taskDocs.docs
      .filter((item) => !item.data().is_finished)
      .reduce((acc, doc) => acc + parseFloat(doc.data().hours), 0);

    const total_hours = hours - total_previous_hours;

    if (total_hours <= 0) {
      setLoading(false);
      return toast({
        title: t("task-generation.attention"),
        description:
          t("task-generation.study-hours"),
      });
    }

    for (const task of taskDocs.docs.filter(
      (item) => item.data().is_finished
    )) {
      const taskDocRef = doc(firestore, "tasks", task.id as string);

      setDoc(
        taskDocRef,
        {
          hidden: true,
        },
        { merge: true }
      );
    }

    const { tasks, error } = await generateTasks({
      hours: total_hours,
      notice_content: notice,
    });

    if (error) {
      setLoading(false);
      return;
    }

    setLoading(t("task-generation.saving-tasks"));
    let day: number = -1;
    const offset: number = Math.ceil(tasks.length / days.length);
    let prio: number = 0;
    let taskId: number = 0;

    console.log("days ", days);
    for (let i = 0; i < tasks.length; i++) {
      const notice_id = notice.id;
      if (i % offset === 0) {
        day++;
        prio = 0;
      } else {
        prio++;
      }

      await addDoc(collection(firestore, "tasks"), {
        taskId,
        notice_id,
        ...tasks[i],
        created_at: new Date().toISOString(),
        day: days[day],
        prio,
        is_finished: false,
        hidden: false,
      });

      taskId++;
    }

    //setDays([]);
    refresh();

    toast({
      title: t("task-generation.success"),
      description: t("task-generation.generated-tasks"),
    });

    closeRef.current.click();

    setLoading(false);
  };

  return (
    <main
      className={`flex flex-col items-center gap-5 justify-between p-24 text-black tablet:p-6 ${
        shouldShow ? "" : "hidden"
      }`}
    >
      <h1 className="text-xl font-bold text-black tablet:text-center">
        {t("task-generation.no-tasks")}{" "}
        <strong className="text-blue-800 cursor-pointer">{t("task-generation.tasks")}</strong> ?
      </h1>

      <Dialog onOpenChange={() => setDays([])}>
        <DialogTrigger asChild onClick={() => setDays([])}>
          <Button
            ref={triggerRef}
            variant="secondary"
            style={{
              backgroundColor: "#0D4290",
              color: "white",
              borderRadius: "10px",
            }}
          >
            {t("task-generation.create-tasks-button")}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("task-generation.tasks-generation-1")}</DialogTitle>
            <DialogDescription>
              {t("task-generation.fill-form")}
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
                          <FormLabel>{t("task-generation.hours-to-study")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                t("task-generation.how-many-hours")
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <span className="text-md font-bold text-black">
                    {t("task-generation.select-days")}
                  </span>
                  <div className="w-full h-full grid grid-cols-2 gap-2 justify-center">
                    {daysLabel.map((day: string, i: number) => {
                      return (
                        <DayCheckbox
                          key={i}
                          onClick={() => {
                            chunkDays(i);
                          }}
                          label={day}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <DialogClose asChild>
                      <Button
                        ref={closeRef}
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
                      {t("task-generation.generate-button")}
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
