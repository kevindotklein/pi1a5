"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onDrop: (day: number, prio: number) => void;
  day: number;
  prio: number;
  isEmpty: boolean | undefined;
}

export default function DropArea({
  onDrop,
  day,
  prio,
  isEmpty = false,
}: Props) {
  const [showDrop, setShowDrop] = useState(false) as any;

  return (
    <div className="flex flex-col gap-2 w-full relative">
      <div
        onDragEnter={() => setShowDrop(true)}
        onDragLeave={() => setShowDrop(false)}
        onDrop={() => {
          onDrop(day, prio);
          setShowDrop(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        className={`w-full ${isEmpty ? "h-[600px]" : "h-[100px]"} absolute ${
          !isEmpty && "top-[-25px]"
        } left-0`}
      ></div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.5 }}
        className={`w-full h-1 ${showDrop ? " bg-slate-500 z-10" : ""}`}
      ></motion.div>
    </div>
  );
}
