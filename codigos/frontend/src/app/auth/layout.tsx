"use client";

import Loading from "@/components/common/loading";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (user && !loading) {
      router.push("/common/dashboard");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) return <Loading />;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center justify-center gap-4 rounded-md bg-neutral-800 p-6">
        {children}
      </div>
    </main>
  );
}
