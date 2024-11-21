"use client";

import Loading from "@/components/common/loading";
import { auth } from "@/firebase/config";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import "../../locales/i18n";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Header from "@/components/common/header";
import NotificationProvider from "@/contexts/notification";

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname() as any;

  const [user, loading] = useAuthState(auth) as any;

  const { t } = useTranslation();

  const routes = {
    "/common/dashboard": "Dashboard",
    "/common/tasks": "Tarefas",
    "/common/payments": "Pagamentos",
  } as any;

  const getCurrentRouteName = (pathname: string) => {
    let name;

    for (const key of Object.keys(routes)) {
      if (pathname.includes(key)) {
        name = routes[key];
      }
    }

    return name;
  };

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
        {t("auth-user-layout.loading")}
      </div>
    );

  if (loading) return <Loading />;

  if (!user) return null;

  return (
    <NotificationProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.75 }}
      >
        <main className="flex flex-col items-center justify-center">
          <Header />

          <div className="flex gap3 items-center gap-1.5 py-4 px-10 w-full transition-all tablet:px-3">
            {pathname !== "/common/dashboard" ? (
              <ChevronLeft
                size={15}
                color="black"
                onClick={() => router.back()}
                className="cursor-pointer"
              />
            ) : null}

            <h3 className="text-md font-medium text-black cursor-pointer">
              Home /
            </h3>
            <h3 className="text-md font-bold text-blue-700">
              {getCurrentRouteName(pathname)}
            </h3>
          </div>

          {children}
        </main>
      </motion.div>
    </NotificationProvider>
  );
}
