"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function Subject({ subject }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div
      key={subject.id}
      className="flex flex-col gap-3 p-4 border border-neutral-500 rounded-sm w-full"
      onClick={() => {
        setOpen(!open);
      }}
    >
      <div className="flex gap-1 items-center w-full justify-between">
        <p className="text-lg text-blue-600 font-bold">{subject.name}</p>

        <div className="cursor-pointer">
          {open ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>

      {open
        ? subject.contents.map((content: any) => (
            <div
              key={content}
              className="flex flex-col gap-1 p-2 bg-neutral-200 rounded-sm"
            >
              <p className="text-sm text-black">{content}</p>
            </div>
          ))
        : null}
    </div>
  );
}
