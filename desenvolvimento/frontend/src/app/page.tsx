"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "../locales/i18n";
import { useTranslation } from "react-i18next";

export default function Home() {
  const router = useRouter();
  const [note, setNote] = useState("note/");
  const { t, i18n } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 transition-all">
      <h1 className="text-black font-bold">studyflow</h1>
      <h3 className="text-blue-800">{t("home.slogan")}</h3>

      <div className="flex flex-col gap-1 items-center justify-center mx-5">
        <h3 className="text-black">{t("home.starting-message")}</h3>
      </div>

      <Link href="/auth/login">
        <Button
          variant="outline"
          style={{
            backgroundColor: "#0D4290",
            color: "white",
            borderRadius: "10px",
          }}
        >
          {t("home.login-button")}
        </Button>
      </Link>

      <h3 className="text-black text-sm mt-5">
        {t("home.footer-message-1")}{" "}
        <a
          href="https://github.com/PedroDias-Dev"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-700"
        >
          <strong>noz</strong>
        </a>{" "}
        {t("home.footer-message-2")}
      </h3>
    </main>
  );
}
