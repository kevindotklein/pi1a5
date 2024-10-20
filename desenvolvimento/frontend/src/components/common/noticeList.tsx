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
import { BookMarked, Component } from "lucide-react";

export default function NoticeList() {
  const router = useRouter();

  const { userData } = useAuth() as any;

  const [user, loading] = useAuthState(auth) as any;

  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-col gap-4 text-black w-full ">
      {userData?.notices?.length ? (
        <div className="flex flex-col gap-4 justify-center w-full max-w-[800px] tablet:w-full tablet:max-w-full">
          {userData.notices.map((notice: any) => (
            <div
              key={notice.id}
              className="flex flex-col gap-3 p-4 border border-neutral-800 rounded-lg w-[50%] cursor-pointer hover:bg-neutral-200 transition-all tablet:max-w-full tablet:w-full"
              onClick={() => {
                router.push("/common/tasks/" + notice.id);
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
                    {notice.tasks.length} {t("notice-list.tasks")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>{t("notice-list.no-notices")}</p>
      )}
    </div>
  );
}
