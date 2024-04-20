"use client";

import { Code, File, Notebook } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center gap-5 justify-between p-24 text-neutral-50">
      <h1>what do you need?</h1>

      <div className="grid-cols-3 gap-4 grid"></div>
    </main>
  );
}
