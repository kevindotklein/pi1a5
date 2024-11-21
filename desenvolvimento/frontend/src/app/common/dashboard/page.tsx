"use client";

import NoticeList from "@/components/common/noticeList";
import NoticeUpload from "@/components/common/noticeUpload";
import { useAuth } from "@/contexts/user";
import { auth } from "@/firebase/config";
import { Link2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import "../../../locales/i18n";
import { t } from "i18next";
import BigNumber from "@/components/common/bigNumber";

export default function Home() {
  const router = useRouter();

  const triggerRef = useRef(null) as any;

  const { userData, refresh } = useAuth() as any;

  const [user, loading] = useAuthState(auth) as any;

  const [hasNotice, setHasNotice] = useState(null) as any;

  const [dashboard, setDashboard] = useState(null) as any;

  useEffect(() => {
    if (!userData) return;

    if (userData?.has_notice !== undefined) setHasNotice(userData?.has_notice);
  }, [userData]);

  useEffect(() => {
    refresh();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userData?.notices) return;

    const tasks = [];

    for (const notice of userData?.notices) {
      tasks.push(...notice?.tasks);
    }

    const finishedTasks = tasks.filter((task) => task?.is_finished);
    const pendingTasks = tasks.filter((task) => !task?.is_finished);
    const totalHours = finishedTasks?.length
      ? finishedTasks.reduce((total, task) => total + task?.hours, 0)
      : 0;

    const today_weekday = new Date().getDay() - 1;

    const todayPendingTasks = pendingTasks.filter(
      (task) => task.day === today_weekday
    );

    // get most studied subject
    const subjects = {} as any;

    for (const task of finishedTasks) {
      const subject = task.subject;
      console.log(task, subject);
      if (!subjects[subject]) {
        subjects[subject] = 0;
      }
      subjects[subject] += task.hours;
    }

    const mostStudiedSubject = Object.keys(subjects).length
      ? Object.keys(subjects).reduce((a, b) => {
          return subjects[a] > subjects[b] ? a : b;
        })
      : null;

    setDashboard({
      finishedTasks,
      pendingTasks,
      todayPendingTasks,
      mostStudiedSubject,
      totalHours,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.notices]);

  return (
    <div className="flex gap-5 text-neutral-50 w-full px-10 h-[calc(100vh-112px)] pb-4 tablet:px-3 tablet:flex-col">
      {hasNotice && (
        <div className="flex flex-col gap-5 text-neutral-50 w-full">
          <div className="flex gap-3 text-neutral-50 w-full items-center">
            <div className="flex flex-col gap-1 text-neutral-50 w-full">
              <h1 className="text-2xl font-bold text-black">
                Bem vindo de volta, {userData?.full_name}!
              </h1>
              <span className="text-sm text-gray-400">
                Confira suas estatísticas dessa semana:
              </span>
            </div>
          </div>

          <div className="flex gap-5 flex-wrap w-full">
            <BigNumber
              label="Tarefas concluídas"
              value={dashboard?.finishedTasks.length}
            />
            <BigNumber
              label="Tarefas pendentes"
              value={dashboard?.pendingTasks.length}
            />
            <BigNumber label="Horas estudadas" value={dashboard?.totalHours} />
            <BigNumber
              label="Matéria mais estudada"
              value={dashboard?.mostStudiedSubject}
            />
          </div>

          <div className="flex flex-col gap-3 w-full mt-5">
            <span className="text-md text-gray-700 font-bold">
              Suas tarefas para hoje:
            </span>

            <div className="flex gap-5 flex-wrap w-full">
              {dashboard?.todayPendingTasks.map((task: any) => (
                <div
                  className="flex tablet:max-w-full tablet:w-full max-w-[300px] flex-col gap-4 p-3 border border-neutral-500 rounded-sm transition-all hover:bg-neutral-200"
                  key={task.id}
                >
                  <div className="flex flex-col gap-1 break-words select-none">
                    <h3 className="text-lg font-bold text-black leading-5 select-none">
                      {task.title}
                    </h3>
                    <h4 className="text-sm font-bold text-neutral-500 select-none">
                      {task.subject}
                    </h4>
                  </div>

                  <p className="text-sm text-neutral-500 select-none">
                    {task.description.length > 100
                      ? task.description.substring(0, 100) + "..."
                      : task.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5 text-neutral-50 w-full">
        <div className="flex gap-3 text-neutral-50 w-full items-center">
          <h1 className="text-2xl font-bold text-black">
            {t("dashboard.competitive-exams")}
          </h1>

          <Plus
            size={20}
            color="black"
            className="cursor-pointer"
            onClick={() => triggerRef.current.click()}
          />
        </div>

        <NoticeUpload
          hasNotice={hasNotice}
          setHasNotice={setHasNotice}
          triggerRef={triggerRef}
        />

        {hasNotice ? <NoticeList /> : null}
      </div>

      {/* <Link href="/common/payments">
        <span className="text-black underline flex gap-2">
          {t("dashboard.payments")} <Link2 />
        </span>
      </Link> */}
    </div>
  );
}
