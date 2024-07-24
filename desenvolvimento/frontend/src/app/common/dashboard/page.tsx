"use client";

import NoticeList from "@/components/common/noticeList";
import NoticeUpload from "@/components/common/noticeUpload";
import { useAuth } from "@/contexts/user";
import { auth } from "@/firebase/config";
import { Link2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import "../../../locales/i18n";
import { t } from "i18next";

export default function Home() {
  const router = useRouter();

  const { userData, logout } = useAuth() as any;

  const [user, loading] = useAuthState(auth) as any;

  const [hasNotice, setHasNotice] = useState(null) as any;

  useEffect(() => {
    if (!userData) return;

    setHasNotice(userData.has_notice);
  }, [userData]);

  return (
    <div className="flex flex-col gap-5 justify-between text-neutral-50 w-full p-10 h-[calc(100vh-56px)]">
      {!hasNotice && hasNotice !== null ? (
        <NoticeUpload setHasNotice={setHasNotice} />
      ) : (
        <div className="flex flex-col gap-5 text-neutral-50 w-full">
          <h1 className="text-2xl font-bold text-black">Seus Concursos</h1>

          <NoticeList />
        </div>
      )}

      <Link href="/common/payments">
        <span className="text-black underline flex gap-2">
          {t("dashboard.payments")} <Link2 />
        </span>
      </Link>
    </div>
  );
}
