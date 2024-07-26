"use client";

import Loading from "@/components/common/loading";
import NoticeUpload from "@/components/common/noticeUpload";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/user";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import moment from "moment";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRef } from "react";
import Subject from "./subject";
import { BookMarked, Component } from "lucide-react";

export default function NoticeList() {
  const router = useRouter();
  const triggerRef = useRef(null) as any;

  const { userData } = useAuth() as any;

  const [user, loading] = useAuthState(auth) as any;

  const { t, i18n } = useTranslation();

  const [noticeOpen, setNoticeOpen] = useState(false) as any;

  return (
    <div className="flex flex-col gap-4 text-black w-full ">
      {userData?.notices?.length ? (
        <div className="flex flex-col gap-4 justify-center w-full max-w-[800px]">
          {userData.notices.map((notice: any) => (
            <div
              key={notice.id}
              className="flex flex-col gap-3 p-4 border border-neutral-800 rounded-lg w-[50%] cursor-pointer hover:bg-neutral-200 transition-all"
              onClick={() => {
                setNoticeOpen(notice);
                triggerRef.current?.click();
              }}
            >
              <div key={notice.id} className="flex flex-col gap-1">
                <p className="text-lg text-blue-600 font-bold flex gap-1 items-center cursor-pointer hover:text-blue-800">
                  <BookMarked size={20} /> {notice.name}
                </p>

                <div className="flex items-center w-full justify-between">
                  <span className="text-sm text-neutral-400">
                    {t("notice-list.uploaded-at")}{" "}
                    {moment(notice.created_at).format("DD/MM/YYYY HH:mm")}
                  </span>

                  <span className="text-sm text-neutral-500 font-medium">
                    {notice.tasks.length} tarefas
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>no notices yet...</p>
      )}

      <Dialog>
        <DialogTrigger ref={triggerRef} />

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

          <div className="flex w-full py-4 gap-4 justify-end">
            <Button
              variant="secondary"
              style={{
                backgroundColor: "#0D4290",
                color: "white",
                borderRadius: "10px",
              }}
              onClick={() => {
                router.push("/common/tasks/" + noticeOpen.id);
              }}
            >
              Ver suas tarefas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
