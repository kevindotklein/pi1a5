"use client";

import Loading from "@/components/common/loading";
import NoticeUpload from "@/components/common/noticeUpload";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/user";
import { auth, firestore } from "@/firebase/config";
import { signOut } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { BookMarked, Component } from "lucide-react";
import { collection, orderBy, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import NoticeRetry from "./noticeRetry";

export default function NoticeList() {
  const router = useRouter();

  const { userData } = useAuth() as any;

  const [user] = useAuthState(auth) as any;

  const triggerRef = useRef(null) as any;

  const noticeRef = collection(firestore, "notices");
  const noticeQuery = query(noticeRef, where("user_uid", "==", user.uid));
  const [noticeSnap, loading, error] = useCollection(noticeQuery, {});

  const [notices, setNotices] = useState(null) as any;
  const [noticeSelected, setNoticeSelected] = useState(null) as any;

  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!noticeSnap) return;

    const noticeData = noticeSnap?.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (noticeData) setNotices(noticeData);
  }, [noticeSnap]);

  if (loading) return <Loading />;

  return (
    <>
      <NoticeRetry triggerRef={triggerRef} notice={noticeSelected} />

      <div className="flex flex-col gap-4 text-black w-full ">
        {notices?.length ? (
          <div className="flex flex-col gap-4 justify-center w-full max-w-[800px] tablet:w-full tablet:max-w-full">
            {notices.map((notice: any) => (
              <div
                key={notice.id}
                className={`flex flex-col gap-3 p-4 border bg-white border-neutral-800 rounded-lg w-[50%] cursor-pointer hover:bg-neutral-200 transition-all tablet:max-w-full tablet:w-full ${
                  !notice.processed && notice.error === null
                    ? `opacity-50 cursor-not-allowed pointer-events-none animate-pulse`
                    : ``
                }`}
                onClick={() => {
                  if (!notice.processed || notice.error) {
                    setNoticeSelected(notice);
                    return triggerRef.current.click();
                  }

                  router.push("/common/tasks/" + notice.id);
                }}
              >
                <div key={notice.id} className="flex flex-col gap-1">
                  <p
                    className={`text-lg ${
                      notice.processed && notice.error === null
                        ? `text-blue-600`
                        : `text-neutral-400`
                    } font-bold flex gap-1 items-center cursor-pointer hover:text-blue-800`}
                  >
                    <BookMarked size={20} /> {notice.name}
                  </p>

                  <div className="flex items-center w-full justify-between">
                    {notice.processed && notice.error === null ? (
                      <span className="text-sm text-neutral-400">
                        {t("notice-list.uploaded-at")}{" "}
                        {moment(notice.created_at).format("DD/MM/YYYY HH:mm")}
                      </span>
                    ) : notice.error ? (
                      <span className="text-sm text-red-600">
                        Houve um erro ao processar o arquivo. Clique aqui para
                        tentar novamente.
                      </span>
                    ) : (
                      <span className="text-sm text-neutral-400">
                        Aguarde, estamos carregando as informações...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>{t("notice-list.no-notices")}</p>
        )}
      </div>
    </>
  );
}
