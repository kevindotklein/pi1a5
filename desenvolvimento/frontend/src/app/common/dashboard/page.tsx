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

export default function Home() {
  const router = useRouter();

  const triggerRef = useRef(null) as any;

  const { userData, refresh } = useAuth() as any;

  const [user, loading] = useAuthState(auth) as any;

  const [hasNotice, setHasNotice] = useState(null) as any;

  useEffect(() => {
    if (!userData) return;

    if (userData?.has_notice !== undefined) setHasNotice(userData?.has_notice);
  }, [userData]);

  useEffect(() => {
    refresh();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-5 justify-between text-neutral-50 w-full px-10 h-[calc(100vh-112px)] pb-4 tablet:px-3">
      <div className="flex flex-col gap-5 text-neutral-50 w-full">
        <div className="flex gap-3 text-neutral-50 w-full items-center">
          <h1 className="text-2xl font-bold text-black">{t("dashboard.competitive-exams")}</h1>

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

      <Link href="/common/payments">
        <span className="text-black underline flex gap-2">
          {t("dashboard.payments")} <Link2 />
        </span>
      </Link>
    </div>
  );
}
