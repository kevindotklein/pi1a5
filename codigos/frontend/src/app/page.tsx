"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [note, setNote] = useState("note/");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-neutral-50 font-bold">studyflow</h1>
      <h3 className="text-teal-400">
        your way of studying
      </h3>

      <div className="flex flex-col gap-1 items-center justify-center mx-5">
        <h3 className="text-neutral-50">
          get started here:
        </h3>
      </div>

      <Link href="/auth/login">
        <Button variant="outline">login</Button>
      </Link>

      <h3 className="text-neutral-50 text-sm mt-5">
        made by{" "}
        <a
          href="https://github.com/PedroDias-Dev"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-teal-500"
        >
          <strong>noz</strong>
        </a>{" "}
        for noz usage only
      </h3>
    </main>
  );
}
