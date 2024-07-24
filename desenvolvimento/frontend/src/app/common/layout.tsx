"use client";

import Loading from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/user";
import { auth } from "@/firebase/config";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import "../../locales/i18n";
import { useTranslation } from "react-i18next";

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const { logout, userData } = useAuth() as any;

  const [user, loading] = useAuthState(auth) as any;

  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/auth/login");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  if (loading)
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-neutral-100">
        loading...
      </div>
    );

  if (loading) return <Loading />;

  return (
    <main className="flex flex-col items-center justify-center">
      <div className="flex gap-4 items-center justify-between bg-blue-700 w-full pt-2 pr-6 pb-2 pl-6">
        <span
          className="text-lg font-bold text-white cursor-pointer"
          onClick={() => router.push("/common/dashboard")}
        >
          studyflow
        </span>
        <div className="flex gap-4 items-center">
          <Image
            src={user?.photoURL || "/favicon.ico"}
            alt="user avatar"
            width={30}
            height={30}
            className="rounded-full"
          />
          <span className="text-lg font-bold text-white">
            {userData?.full_name || userData?.displayName || userData?.email}
          </span>

          <Button
            onClick={async () => {
              logout();
            }}
            variant="link"
            className="text-white"
          >
            {t("auth-user-layout.logout-button")}
          </Button>
        </div>
      </div>

      {children}
    </main>
  );
}
