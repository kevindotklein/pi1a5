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

  const { logout } = useAuth() as any;

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

  console.log('asdkajl');


  consd

  return (
    <main className="flex flex-col items-center justify-center p-4">
      <div className="flex gap-4 items-center justify-center">
        <Image
          src={user?.photoURL || "/favicon.ico"}
          alt="user avatar"
          width={50}
          height={50}
          className="rounded-full"
        />
        <span className="text-lg font-bold text-black">
          {user?.displayName || user?.email}
        </span>

        <Button
          onClick={async () => {
            logout();
          }}
          style={{
            backgroundColor: "#0D4290",
            color: "white",
            borderRadius: "10px",
            minWidth: "80px",
          }}
        >
          {t("auth-user-layout.logout-button")}
        </Button>
      </div>

      {children}
    </main>
  );
}
