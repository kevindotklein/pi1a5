"use client";

import NoticeList from "@/components/common/noticeList";
import NoticeUpload from "@/components/common/noticeUpload";
import { useAuth } from "@/contexts/user";
import { auth, firestore } from "@/firebase/config";
import { Link2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import "../../../../locales/i18n";
import { t } from "i18next";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { useLoading } from "@/contexts/loading";
import moment from "moment";
import TaskGeneration from "@/components/common/taskGeneration";
import Task from "@/components/common/task";
import Layer from "@/components/common/layer";

export default function Tasks({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { setLoading } = useLoading();

  const { userData, logout } = useAuth() as any;

  const [user] = useAuthState(auth) as any;

  const [notice, setNotice] = useState(null) as any;
  const [hasTasks, setHasTasks] = useState(true) as any;
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

  const showError = () => {
    toast({
      variant: "destructive",
      title: "Erro!",
      description: "Edital não encontrado.",
    });
  };

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

      const taskRef = collection(firestore, "tasks");
      const taskQuery = query(taskRef, where("notice_id", "==", id));
      const taskSnap = await getDocs(taskQuery);

      const tasks = taskSnap.docs.map((doc: any) => doc.data());

      if (!tasks.length) setHasTasks(false);

      setNotice({ id, ...notice, subjects });
      setTasks(tasks);

      setLoading(false);
    } else {
      setLoading(false);
      showError();

      router.push("/common/dashboard");
    }
  };

  return (
    <div className="flex flex-col gap-5 text-neutral-50 w-full p-10 h-[calc(100vh-56px)]">
      {notice ? (
        <>
          <div className="flex flex-col gap-2 w-full">
            <h1 className="text-2xl font-bold text-blue-800">{notice.name}</h1>

            <span className="text-sm text-neutral-400">
              {t("notice-list.uploaded-at")}{" "}
              {moment(notice.created_at).format("DD/MM/YYYY HH:mm")}
            </span>
          </div>

          <h2 className="text-xl font-bold text-black">Suas Tarefas</h2>

          {!hasTasks ? (
            <TaskGeneration
              notice={notice}
              setHasTasks={setHasTasks}
              refresh={getNotice}
            />
          ) : (
            <div className="flex flex-row">
              {days.map((day: string) => {
                return (
                  <Layer day={day}>
                    {tasks.map((task: any) => (
                      <Task
                        id={tasks.id}
                        hours={task.hours}
                        title={task.title as string}
                        subject={task.subject as string}
                        description={task.description as string}
                      />
                    ))}
                  </Layer>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <span>Carregando...</span>
      )}
    </div>
  );
}
