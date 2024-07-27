import { useState } from "react";

interface Props {
  onDrop: (day: number, prio: number) => void;
  day: number;
  prio: number;
}

export default function DropArea({ onDrop, day, prio }: Props) {
  const [showDrop, setShowDrop] = useState(false) as any;

  return (
    <div
      className={`border border-red-600 w-4/5 h-6 ${
        showDrop ? "bg-red-600" : "bg-slate-500"
      }`}
      onDragEnter={() => setShowDrop(true)}
      onDragLeave={() => setShowDrop(false)}
      onDrop={() => {
        onDrop(day, prio);
        setShowDrop(false);
      }}
      onDragOver={e => e.preventDefault()}
    ></div>
  );
}
