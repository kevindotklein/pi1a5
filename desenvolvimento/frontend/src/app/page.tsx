"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, GraduationCap } from "lucide-react";
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
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 transition-all bg-blue-100">
      <div className="flex flex-col h-full gap-10 rounded-md bg-blue-800 border-white border-2 p-10 tablet:w-[400px]">
        <div className="flex gap-3 items-start">
          <GraduationCap size={40} color="white" />

          <h1 className="text-white font-bold text-3xl">studyflow</h1>
        </div>

        <div className="flex gap-10 h-full items-start">
          <div className="flex gap-5 items-start flex-col">
            <div className="flex gap-1 items-start flex-col">
              <span className="text-white font-medium">
                Precisa de ajuda para organizar seus estudos?
              </span>
              <h3 className="text-white font-black text-4xl">
                Deixa com a gente!
              </h3>
            </div>

            <div className="flex flex-col gap-1 items-start mt-10">
              <div className="flex flex-col gap-1 items-center justify-center">
                <h3 className="text-white">{t("home.starting-message")}</h3>
              </div>

              <div className="flex gap-1 items-start">
                <Link href="/auth/register">
                  <Button
                    variant="outline"
                    style={{
                      backgroundColor: "#0D4290",
                      color: "white",
                      borderRadius: "10px",
                    }}
                  >
                    Criar uma conta
                  </Button>
                </Link>

                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    style={{
                      backgroundColor: "white",
                      color: "#0D4290",
                      borderRadius: "10px",
                    }}
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex gap-5 items-start flex-col border-l-white border-l-2 pl-10">
            <div className="flex gap-2 items-center">
              <h2 className="text-white font-extrabold text-4xl">1.</h2>
              <span className="text-white font-medium">Crie sua conta</span>
            </div>

            <div className="flex gap-2 items-center">
              <h2 className="text-white font-extrabold text-4xl">2.</h2>
              <span className="text-white font-medium">
                Faça o <strong>upload</strong> de um edital, ou escreva o
                conteúdo da sua prova.
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <h2 className="text-white font-extrabold text-4xl">3.</h2>
              <span className="text-white font-medium">
                Controle o tempo que você irá estudar na semana.
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <h2 className="text-white font-extrabold text-4xl">4.</h2>
              <span className="text-white font-bold text-xl">
                Deixe que a gente gere suas tarefas de estudo!
              </span>
            </div>
          </div>
        </div>

        <h3 className="text-white text-sm mt-5">
          {t("home.footer-message-1")}{" "}
          <a
            href="https://github.com/kevindotklein/pi1a5"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-100"
          >
            <strong>NOZ</strong>
          </a>{" "}
          {t("home.footer-message-2")}
        </h3>
      </div>
    </main>
  );
}
