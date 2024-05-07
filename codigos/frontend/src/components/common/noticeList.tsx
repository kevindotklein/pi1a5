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

export default function NoticeList() {
  const router = useRouter();

  const { userData } = useAuth() as any;

  const [user, loading] = useAuthState(auth) as any;

  const { t, i18n } = useTranslation();

  console.log(userData);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 text-black w-full ">
      <h2>{t("notice-list.title")}</h2>

      {userData?.notices?.length ? (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          {userData.notices.map((notice: any) => (
            <div
              key={notice.id}
              className="flex flex-col gap-3 p-4 border border-neutral-800 rounded-lg w-[50%]"
            >
              <div key={notice.id} className="flex flex-col gap-1">
                <p className="text-lg text-blue-600 cursor-pointer hover:text-blue-800">
                  {notice.name}
                </p>
                <span className="text-sm text-neutral-400">
                  {notice.file_name} - {t("notice-list.uploaded-at")}{" "}
                  {moment(notice.created_at).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>

              <p>{t("notice-list.subj-and-contents")}</p>

              <div className="flex flex-col gap-4 w-full flex-wrap">
                {notice.subjects.map((subject: any) => (
                  <div
                    key={subject.id}
                    className="flex flex-col gap-3 p-4 border border-neutral-500 rounded-sm"
                  >
                    <p className="text-lg text-neutral-800">{subject.name}</p>

                    {subject.contents.map((content: any) => (
                      <div
                        key={content}
                        className="flex flex-col gap-1 p-2 border border-neutral-600 rounded-sm"
                      >
                        <p className="text-sm text-black">{content}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>no notices yet...</p>
      )}
    </div>
  );
}
