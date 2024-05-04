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
    <div className="flex flex-col items-center gap-5 justify-between text-neutral-50 w-full">
      <h1></h1>

      {!hasNotice && hasNotice !== null ? (
        <NoticeUpload setHasNotice={setHasNotice} />
      ) : (
        <NoticeList />
      )}

      <Link href="/common/payments">
        <span className="text-neutral-50 underline flex gap-2">
          payments <Link2 />
        </span>
      </Link>
    </div>
  );
}
