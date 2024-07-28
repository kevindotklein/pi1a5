"use client";

import NoticeList from "@/components/common/noticeList";
import NoticeUpload from "@/components/common/noticeUpload";
import { useAuth } from "@/contexts/user";
import { auth, firestore } from "@/firebase/config";
import { Link2, Plus } from "lucide-react";
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

export default function Tasks({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { setLoading } = useLoading();

  const triggerRef = useRef(null) as any;

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

  console.log(error);

  const [user] = useAuthState(auth) as any;

  const [notice, setNotice] = useState(null) as any;
  const [tasks, setTasks] = useState([]) as any;
  const [days, setDays] = useState([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]) as any;

  const [activeCard, setActiveCard] = useState(null) as any;
  const [hightlighted, setHightlighted] = useState(null) as any;

  const showError = () => {
    toast({
      variant: "destructive",
      title: "Erro!",
      description: "Edital não encontrado.",
    });
  };

  useEffect(() => {
    const taskData = taskSnap?.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (taskData) setTasks(taskData);
  }, [taskSnap]);

  console.log("tasks ", tasks);
  //console.log("taskSnap ", taskSnap);

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

    setLoading("Buscando seu edital...");

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

      setLoading(false);
    } else {
      setLoading(false);
      showError();

      router.push("/common/dashboard");
    }
  };

  const onDrop = async (day: number, prio: number) => {
    if (!activeCard) return;
    console.log(`card: ${activeCard} | day: ${day} | prio: ${prio}`);

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

  return (
    <div className="flex flex-col gap-5 text-neutral-50 w-full px-10 h-[calc(100vh-112px)] pb-4 tablet:px-3">
      {notice ? (
        <>
          <div className="flex flex-col gap-2 w-full">
            <h1 className="text-2xl font-bold text-blue-800">{notice.name}</h1>

            <span className="text-sm text-neutral-400">
              {t("notice-list.uploaded-at")}{" "}
              {moment(notice.created_at).format("DD/MM/YYYY HH:mm")}
            </span>
          </div>

          <div className="flex gap-3 text-neutral-50 w-full items-center">
            <h2 className="text-xl font-bold text-black">Suas Tarefas</h2>

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
        <span>Carregando...</span>
      )}
    </div>
  );
}
